let superfine = require("superfine");

let current;
let defer = Promise.resolve().then.bind(Promise.resolve());

let runEffects = (el, self) => {
  for (let key in self.effects) {
    let { prev, args, f, cleanup } = self.effects[key];
    if (args && f && (typeof prev === "undefined" || args.length === 0 || prev.join() !== args.join())) {
      if (cleanup) cleanup();
      self.effects[key] = { prev: args, cleanup: f(el) };
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

  children = children.filter(item => !!item); // remove nullies

  if (typeof f === "function") {
    let lastvdom;

    let self = {
      f,
      states: [],
      effects: [],
      children: {},
      ...getEnv(f, props.key),
      iter: 0,
      update: () => {
        transformer(
          spec,
          getEnv,
          giveEnv,
          next => {
            if (lastvdom && lastvdom.element && lastvdom.element.parentElement) {
              lastvdom = superfine.patch(lastvdom, next, lastvdom.element.parentElement);
            }
          },
          updateVDOM
        );
      }
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
        updateVDOM(
          f,
          props.key,
          Object.assign(
            lastvdom,
            traverse(lastvdom, item => {
              if (item.internal && item.internal.f === component && key === item.props.key) {
                return vdom;
              } else {
                return item;
              }
            })
          )
        );
      }
    );
  } else {
    giveVDOM(
      superfine.h(
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

let h = (f, props, ...children) => ({ f, props: props || {}, children: [].concat.apply([], children) });

let state = init => {
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

let effect = (f, ...args) => {
  let key = current.iter++;
  let last = current.effects[key];
  current.effects[key] = { prev: [], ...last, f, args };
};

let render = (f, el) => {
  return new Promise(resolve => {
    transformer(
      h(() => f),
      () => ({}),
      () => ({}),
      vdom => {
        superfine.patch(null, vdom, el);
        resolve(vdom.element);
      },
      () => {}
    );
  });
};

module.exports = {
  // base
  h,
  render,
  state,
  effect,
  // react esque
  createElement: h,
  useState: state,
  useEffect: effect
};
