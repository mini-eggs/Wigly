import { defer, setCurrentlyExecutingComponent, traverse } from "./constants";
import { runEffects } from "./effect";
import { h, patch } from "../../node_modules/superfine/src/index.js";

export let transformer = (spec, getEnv, giveEnv, giveVDOM, updateVDOM) => {
  if (typeof spec === "string" || typeof spec === "number") {
    giveVDOM(spec);
    return;
  }

  let { f, props, children = [] } = spec;

  children = children.filter(item => typeof item !== "undefined");

  if (typeof f === "function") {
    let lastvdom;

    let self = {
      states: [],
      effects: [],
      children: {},
      ...getEnv(f, props.key),
      env: () => getEnv(f, props.key),
      iter: 0,
      update: () => {
        // Fishy business -- we have references to old updater functions
        // within state setters. Don't call these! Get latest and all is well. :)
        let { env } = getEnv(f, props.key);
        if (env && env().update !== self.update) {
          env().update();
          return;
        }

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
      }
    };

    setCurrentlyExecutingComponent(self);

    let res = f({ ...props, children });

    let work = () => {
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
