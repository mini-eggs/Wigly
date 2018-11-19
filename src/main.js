import { h as createElement, patch } from "superfine";

let COMPONENT_WRAPPER = "λ"; // Don't pass components directly to Superfine, it impact our ability to support async/lazy components.

let current; // Currentyl executing component for hooks.

export let render = (f, el) => {
  return new Promise(resolve => {
    let last = null;
    (function render() {
      transform(
        f,
        vdom => {
          last = patch(last, vdom, el);
          resolve(last.element);
        },
        render
      );
    })();
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

let transform = async (spec, connected, update, reset) => {
  if (!spec.args) return connected(spec, {}); // this is a text/leaf node

  let vdom;

  let register = () => {
    current = {
      ...spec,
      internal: {
        ...spec.internal,
        update: () => {
          update(spec.internal.state);
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
    let updating = false;
    let updateQueue = [];

    async function runFirstUpdate() {
      await updateQueue.shift()();
      if (updateQueue.length > 0) {
        await runFirstUpdate();
      }
    }

    promises.push(
      (function work(tree) {
        if (tree.args) {
          let states;
          if (!(states = spec.internal.children[tree.args.f])) {
            states = spec.internal.children[tree.args.f] = {};
          }
          if (states[tree.args.props.key]) {
            tree.internal.state = states[tree.args.props.key];
          }
        }
        return new Promise(resolve =>
          transform(
            tree,
            function connected(childVDOM) {
              resolve((vdom.children[key] = childVDOM));
            },
            async function update(state) {
              if (updating) {
                updateQueue.push(() => update(state));
                return;
              }

              updating = true;

              let prev = vdom.children[key];
              if (prev.args) {
                spec.internal.children[tree.args.f][tree.args.props.key] = state;
              }
              let next = await work(prev);
              vdom.children[key] = patch(prev, next, prev.element.parentElement);

              updating = false;

              if (updateQueue.length > 0) {
                await runFirstUpdate();
              }
            },
            function reset() {
              let prev = vdom.children[key];
              if (prev.args) {
                spec.internal.children[tree.args.f][tree.args.props.key] = [];
              }
            }
          )
        );
      })(vdom.children[key])
    );
  }

  let notifyParent = () => {
    connected(
      Object.assign(vdom, {
        args: spec.args,
        internal: spec.internal,
        props: {
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
            reset();
            spec.internal.active = false;
            for (let key in spec.internal.effects) {
              let { cleanup } = spec.internal.effects[key];
              if (cleanup) cleanup();
            }
          }
        }
      })
    );
  };

  await Promise.all(promises);

  if (vdom.name === COMPONENT_WRAPPER) {
    return transform(
      vdom,
      next => {
        vdom = next;
        notifyParent();
      },
      update
    );
  }

  notifyParent();
};

export default { render, state, effect, h };
