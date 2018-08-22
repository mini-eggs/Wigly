let valueNoop = () => ({});
let nullNoop = () => null;
let undefinedNoop = () => {};

let unique = () =>
  Math.random()
    .toString(36)
    .substr(2, 9);

let createElement = tree => {
  let isSimple = typeof tree === "string" || typeof tree === "number";
  let el = isSimple ? document.createTextNode(tree) : document.createElement(tree["tag"]);

  if (!isSimple) {
    for (let child of tree["children"]) {
      el.appendChild(createElement(child));
    }

    for (let key in tree["attr"]) {
      createOrUpdateAttributes(el, key, tree["attr"][key], null);
    }

    if (tree["lifecycle"] && tree["lifecycle"]["mounted"]) {
      tree["lifecycle"]["mounted"](el);
    }
  }

  return el;
};

let createOrUpdateAttributes = (el, key, nextValue, staleValue) => {
  if (key === "style" && nextValue !== undefined) {
    for (let i in { ...nextValue }) el[key][i] = nextValue[i];
  } else if (key[0] === "o" && key[1] === "n") {
    key = key.substr(2);
    staleValue && el.removeEventListener(key, staleValue); // meditate on this
    el.addEventListener(key, nextValue);
  } else if (nextValue) {
    el.setAttribute(key, nextValue);
  } else {
    el.removeAttribute(key);
  }
};

let removeElement = (parent, element, old, tree) => {
  parent.removeChild(removeChildren(element, old, tree));
};

let removeChildren = (element, old, tree) => {
  if (tree && (tree.attr || tree.children)) {
    for (let i = 0; i < tree.children.length; i++) {
      if (element.childNodes[i]) {
        removeChildren(element.childNodes[i], old.children[i], tree.children[i]);
      }
    }
  }

  if (old && old["lifecycle"] && old["lifecycle"]["destroyed"]) {
    old["lifecycle"]["destroyed"](element);
  }

  return element;
};

let updateElement = (el, old, tree) => {
  for (let key in { ...old["attr"], ...tree["attr"] }) {
    if (tree["attr"][key] || tree["attr"][key] !== old["attr"][key]) {
      createOrUpdateAttributes(el, key, tree["attr"][key], old["attr"][key]);
    }
  }
  if (tree["lifecycle"] && tree["lifecycle"]["updated"]) {
    tree["lifecycle"]["updated"](el);
  }
};

let patch = (container, element, oldTree, currTree, cb = undefinedNoop) => {
  if (oldTree === currTree || currTree["shallowPlaceholder"]) {
  } else if (!element || !oldTree || oldTree.tag !== currTree.tag) {
    let nextElement = createElement(currTree);
    container.insertBefore(nextElement, element);

    if (element && oldTree) {
      removeElement(container, element, oldTree, currTree);
    }

    element = nextElement;
  } else {
    updateElement(element, oldTree, currTree);

    // determine if we're switching out a root component
    // for standard vdom, if so lets call destroyed.
    if (
      oldTree["lifecycle"] &&
      currTree["lifecycle"] &&
      oldTree["lifecycle"]["destroyed"] !== currTree["lifecycle"]["destroyed"]
    ) {
      if (oldTree["lifecycle"]["destroyed"]) {
        oldTree["lifecycle"]["destroyed"](element);
      }
    }

    if (typeof oldTree === "string" && typeof currTree !== "string") {
      patch(container, element, undefined, currTree, cb);
    } else if (typeof currTree === "string" || typeof currTree === "number") {
      if (container.firstChild && !container.firstChild.nextSibling && container.firstChild.nodeType === 3) {
        container.firstChild.data = currTree;
      } else {
        container.textContent = currTree;
      }
    } else {
      let oldElements = [];
      let oldChildren = oldTree["children"];
      let children = currTree["children"];

      for (let i = 0; i < oldChildren.length; i++) {
        oldElements[i] = element.childNodes[i];
      }

      let i = 0;
      let k = 0;

      while (k < children.length) {
        patch(element, oldElements[i], oldChildren[i], children[k]);
        k++;
        i++;
      }

      while (i < oldChildren.length) {
        removeElement(element, oldElements[i], oldChildren[i], children[k]);
        i++;
      }
    }
  }

  cb();
  return element;
};

