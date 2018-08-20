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
  let special = {};
  special["tag"] = true;
  special["bag"] = true;
  special["lifecycle"] = true;
  special["children"] = true;

  let methodRules = {};
  methodRules["data"] = true;
  methodRules["mounted"] = true;
  methodRules["updated"] = true;
  methodRules["destroyed"] = true;
  methodRules["render"] = true;

  let defaultLifecycle = {
    ["mounted"]: undefinedNoop,
    ["updated"]: undefinedNoop,
    ["destroyed"]: undefinedNoop
  };

  let staleElement;
  let staleTree;

  let findChildrenComponents = rendered => {
    let tagOrFunc = rendered["tag"];
    if (typeof tagOrFunc === "function") {
      return rendered;
    }

    let children = rendered["children"] || [];
    if (typeof children === "string") {
      return [];
    }

    children = children.filter(item => item).map(findChildrenComponents);
    return [].concat.apply([], children); // flat
  };

  let transform = (tree, instantiatedCallback = undefinedNoop, shallow = false) => {
    // end of tree
    let type = typeof tree;
    if (type === "string" || type === "number") {
      return tree;
    }

    // top level component
    if (type === "function") {
      return transform({ tag: tree }, instantiatedCallback, shallow);
    }

    let props = {}; // or attr
    for (let k in tree) {
      if (!special[k]) {
        props[k] = tree[k];
      }
    }

    if (typeof tree["tag"] === "function" && shallow) {
      return {
        ["shallowPlaceholder"]: true,
        ["props"]: props,
        ["children"]: tree["children"],
        ["tag"]: tree["tag"]
      };
    }

    // component
    if (typeof tree["tag"] === "function") {
      let instance = tree["tag"]({ ["props"]: props }); // weird but quick fix for functional components
      let data = instance["data"] || valueNoop;
      let render = instance["render"] || (() => instance); // weird but quick fix for functional components
      let methods = instance["methods"];
      let lifecycle = { ...defaultLifecycle, ...(instance["lifecycle"] || {}) };
      let children = instance["children"] || tree["children"] || [];
      let state = data.call({ props, children });

      function getCurrentContext() {
        let ctx = {};
        ctx["state"] = instance["bag"]["state"];
        ctx["props"] = instance["bag"]["props"];
        ctx["children"] = instance["bag"]["children"];
        ctx["setState"] = instance["bag"]["setState"];
        Object.assign(ctx, methods);
        return ctx;
      }

      /**
       * Do NOT look ahead, this is full of broken test code.
       */
      function setState(f, cb) {
        let el = instance["bag"]["el"];
        // let pastChildren = bindComponent(findChildrenComponents);
        let current = instance["bag"]["state"];
        let next = Object.assign(current, f(current));
        Object.assign(instance["bag"]["state"], next);
        // let nextChildren = bindComponent(findChildrenComponents);
        let nextDeep = bindComponent(transform);
        let nextShallow = bindComponent(transform, true);

        if (instance["bag"]["componentInstanceChildren"].length < 1) {
          // no children to be concerned about, render it all.
          patcher(el, el, instance["bag"]["lastVDOM"], (instance["bag"]["lastVDOM"] = nextDeep), () => {
            cb && cb(nextDeep);
          });
          return;
        }

        el = patcher(el, el, instance["bag"]["lastVDOM"], nextShallow);

        // TODO ACCOUNT FOR COMPONENTS ENTERING AND LEAVING DOM
        // DO WE STILL NEED TO DO THIS?

        // DONE
        // TODO BUILD THE CORRECT NEXTTREE (DEEP) SO WE NEVER PASS PLACEHOLDERS INTO
        //      PAST TREES

        let mergeChildIntoShallowTree = child => tree => {
          function merger(curr) {
            if (curr["tag"] === child["bag"]["spec"]["tag"]) {
              return tree;
            }

            return {
              ...curr,
              children: (curr.children || []).map(merger)
            };
          }

          nextShallow = merger(nextShallow);
        };

        function callSetStateOnChildren(tree) {
          let children = tree["children"] || [];

          for (let child of children) {
            if (child["shallowPlaceholder"]) {
              for (let bagged of instance["bag"]["componentInstanceChildren"]) {
                let x = bagged["bag"]["spec"]["tag"];
                let y = child["tag"];

                if (x === y) {
                  Object.assign(bagged["bag"]["props"], child["props"]);
                  Object.assign(bagged["bag"]["children"], child["children"]);
                  bagged["bag"]["setState"](valueNoop, mergeChildIntoShallowTree(bagged));
                }
              }

              continue;
            }

            callSetStateOnChildren(child);
          }
        }

        callSetStateOnChildren(nextShallow);
        instance["bag"]["lastVDOM"] = nextShallow;
        cb && cb(nextShallow);
      }

      instance["bag"] = instance["bag"] || {};
      instance["bag"]["props"] = props;
      instance["bag"]["children"] = children;
      instance["bag"]["state"] = state;
      instance["bag"]["setState"] = setState;
      instance["bag"]["componentInstanceChildren"] = [];

      for (let key in methods) {
        ((key, f) => (methods[key] = (...args) => f.call(getCurrentContext(), ...args)))(key, methods[key]);
      }

      for (let key in lifecycle) {
        ((key, f) =>
          (lifecycle[key] = el => {
            instance["bag"]["el"] = el;

            if (key === "mounted") {
              instance["bag"]["spec"] = tree;
              instance["bag"]["uniqueID"] = unique();
              instantiatedCallback && instantiatedCallback(instance);
            }

            if (key === "destroyed") {
              instantiatedCallback && instantiatedCallback(instance, false);
            }

            f.call(getCurrentContext(), el);
          }))(key, lifecycle[key]);
      }

      function bindComponent(transformer, shallow = false) {
        return transformer(
          Object.assign(render.call(getCurrentContext()), { ["lifecycle"]: lifecycle }),
          domUpdateHook,
          shallow
        );
      }

      function domUpdateHook(that, isEnteringDom = true) {
        if (isEnteringDom) {
          instance["bag"]["componentInstanceChildren"].push(that);
          return;
        }

        instance["bag"]["componentInstanceChildren"] = instance["bag"]["componentInstanceChildren"].filter(
          item => that["bag"]["uniqueID"] !== item["bag"]["uniqueID"]
        );
      }

      return (instance["bag"]["lastVDOM"] = bindComponent(transform));
    }

    // fix children
    let children = tree["children"] || [];
    if (typeof children === "string" || typeof children === "number") {
      children = [children];
    }

    let values = {};
    values["tag"] = tree["tag"] || "div";
    values["lifecycle"] = tree["lifecycle"] || {};
    values["attr"] = props || {};
    values["children"] = children.map(child => transform(child, instantiatedCallback, shallow));
    return values;
  };

  return scheduleRender(transform(rawTree), cb);

  function scheduleRender(tree, cb) {
    setTimeout(renderView, undefined, tree, cb); // meditate on this
  }

  function renderView(tree, cb) {
    staleElement = patcher(renderElement, staleElement, staleTree, tree, cb);
    staleTree = tree;
  }
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

  let lifecycle = {};
  lifecycle["mounted"] = mounted;
  lifecycle["updated"] = updated;
  lifecycle["destroyed"] = destroyed;

  return () => {
    let values = {};
    values["bag"] = {};
    values["lifecycle"] = lifecycle;
    values["methods"] = signature;
    values["data"] = data;
    values["render"] = render;
    return values;
  };
};
