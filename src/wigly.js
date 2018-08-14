let valueNoop = () => ({});
let nullNoop = () => null;
let undefinedNoop = () => {};

let createElement = tree => {
  let isSimple = typeof tree === "string" || typeof tree === "number";
  let el = isSimple ? document.createTextNode(tree) : document.createElement(tree.tag);

  if (!isSimple) {
    for (let child of tree["children"]) {
      el.appendChild(createElement(child));
    }

    for (let key in tree["attr"]) {
      createOrUpdateAttributes(el, key, tree["attr"][key], null);
    }

    if (tree["lifecycle"]["mounted"]) {
      tree["lifecycle"]["mounted"](el);
    }
  }

  return el;
};

let createOrUpdateAttributes = (el, key, nextValue, staleValue) => {
  if (key === "style") {
    for (let i in { ...nextValue }) el[key][i] = nextValue[i];
  } else if (key[0] === "o" && key[1] === "n") {
    key = key.substr(2);
    staleValue && el.removeEventListener(key, staleValue);
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
      removeChildren(element.childNodes[i], old.children[i], tree.children[i]);
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
      let oldChildren = oldTree.children;
      let children = currTree.children;

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

let uniqueCounter = 0;
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

  let methods = signature;

  let lifecycle = {};
  lifecycle["mounted"] = mounted;
  lifecycle["updated"] = updated;
  lifecycle["destroyed"] = destroyed;

  return {
    counter: ++uniqueCounter,
    isComponent: true,
    lifecycle: lifecycle,
    methods,
    data,
    render
  };
};

export let render = (rawTree, renderElement, cb = undefinedNoop) => {
  let staleElement;
  let staleTree;
  let appState = [];

  return scheduleRender(transform(rawTree), cb);

  function transform(tree, currentProps = {}, currentChildren = []) {
    if (tree.isComponent || (tree.tag && tree.tag.isComponent)) {
      if (!tree.isComponent) {
        let { tag, children, ...attr } = tree;
        currentProps = attr;
        currentChildren = children;
        tree = tree.tag;
      }

      let ctx = applyContext(tree, currentProps, currentChildren);
      let rendered = tree.render.call(ctx);
      rendered["lifecycle"] = ctx["lifecycle"];
      return transform(rendered, currentProps, currentChildren);
    }

    if (typeof tree.tag === "function") {
      return transform(tree.tag({ props: currentProps, children: currentChildren }), currentProps, currentChildren);
    }

    if (typeof tree === "string" || typeof tree === "number") {
      return tree;
    }

    let tag = tree["tag"] || "div";
    let children = tree["children"] || [];
    let lifecycle = tree["lifecycle"] || {};

    if (typeof children === "string") {
      children = [children];
    }

    delete tree["tag"];
    delete tree["children"];
    delete tree["lifecycle"];

    let values = {}; // mangle
    values["tag"] = tag;
    values["lifecycle"] = lifecycle;
    values["attr"] = tree;
    values["children"] = children.map(child => transform(child, currentProps, currentChildren));
    return values;
  }

  function applyContext(tree, props, children) {
    let state = appState[tree.counter];

    if (!state) {
      let initialCtx = {};
      initialCtx["props"] = props;
      initialCtx["children"] = children;
      state = tree.data.call(initialCtx);
    }

    let setState = (f, cb) => {
      state = { ...state, ...f({ ...state }) };
      appState[tree.counter] = state;
      scheduleRender(transform(rawTree), cb);
    };

    let bind = obj => {
      for (let key in obj) {
        let apply = (key, f) => {
          obj[key] = (...args) => {
            let ctx = { ...tree.methods };
            ctx["state"] = state;
            ctx["props"] = props;
            ctx["children"] = children;
            ctx["setState"] = setState;
            return f.call(ctx, ...args);
          };
        };
        apply(key, obj[key]);
      }
      return obj;
    };

    let values = bind(tree.methods); // mangle
    values["lifecycle"] = bind(tree.lifecycle);
    values["state"] = state;
    values["props"] = props;
    values["children"] = children;
    return values;
  }

  function scheduleRender(tree, cb) {
    setTimeout(renderView, undefined, tree, cb); // meditate on this
  }

  function renderView(tree, cb) {
    staleElement = patch(renderElement, staleElement, staleTree, tree, cb);
    staleTree = tree;
  }
};
