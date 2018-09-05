let isSimple = i => typeof i === "number" || typeof i === "string";
let falsy = i => i === undefined || i === false || i === null;
let falsyNode = { tag: "#", children: [] }; // This ultimately gets rendered as a comment node.

let special = {
  ["tag"]: true,
  ["key"]: true,
  ["lifecycle"]: true,
  ["children"]: true,
  ["data"]: true,
  ["mounted"]: true,
  ["updated"]: true,
  ["destroyed"]: true,
  ["render"]: true
};

export let h = (tag, attr, ...children) => ({ tag, ...attr, children: [].concat.apply([], children) });

let lifecyleWrapper = (node, lc, el) => {
  node["lifecycle"] && node["lifecycle"][lc] && node["lifecycle"][lc](el);
  return el;
};

function updateAttribute(element, name, value, old) {
  if (name === "key") {
  } else if (name === "style") {
    for (let i in { ...old, ...value }) {
      let style = value == null || value[i] == null ? "" : value[i];
      if (i[0] === "-") {
        element[name].setProperty(i, style);
      } else {
        element[name][i] = style;
      }
    }
  } else if (name[0] === "o" && name[1] === "n") {
    name = name.slice(2);

    if (element.events) {
      if (!old) old = element.events[name];
    } else {
      element.events = {};
    }

    element.events[name] = value;

    if (value) {
      if (!old) {
        element.addEventListener(name, e => e.currentTarget.events[e.type](e));
      }
    } else {
      element.removeEventListener(name, e => e.currentTarget.events[e.type](e));
    }
  } else if (falsy(value)) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
}

function createElement(node) {
  let el = isSimple(node)
    ? document.createTextNode(node) // leaf
    : node["tag"] === falsyNode["tag"]
      ? document.createComment("") // conditional
      : document.createElement(node["tag"]); // default

  if (node["attr"]) {
    for (let child of node["children"]) {
      el.appendChild(createElement(child));
    }

    for (let name in node["attr"]) {
      updateAttribute(el, name, node["attr"][name], null);
    }
  }

  return lifecyleWrapper(node, "mounted", el);
}

function updateElement(el, node, old, attr) {
  for (let name in { ...old, ...attr }) {
    if (attr[name] !== (name === "value" || name === "checked" ? el[name] : old[name])) {
      updateAttribute(el, name, attr[name], old[name]);
    }
  }

  return lifecyleWrapper(node, "updated", el);
}

function removeChildren(el, node) {
  if (node["children"] && el) {
    for (let i = 0; i < node["children"].length; i++) {
      removeChildren(el.childNodes[i], node["children"][i]);
    }
  }

  return lifecyleWrapper(node, "destroyed", el);
}

function patch(parent, element, old, node) {
  if (node === old) {
  } else if (old == null || old["tag"] !== node["tag"]) {
    let newElement = createElement(node);
    parent.insertBefore(newElement, element);
    old && parent.removeChild(removeChildren(element, old));
    element = newElement;
  } else if (!old["tag"]) {
    element.nodeValue = node;
  } else {
    updateElement(element, node, old["attr"], node["attr"]);

    let oldElements = [];
    let oldChildren = old["children"];
    let children = node["children"];

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
      element.removeChild(removeChildren(oldElements[i], oldChildren[i]));
      i++;
    }
  }

  return element;
}

let transformer = (patcher, tree, parentCallback, getSeedState) => {
  // leaf node
  if (isSimple(tree)) {
    return tree;
  }

  // collect attr/props
  let props = {};
  for (let k in tree) !special[k] && (props[k] = tree[k]);

  // component
  if (typeof tree["tag"] === "function") {
    let instance = tree["tag"]();
    let data = instance["data"];
    let render = instance["render"];
    let methods = instance["methods"];
    let lifecycle = instance["lifecycle"];
    let children = (instance["children"] = tree["children"] || []);
    let state = getSeedState && getSeedState(tree);

    let el;
    let lastVDOM;
    let isActive = true;
    let renderedChildren = [];

    // wire methods + lifecycle
    for (let key in methods) ((key, f) => (methods[key] = (...args) => f.call(ctx(), ...args)))(key, methods[key]);
    for (let key in lifecycle) ((key, f) => (lifecycle[key] = el => lifecycleWrap(f, key, el)))(key, lifecycle[key]);

    function ctx() {
      let partial = { ["props"]: props, ["children"]: children, ...methods };
      !state && data && (state = data.call(partial));
      return { ["state"]: state, ["setState"]: setState, ...partial };
    }

    /**
     * Turns out seeds are fucking great.
     */
    function setState(f, cb) {
      if (isActive) {
        state = { ...state, ...f(state) };
        let context = ctx();
        let vdom = { ...render.call(context), ["lifecycle"]: lifecycle };
        patcher(el, el, lastVDOM, (lastVDOM = transformer(patcher, vdom, childCallback, findChildSeedState)));
        cb && cb();
      }
    }

    function lifecycleWrap(f, key, next) {
      el = next;

      if (key === "mounted" && parentCallback) {
        parentCallback(key, el, tree, lastVDOM);
      }

      if (key === "destroyed") {
        isActive = false;
      }

      f && f.call(ctx(), el);
    }

    function childCallback(key, el, that, vdom) {
      lastVDOM === vdom && lifecycle[key](el); // for the case of parent only has one node child; another component
      renderedChildren.push(that);
    }

    // meditate on this check, it's very simple and error prone as is
    function findChildSeedState(that) {
      for (let renderedChild of renderedChildren) {
        if (that["tag"] === renderedChild["tag"] && that["key"] === renderedChild["key"]) return renderedChild["state"];
      }
    }

    return (lastVDOM = transformer(patcher, { ...render.call(ctx()), ["lifecycle"]: lifecycle }, childCallback, null)); // yum
  }

  // ensure children are arr
  let children = tree["children"] || [];
  isSimple(children) && (children = [children]);

  return {
    ["tag"]: tree["tag"] || "div",
    ["key"]: tree["key"],
    ["lifecycle"]: tree["lifecycle"],
    ["attr"]: props,
    ["children"]: children.map(i => (falsy(i) ? falsyNode : transformer(patcher, i, parentCallback, getSeedState)))
  };
};

export let render = (raw, container, patcher = patch) => {
  return patcher(container, undefined, undefined, transformer(patcher, { ["tag"]: raw }, null, null));
};

export let hydrate = (raw, container) => {
  // Meditate on this.
  // This "works" but is FAR from the final implementation.
  // Dont' sweat it for now.
  container.removeChild(container.firstChild);
  return patch(container, undefined, undefined, transformer(patch, { ["tag"]: raw }, null, null));
};

export let component = sig => () => ({
  ["data"]: sig["data"],
  ["lifecycle"]: {
    ["mounted"]: sig["mounted"],
    ["updated"]: sig["updated"],
    ["destroyed"]: sig["destroyed"]
  },
  ["methods"]: Object.keys(sig).reduce((t, k) => (special[k] ? t : { ...t, [k]: sig[k] }), {}), // everything else is a method
  ["render"]: sig["render"]
});
