let isSimple = i => typeof i === "number" || typeof i === "string";

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

function updateAttribute(element, name, value, oldValue) {
  if (name === "key") {
  } else if (name === "style") {
    for (let i in { ...oldValue, ...value }) {
      let style = value == null || value[i] == null ? "" : value[i];
      if (i[0] === "-") {
        element[name].setProperty(i, style);
      } else {
        element[name][i] = style;
      }
    }
  } else {
    if (name[0] === "o" && name[1] === "n") {
      name = name.slice(2);

      if (element.events) {
        if (!oldValue) oldValue = element.events[name];
      } else {
        element.events = {};
      }

      element.events[name] = value;

      if (value) {
        if (!oldValue) {
          element.addEventListener(name, e => e.currentTarget.events[e.type](e));
        }
      } else {
        element.removeEventListener(name, e => e.currentTarget.events[e.type](e));
      }
    }
    // do we need this?
    // else if (
    //   name in element &&
    //   name !== "list" &&
    //   name !== "type" &&
    //   name !== "draggable" &&
    //   name !== "spellcheck" &&
    //   name !== "translate"
    // ) {
    //   element[name] = value == null ? "" : value;
    // }
    else if (value != null && value !== false) {
      element.setAttribute(name, value);
    }

    if (value == null || value === false) {
      element.removeAttribute(name);
    }
  }
}

function createElement(node) {
  let el = isSimple(node) ? document.createTextNode(node) : document.createElement(node["tag"]);

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

function updateElement(el, node, oldAttributes, attributes) {
  for (let name in { ...oldAttributes, ...attributes }) {
    if (attributes[name] !== (name === "value" || name === "checked" ? el[name] : oldAttributes[name])) {
      updateAttribute(el, name, attributes[name], oldAttributes[name]);
    }
  }

  return lifecyleWrapper(node, "updated", el);
}

function removeChildren(el, node) {
  if (node["children"]) {
    for (let i = 0; i < node["children"].length; i++) {
      removeChildren(el.childNodes[i], node["children"][i]);
    }
  }

  return lifecyleWrapper(node, "destroyed", el);
}

function patch(parent, element, oldNode, node) {
  if (node === oldNode) {
  } else if (oldNode == null || oldNode["tag"] !== node["tag"]) {
    let newElement = createElement(node);
    parent.insertBefore(newElement, element);

    if (oldNode != null) {
      parent.removeChild(removeChildren(element, oldNode));
    }

    element = newElement;
  } else if (oldNode["tag"] == null) {
    element.nodeValue = node;
  } else {
    updateElement(element, node, oldNode["attr"], node["attr"]);

    let oldElements = [];
    let oldChildren = oldNode["children"];
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

let transformer = (tree, parentCallback, getSeedState) => {
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
    let renderedChildren = [];

    // wire methods + lifecycle
    for (let key in methods) ((key, f) => (methods[key] = (...args) => f.call(ctx(), ...args)))(key, methods[key]);
    for (let key in lifecycle) ((key, f) => (lifecycle[key] = el => lifecycleWrap(f, key, el)))(key, lifecycle[key]);

    function ctx() {
      !state && data && (state = data.call({ children, props }));
      return {
        ["state"]: state,
        ["props"]: props,
        ["children"]: children,
        ["setState"]: setState,
        ...methods
      };
    }

    /**
     * Turns out seeds are fucking great.
     */
    function setState(f, cb) {
      state = { ...state, ...f(state) };
      let vdom = { ...render.call(ctx()), ["lifecycle"]: lifecycle };
      patch(el, el, lastVDOM, (lastVDOM = transformer(vdom, childCallback, findChildSeedState)));
      cb && cb();
    }

    function lifecycleWrap(f, key, next) {
      el = next;
      key === "mounted" && parentCallback && parentCallback(tree, true);
      f && f.call(ctx(), el);
    }

    function childCallback(that, enteringDOM) {
      // TODO - remove when an item is removed from dom
      if (enteringDOM) {
        renderedChildren.push(that);
      }
    }

    // meditate on this check, it's very simple and error prone as is
    function findChildSeedState(that) {
      for (let renderedChild of renderedChildren) {
        if (that["tag"] === renderedChild["tag"] && that["key"] === renderedChild["key"]) return renderedChild["state"];
      }
    }

    return (lastVDOM = transformer({ ...render.call(ctx()), ["lifecycle"]: lifecycle }, childCallback, null)); // yum
  }

  // fix children
  let children = tree["children"] || [];
  isSimple(children) && (children = [children]);

  return {
    ["tag"]: tree["tag"] || "div",
    ["key"]: tree["key"],
    ["lifecycle"]: tree["lifecycle"] || {},
    ["attr"]: props || {},
    ["children"]: children.filter(i => i).map(i => transformer(i, parentCallback, getSeedState))
    // FYI we removed a template hack here, not sure why everything is working now but it is. Cool!
  };
};

export let render = (raw, container) =>
  patch(container, undefined, undefined, transformer({ ["tag"]: raw }, null, null));

// let FunctionalAdaptor = f =>
//   component({
//     render() {
//       return f({ props: this.props, children: this.children });
//     }
//   });

export let component = sig => () => ({
  ["data"]: sig["data"],
  ["lifecycle"]: {
    ["mounted"]: sig["mounted"],
    ["updated"]: sig["updated"],
    ["destroyed"]: sig["destroyed"]
  },
  ["methods"]: Object.keys(sig).reduce((t, k) => (special[k] ? t : { ...t, [k]: sig[k] }), {}), // collect all those not in special
  ["render"]: sig["render"]
});
