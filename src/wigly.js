let valueNoop = () => ({});
let nullNoop = () => null;
let undefinedNoop = () => {};

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
    if (tree["attr"][key] !== old["attr"][key]) {
      createOrUpdateAttributes(el, key, tree["attr"][key], old["attr"][key]);
    }
  }
  if (tree["lifecycle"] && tree["lifecycle"]["updated"]) {
    tree["lifecycle"]["updated"](el);
  }
};

let patch = (container, element, oldTree, currTree, cb = undefinedNoop) => {
  if (oldTree === currTree) {
  } else if (!oldTree || oldTree.tag !== currTree.tag) {
    let nextElement = createElement(currTree);
    container.insertBefore(nextElement, element);

    if (oldTree) {
      removeElement(container, element, oldTree, currTree);
    }

    element = nextElement;
  } else {
    updateElement(element, oldTree, currTree);

    if (typeof currTree === "string" || typeof currTree === "number") {
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

  return cb() || element;
};

export let render = (rawTree, renderElement, cb = undefinedNoop) => {
  let special = {};
  special["tag"] = true;
  special["lifecycle"] = true;
  special["children"] = true;

  let methodRules = {};
  methodRules["data"] = true;
  methodRules["mounted"] = true;
  methodRules["updated"] = true;
  methodRules["destroyed"] = true;
  methodRules["render"] = true;

  let staleElement;
  let staleTree;

  let transform = tree => {
    // end of tree
    let type = typeof tree;
    if (type === "string" || type === "number") {
      return tree;
    }

    let props = {}; // or attr
    for (let k in tree) {
      if (!special[k]) {
        props[k] = tree[k];
      }
    }

    // component
    if (typeof tree["tag"] === "function") {
      let instance = tree["tag"]();
      let data = instance["data"] || valueNoop;
      let render = instance["render"] || (() => instance); // weird but quick fix for functional components
      let methods = instance["methods"];
      let lifecycle = instance["lifecycle"];
      let children = instance["children"] || tree["children"] || [];
      let state = data.call({ props, children });

      function getCurrentContext() {
        let ctx = {};
        ctx["state"] = state;
        ctx["props"] = props;
        ctx["children"] = children;
        ctx["setState"] = setState;
        Object.assign(ctx, methods);
        return ctx;
      }

      function setState(f, cb) {
        let el = instance["bag"]["el"];
        let past = bindComponent();
        state = Object.assign(state, f(state));
        let next = bindComponent();
        patch(el, el, past, next, cb);
      }

      for (let key in methods) {
        ((key, f) => (methods[key] = (...args) => f.call(getCurrentContext(), ...args)))(key, methods[key]);
      }

      function bindComponent() {
        for (let key in lifecycle) {
          ((key, f) => (lifecycle[key] = el => f.call(getCurrentContext(), (instance["bag"]["el"] = el))))(
            key,
            lifecycle[key]
          );
        }
        return transform(Object.assign(render.call(getCurrentContext()), { ["lifecycle"]: lifecycle }));
      }

      return bindComponent();
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
    values["children"] = children.map(transform);
    return values;
  };

  return scheduleRender(transform(rawTree), cb);

  function scheduleRender(tree, cb) {
    setTimeout(renderView, undefined, tree, cb); // meditate on this
  }

  function renderView(tree, cb) {
    staleElement = patch(renderElement, staleElement, staleTree, tree, cb);
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
