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

    if (tree["lifecycle"]["mounted"]) {
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
  special["lifecycle"] = true;
  let staleElement;
  let staleTree;
  let appState = [];
  let nextAppState = [];

  return scheduleRender(transform(rawTree), cb);

  function transform(tree) {
    // end of tree
    if (typeof tree === "string" || typeof tree === "number") {
      return tree;
    }

    // normal component
    if (tree["tag"] && tree["tag"]["isComponent"]) {
      let props = {};
      for (let k in tree) if (!special[k]) props[k] = tree[k];

      let ctx = applyContext(tree["tag"], props, tree["children"]);
      let rendered = tree["tag"]["render"].call(ctx) || { tag: "template" }; // renderless default
      rendered["lifecycle"] = ctx["lifecycle"];

      return transform(rendered);
    }

    // top level component
    if (tree["isComponent"]) {
      return transform({ tag: tree });
    }

    let attr = {};
    for (let k in tree) if (!special[k]) attr[k] = tree[k];

    // fix children
    let children = tree["children"] || [];
    if (typeof children === "string" || typeof children === "number") {
      children = [children];
    }

    let values = {};
    values["tag"] = tree["tag"] || "div";
    values["lifecycle"] = tree["lifecycle"] || {};
    values["attr"] = attr;
    values["children"] = children.map(transform);
    return values;
  }

  function applyContext(tree, props, children) {
    let n = (nextAppState[tree["counter"]] || []).length; // instance # of this component

    if (!appState[tree["counter"]]) {
      appState[tree["counter"]] = [];
    }

    if (!nextAppState[tree["counter"]]) {
      nextAppState[tree["counter"]] = [];
    }

    // get current entry
    let state = appState[tree["counter"]].shift();

    if (!state) {
      let initialCtx = {};
      initialCtx["props"] = props;
      initialCtx["children"] = children;
      state = Object.assign(tree["data"].call(initialCtx));
    }

    nextAppState[tree["counter"]].push(state); // guess how long this took me

    let setState = (f, cb) => {
      nextAppState[tree["counter"]][n] = { ...state, ...f(state) };
      appState = nextAppState;
      nextAppState = [];
      scheduleRender(transform(rawTree), cb);
    };

    let bind = obj => {
      for (let key in obj) {
        let apply = (key, f) => {
          obj[key] = (...args) => {
            let ctx = tree["methods"];
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

    let values = bind({ ...tree["methods"] }); // mangle
    values["lifecycle"] = bind(tree["lifecycle"]);
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

  let lifecycle = {};
  lifecycle["mounted"] = mounted;
  lifecycle["updated"] = updated;
  lifecycle["destroyed"] = destroyed;

  let values = {};
  values["isComponent"] = true;
  values["counter"] = uniqueCounter++;
  values["lifecycle"] = lifecycle;
  values["methods"] = signature;
  values["data"] = data;
  values["render"] = render;
  return values;
};
