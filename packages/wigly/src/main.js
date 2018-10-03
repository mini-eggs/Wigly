var isSimple = i => typeof i === "number" || typeof i === "string";
var falsy = i => i === undefined || i === false || i === null || i === "";
var falsyNode = { tag: "#", children: [] }; // This ultimately gets rendered as a comment node.

var special = {
  ["tag"]: true,
  ["lifecycle"]: true,
  ["data"]: true,
  ["mounted"]: true,
  ["updated"]: true,
  ["destroyed"]: true,
  ["render"]: true
};

var lifecyleWrapper = (node, lc, el) => {
  node["lifecycle"] && node["lifecycle"][lc] && node["lifecycle"][lc](el);
  return el;
};

var updateAttribute = (element, name, value, old) => {
  if (special[name] || name === "children") {
  } else if (name === "value") {
    element[name] = value;
  } else if (name === "style") {
    for (var i in { ...old, ...value }) {
      if (i[0] === "-") {
        element[name].setProperty(i, value[i]);
      } else {
        element[name][i] = value[i];
      }
    }
  } else if (name[0] === "o" && name[1] === "n") {
    name = name.slice(2);
    element.events = element.events || {};
    element.events[name] = value;
    (value ? element.addEventListener : element.removeEventListener).call(element, name, e =>
      e.currentTarget.events[e.type](e)
    );
  } else if (falsy(value)) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
};

var createElement = node => {
  var el = isSimple(node)
    ? document.createTextNode(node) // leaf
    : node["tag"] === falsyNode["tag"]
      ? document.createComment("") // conditional
      : document.createElement(node["tag"]); // default

  for (var child of node["children"] || []) {
    el.appendChild(createElement(child));
  }

  for (var name in node["attr"]) {
    updateAttribute(el, name, node["attr"][name], null);
  }

  return lifecyleWrapper(node, "mounted", el);
};

var updateElement = (el, node, old, attr) => {
  for (var name in { ...old, ...attr }) {
    if (attr[name] !== old[name]) {
      updateAttribute(el, name, attr[name], old[name]);
    }
  }

  return lifecyleWrapper(node, "updated", el);
};

var removeChildren = (el, node) => {
  if (el && node["children"]) {
    for (var i = 0; i < node["children"].length; i++) {
      removeChildren(el.childNodes[i], node["children"][i]);
    }
  }

  return lifecyleWrapper(node, "destroyed", el);
};

var patch = (parent, node, element, old) => {
  if (node === old) {
  } else if (old == null || old["tag"] !== node["tag"]) {
    var newElement = createElement(node);
    parent.insertBefore(newElement, element);
    old && parent.removeChild(removeChildren(element, old));
    element = newElement;
  } else if (!old["tag"]) {
    element.nodeValue = node;
  } else {
    updateElement(element, node, old["attr"], node["attr"]);

    var i = 0;
    var oldElements = element ? element.childNodes : [];
    var oldChildren = old["children"];
    var children = node["children"];

    while (i < children.length && element) {
      patch(element, children[i], oldElements[i], oldChildren[i]);
      i++;
    }

    while (i < oldChildren.length && oldElements[i]) {
      element.removeChild(removeChildren(oldElements[i], oldChildren[i]));
      i++;
    }
  }

  return element;
};

var transformer = (patcher, tree, parentCallback, getSeedState) => {
  // leaf node
  if (isSimple(tree)) {
    return tree;
  }

  // collect attr/props
  var props = {};
  for (var k in tree) !special[k] && (props[k] = tree[k]);

  // component
  if (typeof tree["tag"] === "object") {
    var el;
    var lastVDOM;
    var isActive = true;
    var inst = tree["tag"];
    var data = inst["data"];
    var renderedChildren = [];
    var render = inst["render"];
    var state = getSeedState && getSeedState(tree);
    var methods = Object.keys(inst).reduce((t, k) => (special[k] ? t : { ...t, [k]: inst[k] }), {});
    var lifecycle = { ["mounted"]: inst["mounted"], ["updated"]: inst["updated"], ["destroyed"]: inst["destroyed"] };

    // wire methods + lifecycle
    for (var key in methods) ((key, f) => (methods[key] = (...args) => f.call(ctx(), ...args)))(key, methods[key]);
    for (var key in lifecycle) ((key, f) => (lifecycle[key] = el => lifecycleWrap(f, key, el)))(key, lifecycle[key]);

    var ctx = () => {
      var partial = { ["props"]: props, ...methods };
      !state && (state = data ? data.call(partial) : {});
      return { ["state"]: state, ["setState"]: setState, ...partial };
    };

    /**
     * Turns out seeds are fucking great.
     * Also, this is near unreadable because it saves more bytes this way.
     */
    var setState = (f, cb) => {
      if (isActive) {
        state = { ...state, ...(typeof f === "function" ? f(state) : f) };
        var next = transformer(
          patcher,
          { ...render.call(ctx()), ["lifecycle"]: lifecycle },
          childCallback,
          findChildSeedState
        );
        patcher(el, next, el, lastVDOM);
        lastVDOM = next;
        cb && cb();
      }
    };

    /**
     * Hm, is this getting hard to read? Lol.
     */
    var lifecycleWrap = (f, key, next) => {
      el = next;
      key === "destroyed" && (isActive = false);
      parentCallback && parentCallback(key, el, tree, lastVDOM, ctx);
      f && f.call(ctx(), el);
    };

    var childCallback = (key, el, that, vdom, childCtx) => {
      // For the case of intermediate components that do not touch children.
      parentCallback && parentCallback(key, el, that, vdom, childCtx);
      // For the case of parent only has one node child; another component.
      lastVDOM === vdom && lifecycle[key](el);
      // Honestly, this shit doesn't make sense but it works.
      renderedChildren = key === "destroyed" ? [] : [{ ...that, ["ctx"]: childCtx }, ...renderedChildren];
    };

    var findChildSeedState = find =>
      // I'm not sure WHY this `===` check works but it does
      renderedChildren.reduce(
        (final, item) => (item["tag"] === find["tag"] ? item["ctx"]()["state"] : final),
        getSeedState && getSeedState(find)
      );

    return (lastVDOM = transformer(
      patcher,
      { ...render.call(ctx()), ["lifecycle"]: lifecycle },
      childCallback,
      getSeedState ? findChildSeedState : null
    ));
  }

  // ensure children are arr
  var children = isSimple(tree["children"]) ? [tree["children"]] : tree["children"] || [];

  return {
    ["tag"]: tree["tag"] || "div",
    ["lifecycle"]: tree["lifecycle"],
    ["attr"]: props,
    ["children"]: children.map(i => (falsy(i) ? falsyNode : transformer(patcher, i, parentCallback, getSeedState)))
  };
};

export var render = (tag, el, patcher = patch) => {
  // Function check to support vanilla wigly and component wigly
  return patcher(el, transformer(patcher, typeof tag === "function" ? tag() : { tag }, 0, 0));
};
