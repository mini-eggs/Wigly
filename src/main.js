import { h as createElement, patch } from "superfine";

// global
let current;

// util
let defer = Promise.resolve().then.bind(Promise.resolve());

let debounce = f => {
  let inst;
  return () => {
    clearTimeout(inst);
    inst = setTimeout(f);
  };
};

// funcs
let runEffects = (el, self) => {
  for (let key in self.effects) {
    let effect = self.effects[key];
    if (
      effect &&
      (typeof effect.prev === "undefined" || effect.args.length === 0 || effect.prev.join() !== effect.args.join())
    ) {
      if (effect.cleanup) effect.cleanup();
      self.effects[key] = { prev: effect.args, cleanup: effect.f(el) };
    }
  }
};

let traverse = (tree, f) => {
  Object.assign(tree, f(tree));
  if (tree.children) {
    for (let key in tree.children) {
      tree.children[key] = traverse(tree.children[key], f);
    }
  }
  return tree;
};

let transformer = async (spec, getEnv, giveEnv, giveVDOM, updateVDOM) => {
  if (typeof spec === "string" || typeof spec === "number") {
    giveVDOM(spec);
    return;
  }

  let { f, props, children = [] } = spec;

  children = children.filter(item => !!item);

  if (typeof f === "function") {
    let lastvdom;

    let self = {
      f,
      states: [],
      effects: [],
      children: {},
      ...getEnv(f, props.key),
      iter: 0,
      update: debounce(() => {
        transformer(
          spec,
          getEnv,
          giveEnv,
          next => {
            if (lastvdom && lastvdom.element && lastvdom.element.parentElement) {
              lastvdom = patch(lastvdom, next, lastvdom.element.parentElement);
            }
          },
          updateVDOM
        );
      })
    };

    current = self;
    let res = f({ ...props, children });

    if (res instanceof Promise) {
      let file = await res;
      current = self;
      res = file.default({ ...props, children });
    }

    transformer(
      res,
      (component, key) => {
        return self.children[component] ? self.children[component][key] : {};
      },
      (component, key, env) => {
        self.children[component] = { ...self.children[component], [key]: env };
      },
      vdom => {
        let { oncreate, onupdate, ondestroy } = { ...vdom.props };
        giveVDOM(
          (lastvdom = Object.assign(vdom, {
            props: {
              ...vdom.props,
              oncreate: el => {
                if (oncreate) oncreate(el);
                defer(() => {
                  runEffects(el, self);
                  giveEnv(f, props.key, self);
                });
              },
              onupdate: el => {
                if (onupdate) onupdate(el);
                defer(() => {
                  updateVDOM(f, props.key, lastvdom);
                  runEffects(el, self);
                  giveEnv(f, props.key, self);
                });
              },
              ondestroy: () => {
                if (ondestroy) ondestroy();
                for (let effect of self.effects) {
                  if (effect && effect.cleanup) {
                    effect.cleanup();
                  }
                }
                giveEnv(f, props.key, {}); // reset state
              }
            },
            internal: { f, self }
          }))
        );
      },
      (component, key, vdom) => {
        Object.assign(
          lastvdom,
          traverse(lastvdom, item => {
            if (item.internal && item.internal.f === component && key === item.props.key) {
              return vdom;
            } else {
              return item;
            }
          })
        );
        // updateVDOM(f, props.key, lastvdom); // we probably need this yea?
      }
    );
  } else {
    giveVDOM(
      createElement(
        f,
        props,
        await Promise.all(
          children.map(child => {
            return new Promise(resolve => {
              transformer(child, getEnv, giveEnv, resolve, updateVDOM);
            });
          })
        )
      )
    );
  }
};

export let h = (f, props, ...children) => {
  props = props || {};
  children = [].concat.apply([], children);
  return { f, props, children };
};

export let state = init => {
  let curr = current;
  let key = curr.iter++;
  let val = curr.states[key];

  if (typeof val === "undefined") {
    if (typeof init === "function") {
      val = init();
    } else {
      val = init;
    }
  }

  return [
    val,
    next => {
      curr.states[key] = next;
      defer(curr.update);
    }
  ];
};

export let effect = (f, ...args) => {
  let key = current.iter++;
  let last = current.effects[key];
  current.effects[key] = { prev: [], ...last, f, args };
};

export let render = (f, el) => {
  let cb = () => {};

  defer(() => {
    transformer(
      f,
      () => ({}),
      () => ({}),
      vdom => {
        patch(null, vdom, el);
        cb(vdom.element);
      },
      () => {}
    );
  });

  // promise mock
  return {
    then: f => {
      cb = f;
    }
  };
};

export default { render, state, effect, h };
