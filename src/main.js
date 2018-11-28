((self, f) => {
  if (typeof exports === "object" && typeof module === "object") {
    module.exports = f();
  } else if (typeof exports === "object") {
    exports["wigly"] = f();
  } else {
    self["wigly"] = f();
  }
})(window, () => {
  let superfine = (() => {
    let DEFAULT = 0;
    let RECYCLED_NODE = 1;
    let TEXT_NODE = 2;

    let XLINK_NS = "http://www.w3.org/1999/xlink";
    let SVG_NS = "http://www.w3.org/2000/svg";

    let EMPTY_OBJECT = {};
    let EMPTY_ARRAY = [];

    let map = EMPTY_ARRAY.map;
    let isArray = Array.isArray;

    let merge = function(a, b) {
      let target = {};
      for (let i in a) target[i] = a[i];
      for (let i in b) target[i] = b[i];
      return target;
    };

    let eventProxy = event => event.currentTarget.events[event.type](event);

    let updateProperty = (element, name, lastValue, nextValue, isSvg) => {
      if (name === "key") {
      } else if (name === "style") {
        for (let i in merge(lastValue, nextValue)) {
          let style = nextValue == null || nextValue[i] == null ? "" : nextValue[i];
          if (i[0] === "-") {
            element[name].setProperty(i, style);
          } else {
            element[name][i] = style;
          }
        }
      } else {
        if (name[0] === "o" && name[1] === "n") {
          if (!element.events) element.events = {};

          element.events[(name = name.slice(2))] = nextValue;

          if (nextValue == null) {
            element.removeEventListener(name, eventProxy);
          } else if (lastValue == null) {
            element.addEventListener(name, eventProxy);
          }
        } else {
          let nullOrFalse = nextValue == null || nextValue === false;

          if (
            name in element &&
            name !== "list" &&
            name !== "draggable" &&
            name !== "spellcheck" &&
            name !== "translate" &&
            !isSvg
          ) {
            element[name] = nextValue == null ? "" : nextValue;
            if (nullOrFalse) {
              element.removeAttribute(name);
            }
          } else {
            let ns = isSvg && name !== (name = name.replace(/^xlink:?/, ""));
            if (ns) {
              if (nullOrFalse) {
                element.removeAttributeNS(XLINK_NS, name);
              } else {
                element.setAttributeNS(XLINK_NS, name, nextValue);
              }
            } else {
              if (nullOrFalse) {
                element.removeAttribute(name);
              } else {
                element.setAttribute(name, nextValue);
              }
            }
          }
        }
      }
    };

    let createElement = (node, lifecycle, isSvg) => {
      let element =
        node.type === TEXT_NODE
          ? document.createTextNode(node.name)
          : (isSvg = isSvg || node.name === "svg")
          ? document.createElementNS(SVG_NS, node.name)
          : document.createElement(node.name);

      let props = node.props;
      if (props.oncreate) {
        lifecycle.push(() => {
          props.oncreate(element);
        });
      }

      for (let i = 0, length = node.children.length; i < length; i++) {
        element.appendChild(createElement(node.children[i], lifecycle, isSvg));
      }

      for (let name in props) {
        updateProperty(element, name, null, props[name], isSvg);
      }

      return (node.element = element);
    };

    let updateElement = (element, lastProps, nextProps, lifecycle, isSvg, isRecycled) => {
      for (let name in merge(lastProps, nextProps)) {
        if ((name === "value" || name === "checked" ? element[name] : lastProps[name]) !== nextProps[name]) {
          updateProperty(element, name, lastProps[name], nextProps[name], isSvg);
        }
      }

      let cb = isRecycled ? nextProps.oncreate : nextProps.onupdate;
      if (cb != null) {
        lifecycle.push(() => {
          cb(element, lastProps);
        });
      }
    };

    let removeChildren = node => {
      for (let i = 0, length = node.children.length; i < length; i++) {
        removeChildren(node.children[i]);
      }

      let cb = node.props.ondestroy;
      if (cb != null) {
        cb(node.element);
      }

      return node.element;
    };

    let removeElement = (parent, node) => {
      let remove = () => {
        parent.removeChild(removeChildren(node));
      };

      let cb = node.props && node.props.onremove;
      if (cb != null) {
        cb(node.element, remove);
      } else {
        remove();
      }
    };

    let getKey = node => (node == null ? null : node.key);

    let createKeyMap = (children, start, end) => {
      let out = {};
      let key;
      let node;

      for (; start <= end; start++) {
        if ((key = (node = children[start]).key) != null) {
          out[key] = node;
        }
      }

      return out;
    };

    let patchElement = (parent, element, lastNode, nextNode, lifecycle, isSvg) => {
      if (nextNode === lastNode) {
      } else if (lastNode != null && lastNode.type === TEXT_NODE && nextNode.type === TEXT_NODE) {
        if (lastNode.name !== nextNode.name) {
          element.nodeValue = nextNode.name;
        }
      } else if (lastNode == null || lastNode.name !== nextNode.name) {
        let newElement = parent.insertBefore(createElement(nextNode, lifecycle, isSvg), element);

        if (lastNode != null) removeElement(parent, lastNode);

        element = newElement;
      } else {
        updateElement(
          element,
          lastNode.props,
          nextNode.props,
          lifecycle,
          (isSvg = isSvg || nextNode.name === "svg"),
          lastNode.type === RECYCLED_NODE
        );

        let savedNode;
        let childNode;

        let lastKey;
        let lastChildren = lastNode.children;
        let lastChStart = 0;
        let lastChEnd = lastChildren.length - 1;

        let nextKey;
        let nextChildren = nextNode.children;
        let nextChStart = 0;
        let nextChEnd = nextChildren.length - 1;

        while (nextChStart <= nextChEnd && lastChStart <= lastChEnd) {
          lastKey = getKey(lastChildren[lastChStart]);
          nextKey = getKey(nextChildren[nextChStart]);

          if (lastKey == null || lastKey !== nextKey) break;

          patchElement(
            element,
            lastChildren[lastChStart].element,
            lastChildren[lastChStart],
            nextChildren[nextChStart],
            lifecycle,
            isSvg
          );

          lastChStart++;
          nextChStart++;
        }

        while (nextChStart <= nextChEnd && lastChStart <= lastChEnd) {
          lastKey = getKey(lastChildren[lastChEnd]);
          nextKey = getKey(nextChildren[nextChEnd]);

          if (lastKey == null || lastKey !== nextKey) break;

          patchElement(
            element,
            lastChildren[lastChEnd].element,
            lastChildren[lastChEnd],
            nextChildren[nextChEnd],
            lifecycle,
            isSvg
          );

          lastChEnd--;
          nextChEnd--;
        }

        if (lastChStart > lastChEnd) {
          while (nextChStart <= nextChEnd) {
            element.insertBefore(
              createElement(nextChildren[nextChStart++], lifecycle, isSvg),
              (childNode = lastChildren[lastChStart]) && childNode.element
            );
          }
        } else if (nextChStart > nextChEnd) {
          while (lastChStart <= lastChEnd) {
            removeElement(element, lastChildren[lastChStart++]);
          }
        } else {
          let lastKeyed = createKeyMap(lastChildren, lastChStart, lastChEnd);
          let nextKeyed = {};

          while (nextChStart <= nextChEnd) {
            lastKey = getKey((childNode = lastChildren[lastChStart]));
            nextKey = getKey(nextChildren[nextChStart]);

            if (nextKeyed[lastKey] || (nextKey != null && nextKey === getKey(lastChildren[lastChStart + 1]))) {
              if (lastKey == null) {
                removeElement(element, childNode);
              }
              lastChStart++;
              continue;
            }

            if (nextKey == null || lastNode.type === RECYCLED_NODE) {
              if (lastKey == null) {
                patchElement(
                  element,
                  childNode && childNode.element,
                  childNode,
                  nextChildren[nextChStart],
                  lifecycle,
                  isSvg
                );
                nextChStart++;
              }
              lastChStart++;
            } else {
              if (lastKey === nextKey) {
                patchElement(element, childNode.element, childNode, nextChildren[nextChStart], lifecycle, isSvg);
                nextKeyed[nextKey] = true;
                lastChStart++;
              } else {
                if ((savedNode = lastKeyed[nextKey]) != null) {
                  patchElement(
                    element,
                    element.insertBefore(savedNode.element, childNode && childNode.element),
                    savedNode,
                    nextChildren[nextChStart],
                    lifecycle,
                    isSvg
                  );
                  nextKeyed[nextKey] = true;
                } else {
                  patchElement(
                    element,
                    childNode && childNode.element,
                    null,
                    nextChildren[nextChStart],
                    lifecycle,
                    isSvg
                  );
                }
              }
              nextChStart++;
            }
          }

          while (lastChStart <= lastChEnd) {
            if (getKey((childNode = lastChildren[lastChStart++])) == null) {
              removeElement(element, childNode);
            }
          }

          for (let key in lastKeyed) {
            if (nextKeyed[key] == null) {
              removeElement(element, lastKeyed[key]);
            }
          }
        }
      }

      return (nextNode.element = element);
    };

    let createVNode = (name, props, children, element, key, type) => ({
      name: name,
      props: props,
      children: children,
      element: element,
      key: key,
      type: type
    });

    let createTextVNode = (text, element) => createVNode(text, EMPTY_OBJECT, EMPTY_ARRAY, element, null, TEXT_NODE);

    let recycleChild = element =>
      element.nodeType === 3 // Node.TEXT_NODE
        ? createTextVNode(element.nodeValue, element)
        : recycleElement(element);

    let recycleElement = element =>
      createVNode(
        element.nodeName.toLowerCase(),
        EMPTY_OBJECT,
        map.call(element.childNodes, recycleChild),
        element,
        null,
        RECYCLED_NODE
      );

    let patch = (lastNode, nextNode, container) => {
      let lifecycle = [];
      patchElement(container, container.children[0], lastNode, nextNode, lifecycle);
      while (lifecycle.length > 0) lifecycle.pop()();
      return nextNode;
    };

    function h(name, props) {
      let node;
      let rest = [];
      let children = [];
      let length = arguments.length;

      while (length-- > 2) rest.push(arguments[length]);

      if ((props = props == null ? {} : props).children != null) {
        if (rest.length <= 0) {
          rest.push(props.children);
        }
        delete props.children;
      }

      while (rest.length > 0) {
        if (isArray((node = rest.pop()))) {
          for (length = node.length; length-- > 0; ) {
            rest.push(node[length]);
          }
        } else if (node === false || node === true || node == null) {
        } else {
          children.push(typeof node === "object" ? node : createTextVNode(node));
        }
      }

      return typeof name === "function"
        ? name(props, (props.children = children))
        : createVNode(name, props, children, null, props.key, DEFAULT);
    }

    return { h, patch };
  })();

  let wigly = (() => {
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

    let transformer = (spec, getEnv, giveEnv, giveVDOM, updateVDOM) => {
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
            current = self;
            res = file.default({ ...props, children });
            work();
          });
        } else {
          work();
        }
      } else {
        if (children.length < 1) {
          giveVDOM(superfine.h(f, props, children));
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
                  giveVDOM(superfine.h(f, props, values));
                }
              },
              updateVDOM
            );
          }
        }
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
      let cb;
      defer(() => {
        transformer(
          h(() => f),
          () => ({}),
          () => ({}),
          vdom => {
            superfine.patch(null, vdom, el);
            cb && cb(vdom.element);
          },
          () => {}
        );
      });
      return { then: f => (cb = f) };
    };

    return { h, render, state, effect, createElement: h, useState: state, useEffect: effect };
  })();

  return wigly;
});