export let render = (rawTree, renderElement, cb = undefinedNoop, patcher = patch) => {
  let special = {
    ["tag"]: true,
    ["key"]: true,
    ["lifecycle"]: true,
    ["children"]: true
  };

  let defaultLifecycle = {
    ["mounted"]: undefinedNoop,
    ["updated"]: undefinedNoop,
    ["destroyed"]: undefinedNoop
  };

  let staleElement;
  let staleTree;

  let transform = (tree, instantiatedCallback = undefinedNoop, shallow = false) => {
    // end of tree
    let type = typeof tree;
    if (type === "string" || type === "number") {
      return tree;
    }

    // top level component
    if (type === "function") {
      // pass lifecycle for the case of root node of component being another component
      return transform({ ["tag"]: tree, ["lifecycle"]: tree["lifecycle"] }, instantiatedCallback, shallow);
    }

    // collect attr and props
    let props = {};
    for (let k in tree) {
      if (!special[k]) {
        props[k] = tree[k];
      }
    }

    // helper for making patching dom better + setStating
    if (typeof tree["tag"] === "function" && shallow) {
      return {
        ["shallowPlaceholder"]: true,
        ["props"]: props,
        ["children"]: tree["children"],
        ["tag"]: tree["tag"],
        ["key"]: tree["key"]
      };
    }

    // component
    if (typeof tree["tag"] === "function") {
      let instance = tree["tag"]({ ["props"]: props }); // weird but quick fix for functional components
      let data = instance["data"] || valueNoop;
      let render = instance["render"];
      let methods = instance["methods"];
      let lifecycle = { ...defaultLifecycle, ...(instance["lifecycle"] || {}) };
      let children = instance["children"] || tree["children"] || [];
      let state = data.call({ props, children });

      if(!instance["render"]) {
        let copy = {...instance}
        render = () => copy  // weird but quick fix for functional components coming in and out of dom.
      }

      function getCurrentContext() {
        return {
          ["state"]: instance["state"],
          ["props"]: instance["props"],
          ["children"]: instance["children"],
          ["setState"]: instance["setState"],
          ...methods
        };
      }

      /**
       * TODO please clean this.
       */
      function setState(f, cb) {
        let el = instance["el"];
        let current = instance["state"];
        let next = Object.assign(current, f(current));
        Object.assign(instance["state"], next);
        let nextDeep = bindComponent(transform);
        let nextShallow = bindComponent(transform, true);

        if (instance["componentInstanceChildren"].length < 1) {
          // no children to be concerned about, render it all.
          patcher(el, el, instance["lastVDOM"], (instance["lastVDOM"] = nextDeep), () => {
            cb && cb(nextDeep);
          });
          return;
        }

        patcher(el, el, instance["lastVDOM"], nextShallow);

        let mergeChildIntoShallowTree = child => tree => {
          function merger(curr) {

            if (curr["tag"] === child["spec"]["tag"] && curr["key"] === child["spec"]["key"]) {
              return tree;
            }

            return {
              ...curr,
              children: typeof curr.children === "string" ? curr.children : (curr.children || []).map(merger)
            };
          }

          nextShallow = merger(nextShallow);
        };

        function callSetStateOnChildren(tree) {
          let children = tree["children"] || [];

          // check if root node is component

          if (tree["shallowPlaceholder"]) {
            for (let bagged of instance["componentInstanceChildren"]) {
              if (tree["tag"] === bagged["spec"]["tag"] && tree["key"] === bagged["spec"]["key"]) {
                Object.assign(bagged["props"], tree["props"]);
                delete bagged["children"];
                bagged["children"] = tree["children"];
                bagged["setState"](valueNoop, mergeChildIntoShallowTree(bagged));
              }
            }
          }

          // business as usual

          for (let child of children) {
            if (child["shallowPlaceholder"]) {
              for (let bagged of instance["componentInstanceChildren"]) {
                if (child["tag"] === bagged["spec"]["tag"] && child["key"] === bagged["spec"]["key"]) {
                  Object.assign(bagged["props"], child["props"]);
                  delete bagged["children"]; // for string assignment
                  bagged["children"] = child["children"];
                  bagged["setState"](valueNoop, mergeChildIntoShallowTree(bagged));
                }
              }

              continue;
            }

            callSetStateOnChildren(child);
          }
        }

        callSetStateOnChildren(nextShallow);
        cb && cb((instance["lastVDOM"] = nextShallow));
      }

      instance = instance || {};
      instance["props"] = props;
      instance["children"] = children;
      instance["state"] = state;
      instance["setState"] = setState;
      instance["componentInstanceChildren"] = [];

      for (let key in methods) {
        ((key, f) => (methods[key] = (...args) => f.call(getCurrentContext(), ...args)))(key, methods[key]);
      }

      for (let key in lifecycle) {
        ((key, f) =>
          (lifecycle[key] = el => {
            instance["el"] = el;

            if (tree["lifecycle"] && key !== "destroyed") {
              // Call parent lifecycles. If the root node of a component
              // is itself a component the original parent lifecycles
              // were being overwritten.
              tree["lifecycle"][key](el);
            }

            if (key === "mounted") {
              instance["spec"] = tree;
              instance["uniqueID"] = unique();
              instantiatedCallback && instantiatedCallback(instance);
            }

            if (key === "destroyed") {
              instantiatedCallback && instantiatedCallback(instance, false);
            }

            f.call(getCurrentContext(), el);
          }))(key, lifecycle[key]);
      }

      function bindComponent(transformer, shallow = false) {
        let rendered = render.call(getCurrentContext()) || { ["tag"]: "template" }; // null render fix/hack
        return transformer(Object.assign(rendered, { ["lifecycle"]: lifecycle }), domUpdateHook, shallow);
      }

      function domUpdateHook(that, isEnteringDom = true) {
        if (isEnteringDom) {
          instance["componentInstanceChildren"].push(that);
          return;
        }

        instance["componentInstanceChildren"] = instance["componentInstanceChildren"].filter(
          item => that["uniqueID"] !== item["uniqueID"]
        );
      }

      return (instance["lastVDOM"] = bindComponent(transform));
    }

    // fix children
    let children = tree["children"] || [];
    if (typeof children === "string" || typeof children === "number") {
      children = [children];
    }

    return {
      ["tag"]: tree["tag"] || "div",
      ["key"]: tree["key"],
      ["lifecycle"]: tree["lifecycle"] || {},
      ["attr"]: props || {},
      ["children"]: children.map(child => transform(child, instantiatedCallback, shallow))
    };
  };

  // We should make all calls to patcher in the future async. Meditate on it.
  let tree = transform(rawTree);
  staleElement = patcher(renderElement, staleElement, staleTree, tree, cb);
  staleTree = tree;

  // return scheduleRender(transform(rawTree), cb);

  // function scheduleRender(tree, cb) {
  //   setTimeout(renderView, undefined, tree, cb); // meditate on this
  // }

  // function renderView(tree, cb) {
  //   staleElement = patcher(renderElement, staleElement, staleTree, tree, cb);
  //   staleTree = tree;
  // }
};

export let component = signature => {
  let data = signature["data"] || valueNoop; // mangled
  let mounted = signature["mounted"] || undefinedNoop;
  let updated = signature["updated"] || undefinedNoop;
  let destroyed = signature["destroyed"] || undefinedNoop;
  let render = signature["render"] || nullNoop;

  delete signature["data"];
  delete signature["mounted"];
  delete signature["updated"];
  delete signature["destroyed"];
  delete signature["render"];

  let lifecycle = {
    ["mounted"]: mounted,
    ["updated"]: updated,
    ["destroyed"]: destroyed
  };

  return () => ({
    ["lifecycle"]: lifecycle,
    ["methods"]: signature,
    ["data"]: data,
    ["render"]: render
  });
};
