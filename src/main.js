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
  props.key = props.key || 0;
  if (typeof f === "function") f = COMPONENT_WRAPPER;
  return {
    ...createElement(f, props, ...children),
    args: { f: orig, props, children },
    internal: { effects: [], effectCount: 0, state: [], stateCount: 0, node: null, active: false, children: {} }
  };
};

export let state = init => {
  let component = current;
  let key = component.internal.stateCount++;
  let val = component.internal.state[key];
  if (typeof val === "undefined") val = init;
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

let transform = async (spec, cb, saveState) => {
  if (!spec.args) return cb(spec, {}); // this is a text/leaf node

  let vdom;

  let register = () => {
    current = {
      ...spec,
      internal: {
        ...spec.internal,
        update: () => {
          saveState && saveState(spec.internal.state);
          transform(
            spec,
            next => {
              if (spec.internal.node && spec.internal.node.parentElement) {
                vdom = patch(vdom, next, spec.internal.node.parentElement);
              }
            },
            saveState
          );
        }
      }
    };
  };

  register();

  let runEffects = async () => {
    if (!spec.internal.active) return;
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

    /**
     * Persist child state.
     * Yes, this is ugly.
     */
    if (child.args) {
      let states;
      if (!(states = spec.internal.children[child.args.f])) {
        states = spec.internal.children[child.args.f] = {};
      }
      if (states[child.args.props.key]) {
        child.internal.state = states[child.args.props.key];
      }
    }

    promises.push(
      new Promise(resolve => {
        transform(
          child,
          childVDOM => {
            vdom.children[key] = childVDOM;
            resolve();
          },
          state => {
            spec.internal.children[child.args.f][child.args.props.key] = state;
          }
        );
      })
    );
  }

  let callback = () => {
    vdom.props = {
      ...vdom.props,
      oncreate: el => {
        spec.internal.node = el;
        spec.internal.active = true;
        runEffects();
      },
      onupdate: el => {
        spec.internal.node = el;
        runEffects();
      },
      ondestroy: () => {
        spec.internal.active = false;
        saveState();
        for (let key in spec.internal.effects) {
          let { cleanup } = spec.internal.effects[key];
          if (cleanup) cleanup();
        }
      }
    };
    cb(Object.assign(vdom, { args: spec.args, internal: spec.internal }));
  };

  await Promise.all(promises);

  if (vdom.name === COMPONENT_WRAPPER) {
    return transform(
      vdom,
      next => {
        vdom = next;
        callback();
      },
      saveState
    );
  }

  callback();
};

export default { render, state, effect, h };
