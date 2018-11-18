import { h as createElement, patch } from "superfine";

let COMPONENT_WRAPPER = "λ";

let current;

export let render = (f, el) => {
  return new Promise(resolve => {
    let last = null;
    transform(f, vdom => {
      last = patch(last, vdom, el);
      resolve(last.element);
    });
  });
};

export let h = (f, props, ...children) => {
  let orig = f;
  props = props || {};

  if (typeof f === "function") {
    f = COMPONENT_WRAPPER;
  }

  return {
    ...createElement(f, props, ...children),
    args: { f: orig, props, children },
    internal: { effects: [], effectCount: 0, state: [], stateCount: 0, node: null }
  };
};

export let state = init => {
  let component = current;
  let key = component.internal.stateCount++;
  let val = component.internal.state[key];

  if (typeof val === "undefined") {
    val = init;
  }

  return [
    val,
    next => {
      component.internal.state[key] = next;
      component.internal.update();
    }
  ];
};

export let effect = (f, ...args) => {
  let key = current.internal.effectCount++;
  let last = current.internal.effects[key];
  current.internal.effects[key] = { ...last, f, args };
};

let transform = async (spec, cb) => {
  if (!spec.args) {
    return cb(spec); // this is a text node
  }

  let vdom;

  let register = () => {
    current = {
      ...spec,
      internal: {
        ...spec.internal,
        update: () => {
          spec.internal.stateCount = 0;
          spec.internal.effectCount = 0;
          transform(spec, next => {
            if (spec.internal.node.parentElement) {
              vdom = patch(vdom, next, spec.internal.node.parentElement);
            }
          });
        }
      }
    };
  };

  register();

  let runEffects = async () => {
    for (let key in spec.internal.effects) {
      let { f, args, last, cleanup } = spec.internal.effects[key];
      if (typeof last === "undefined" || args.length === 0 || last.join() !== args.join()) {
        if (cleanup) cleanup();
        spec.internal.effects[key].last = args;
        cleanup = await f(spec.internal.node);
        spec.internal.effects[key].cleanup = cleanup;
      }
    }
  };

  vdom = createElement(spec.args.f, spec.args.props, spec.args.children);

  if (vdom instanceof Promise) {
    let file = await vdom;
    register();
    vdom = createElement(file.default, spec.args.props, spec.args.children);
  }

  let promises = [];
  for (let key in vdom.children) {
    let child = vdom.children[key];

    promises.push(
      new Promise(resolve => {
        transform(child, childVDOM => {
          vdom.children[key] = childVDOM;
          resolve();
        });
      })
    );
  }

  let callback = () => {
    vdom.props = {
      ...vdom.props,
      oncreate: el => {
        spec.internal.node = el;
        runEffects();
      },
      onupdate: el => {
        spec.internal.node = el;
        runEffects();
      },
      ondestroy: () => {
        for (let key in spec.internal.effects) {
          let { cleanup } = spec.internal.effects[key];
          if (cleanup) cleanup();
        }
      }
    };
    cb(vdom);
  };

  await Promise.all(promises);

  if (vdom.name === COMPONENT_WRAPPER) {
    return transform(vdom, next => {
      vdom = next;
      callback();
    });
  }

  callback();
};

export default { render, state, effect, h };
