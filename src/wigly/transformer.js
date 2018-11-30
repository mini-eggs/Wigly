import { defer, setCurrentlyExecutingComponent, runEffects, traverse } from "./constants";
import { h, patch } from "../superfine/superfine";

/**
 *
 * @param {ComponentSpec} spec
 * @param {Function} getEnv
 * @param {Function} giveEnv
 * @param {Function} giveVDOM
 * @param {Function} updateVDOM
 */
export let transformer = (spec, getEnv, giveEnv, giveVDOM, updateVDOM) => {
  if (typeof spec === "string" || typeof spec === "number") {
    giveVDOM(spec);
    return;
  }

  let { f, props, children = [] } = spec;

  children = children.filter(item => typeof item !== "undefined");

  if (typeof f === "function") {
    let lastvdom;

    /** @type {ComponentContext} */
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
          /**
           * @param {LowerVDOM} next
           */
          next => {
            if (lastvdom && lastvdom.element && lastvdom.element.parentElement) {
              lastvdom = patch(lastvdom, next, lastvdom.element.parentElement);
            }
          },
          updateVDOM
        );
      }
    };

    setCurrentlyExecutingComponent(self);

    /** @type {LowerVDOM} */
    let res = f({ ...props, children });

    let work = () => {
      transformer(
        res,
        /**
         * @param {Function} component
         * @param {*} key
         * @return {ComponentContext}
         */
        (component, key) => {
          return self.children[component] ? self.children[component][key] : {};
        },
        /**
         * @param {Function} component
         * @param {*} key
         * @param {ComponentContext} env
         */
        (component, key, env) => {
          self.children[component] = { ...self.children[component], [key]: env };
        },
        /**
         * @param {LowerVDOM} vdom
         */
        vdom => {
          let { oncreate, onupdate, ondestroy } = { ...vdom.props };
          giveVDOM(
            /** @type {UpperVDOM} */
            (lastvdom = Object.assign(vdom, {
              props: {
                ...vdom.props,
                oncreate: el => {
                  if (oncreate) {
                    oncreate(el);
                  }
                  defer(() => {
                    runEffects(el, self);
                    giveEnv(f, props.key, self);
                  });
                },
                onupdate: el => {
                  if (onupdate) {
                    onupdate(el);
                  }
                  defer(() => {
                    updateVDOM(f, props.key, lastvdom);
                    runEffects(el, self);
                    giveEnv(f, props.key, self);
                  });
                },
                ondestroy: () => {
                  if (ondestroy) {
                    ondestroy();
                  }
                  for (let effect of self.effects) {
                    if (effect && effect.cleanup) {
                      if (effect.cleanup.then) {
                        effect.cleanup.then(f => f && f());
                      } else {
                        effect.cleanup();
                      }
                    }
                  }
                  giveEnv(f, props.key, { iter: 0 }); // reset state
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
              traverse(
                lastvdom,
                /**
                 * @param {UpperVDOM} item
                 */
                item => {
                  if (item.internal && item.internal.f === component && key === item.props.key) {
                    return vdom;
                  } else {
                    return item;
                  }
                }
              )
            )
          );
        }
      );
    };

    if (res instanceof Promise) {
      res.then(file => {
        setCurrentlyExecutingComponent(self);
        res = file.default({ ...props, children });
        work();
      });
    } else {
      work();
    }
  } else {
    if (children.length < 1) {
      giveVDOM(h(f, props, children));
    } else {
      let iter = 0;
      let values = [];
      for (let key in children) {
        transformer(
          children[key],
          getEnv,
          giveEnv,
          val => {
            iter++;
            values[key] = val;
            if (iter === children.length) {
              giveVDOM(h(f, props, values));
            }
          },
          updateVDOM
        );
      }
    }
  }
};
