let valueNoop = () => ({});
let nullNoop = () => null;
let undefinedNoop = () => {};
let clone = (...args) => Object.assign({}, ...args);

export let h = (tag, attr, ...children) => ({ tag, ...attr, children });

function updateAttribute(element, name, value, oldValue) {
  if (name === "key") {
  } else if (name === "style") {
    for (let i in clone(oldValue, value)) {
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
    } else if (
      name in element &&
      name !== "list" &&
      name !== "type" &&
      name !== "draggable" &&
      name !== "spellcheck" &&
      name !== "translate"
    ) {
      element[name] = value == null ? "" : value;
    } else if (value != null && value !== false) {
      element.setAttribute(name, value);
    }

    if (value == null || value === false) {
      element.removeAttribute(name);
    }
  }
}

function createElement(node) {
  let el =
    typeof node === "string" || typeof node === "number"
      ? document.createTextNode(node)
      : document.createElement(node["tag"]);

  if (node["attr"]) {
    for (let child of node["children"]) {
      el.appendChild(createElement(child));
    }

    for (let name in node["attr"]) {
      updateAttribute(el, name, node["attr"][name], null);
    }
  }

  node["lifecycle"] && node["lifecycle"]["mounted"] && node["lifecycle"]["mounted"](el);

  return el;
}

function updateElement(el, node, oldAttributes, attributes) {
  for (let name in clone(oldAttributes, attributes)) {
    if (attributes[name] !== (name === "value" || name === "checked" ? el[name] : oldAttributes[name])) {
      updateAttribute(el, name, attributes[name], oldAttributes[name]);
    }
  }

  node["lifecycle"] && node["lifecycle"]["updated"] && node["lifecycle"]["updated"](el);
}

function removeChildren(el, node) {
  if (node["children"]) {
    for (let i = 0; i < node["children"].length; i++) {
      removeChildren(el.childNodes[i], node["children"][i]);
    }
  }

  node["lifecycle"] && node["lifecycle"]["destroyed"] && node["lifecycle"]["destroyed"](el);

  return el;
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

export let render = (raw, container) => {
  raw = {["tag"]:raw}

  let special = {
    ["tag"]: true,
    ["key"]: true,
    ["lifecycle"]: true,
    ["children"]: true
  };

  return patch(container, undefined, undefined, transform(raw));

  function transform(tree, parentCallback = undefinedNoop, getSeedState = nullNoop) {
    // leaf node
    if (typeof tree === "string" || typeof tree === "number") {
      return tree;
    }

    // collect attr/props
    let props = {};
    for (let k in tree) {
      if (!special[k]) {
        props[k] = tree[k];
      }
    }

    // component
    if (typeof tree["tag"] === "function") {
      let instance = tree["tag"]();
      let data = instance["data"];
      let render = instance["render"];
      let methods = instance["methods"];
      let lifecycle = instance["lifecycle"];
      let children = (instance["children"] = tree["children"] || []);

      instance["props"] = props;
      instance["renderedChildren"] = [];
      instance["spec"] = tree;
      instance["state"] = getSeedState(instance);

      // wire methods + lifecycle
      for (let key in methods) ((key, f) => (methods[key] = (...args) => f.call(ctx(), ...args)))(key, methods[key]);
      for (let key in lifecycle) ((key, f) => (lifecycle[key] = el => lifecycleWrap(f, key, el)))(key, lifecycle[key]);

      function ctx() {
        !instance["state"] && (instance["state"] = data.call({ ["children"]: children, ["props"]: props }));

        return {
          ["state"]: instance["state"],
          ["props"]: instance["props"],
          ["children"]: instance["children"],
          ["setState"]: instance["setState"],
          ...methods
        };
      }

      /**
       * So all this is working great
       * lifecycle wise -- but we need to
       * be passing down a seed state for
       * children components (or something
       * maybe we patch pre transformed trees
       * but that has been very error prone)
       */
      function setState(f, cb) {
        let el = instance["el"];
        instance["state"] = { ...instance["state"], ...f({ ...instance["state"] }) };
        let vdom = { ...render.call(ctx()), ["lifecycle"]: lifecycle };
        patch(el, el, instance["lastVDOM"], (instance["lastVDOM"] = transform(vdom, childCallback, findChildSeedState)));
        cb&&cb();
      }

      instance["setState"] = setState;

      function lifecycleWrap(f, key, el) {
        instance["el"] = el;

        if(key==="mounted") {
          parentCallback(instance, true)
        }

        f.call(ctx(), el);
      }

      function childCallback(that, enteringDOM) {
        // TODO - remove when an item is removed from dom
        if(enteringDOM) {
          instance["renderedChildren"].push(that)
        }
      }

      // meditate on this check, it's very simple and error prone as is
      function findChildSeedState(that) {
        for(let renderedChild of instance["renderedChildren"]) {
          if(
            that["spec"]["tag"] === renderedChild["spec"]["tag"] &&
            that["spec"]["key"] === renderedChild["spec"]["key"]
          ) {
            return {...renderedChild["state"]}
          }
        }
      }

      return (instance["lastVDOM"] = transform({ ...render.call(ctx()), ["lifecycle"]: lifecycle }, childCallback)); // yum
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
      ["children"]: children
        .filter(item => item !== null)
        .map(item => (item === false ? { tag: "template", children: [] } : transform(item, parentCallback, getSeedState))) // meditate on the template
    };
  }
};

export let component = signature => {
  let notMethods = {
    ["data"]: true,
    ["mounted"]: true,
    ["updated"]: true,
    ["destroyed"]: true,
    ["render"]: true
  };

  let methods = {};
  for (let k in signature) !notMethods[k] && (methods[k] = signature[k]);

  return () => ({
    ["data"]: signature["data"] || valueNoop,
    ["lifecycle"]: {
      ["mounted"]: signature["mounted"] || undefinedNoop,
      ["updated"]: signature["updated"] || undefinedNoop,
      ["destroyed"]: signature["destroyed"] || undefinedNoop
    },
    ["methods"]: methods,
    ["render"]: signature["render"] || nullNoop
  });
};
