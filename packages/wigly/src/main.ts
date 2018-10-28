// TYPES

type LifecycleObject = {
  mounted(element: Node): void;
  updated(element: Node): void;
  destroyed(element: Node): void;
};

type VDOM = {
  tag: string;
  attr: { [key: string]: any };
  lifecycle: LifecycleObject;
  children: Array<VDOM | string>;
};

type ComponentContext = {
  props: Object;
  state: Object;
  [key: string]: any;
};

export type UserVDOM = {
  tag?: Component | string;
  children?: Component | string | number | Array<Component | string | number>;
  lifecycle?: LifecycleObject;
  [key: string]: any;
};

type ExtendedUserVDOM = {
  tag?: Component | string;
  children?: Component | string | number | Array<Component | string | number>;
  ctx(): {
    props: Object;
    state: Object;
  };
  [key: string]: any;
};

export type Customizer = (item: any) => Component;

export type Component = {
  data?(): Object;
  mounted?(element: Node): void;
  updated?(element: Node): void;
  destroyed?(element: Node): void;
  render(): UserVDOM;
  [key: string]: any;
};

// CONSTANTS

let NOOP = () => {};

let SPECIAL: { [key: string]: boolean } = {
  ["tag"]: true,
  ["children"]: true,
  ["data"]: true,
  ["mounted"]: true,
  ["updated"]: true,
  ["destroyed"]: true,
  ["render"]: true
};

let DEFAULT_VDOM: VDOM = {
  tag: "div",
  attr: {},
  lifecycle: { mounted: NOOP, updated: NOOP, destroyed: NOOP },
  children: []
};

let FALSY_NODE: VDOM = { ...DEFAULT_VDOM, tag: "#" };

// DOM

let updateAttribute = (element: any, name: string, value: any, old: any): void => {
  if (SPECIAL[name]) {
  } else if (name === "value") {
    element[name] = value;
  } else if (name === "style") {
    value = value || {};
    for (let i in { ...old, ...value }) {
      // pretty sure we don't need this yea?
      // if (i[0] === "-") {
      // element[name].setProperty(i, value[i]);
      // } else {
      element[name][i] = value[i];
      // }
    }
  } else if (name[0] === "o" && name[1] === "n") {
    name = name.slice(2);

    if (element.events) {
      !old && (old = element.events[name]);
    } else {
      element.events = {};
    }

    element.events[name] = value;

    if (value) {
      !old && element.addEventListener(name, (e: any) => e.currentTarget.events[e.type](e));
    } else {
      element.removeEventListener(name, (e: any) => e.currentTarget.events[e.type](e));
    }
  } else if (!value) {
    element.removeAttribute(name);
  } else {
    element.setAttribute(name, value);
  }
};

let createElement = (node: VDOM | string | number): Node => {
  if (typeof node === "string" || typeof node === "number") {
    return document.createTextNode(node.toString());
  }

  let el =
    node.tag === FALSY_NODE.tag
      ? document.createComment("") // conditional
      : document.createElement(node.tag); // default

  for (let child of node.children) {
    el.appendChild(createElement(child));
  }

  for (let name in node.attr) {
    updateAttribute(el, name, node.attr[name], null);
  }

  node && node.lifecycle && node.lifecycle.mounted && node.lifecycle.mounted(el);

  return el;
};

let updateElement = (el: Node, node: VDOM, old: VDOM): Node => {
  for (let name in { ...old.attr, ...node.attr }) {
    if (node.attr[name] !== old.attr[name]) {
      updateAttribute(el, name, node.attr[name], old.attr[name]);
    }
  }

  node.lifecycle.updated(el);

  return el;
};

let removeChildren = (el: Node, node: VDOM | string): Node => {
  if (typeof node !== "string") {
    for (let i = 0; i < node.children.length; i++) {
      removeChildren(el.childNodes[i], node.children[i]);
    }

    node.lifecycle.destroyed(el);
  }

  return el;
};

let patch = (parent: Node, node: VDOM | string, element: Node | null, old: VDOM | string | null): Node => {
  if (node === old && element) {
    return element;
    // @ts-ignore
  } else if (element == null || old == null || old.tag !== node.tag) {
    let newElement = createElement(node);
    parent.insertBefore(newElement, element);
    element && old && parent.removeChild(removeChildren(element, old));
    return newElement;
    // @ts-ignore
  } else if (!node.tag && element) {
    element.nodeValue = node.toString();
    return element;
  } else {
    // @ts-ignore
    updateElement(element, node, old);

    // removal of children
    // @ts-ignore
    for (let i = old.children.length - 1; i >= node.children.length; i--) {
      // @ts-ignore
      element.removeChild(removeChildren(element.childNodes[i], old.children[i]));
    }

    // updating of children
    // @ts-ignore
    for (let i = 0; i < node.children.length; i++) {
      // @ts-ignore
      patch(element, node.children[i], element.childNodes[i], old.children[i]);
    }

    return element;
  }
};

// API

let transform = (
  tree: UserVDOM | string | number | undefined | null | false,
  customizers: Array<Customizer>,
  parentCallback: ((
    key: number,
    el: Node,
    that: UserVDOM,
    vdom: VDOM | string,
    childCtx: (() => ComponentContext)
  ) => void),
  getSeedState: ((component: UserVDOM) => Object | void)
): VDOM | string => {
  // conditional node
  if (tree === undefined || tree === null || tree === false) {
    return FALSY_NODE;
  }

  // leaf node
  if (typeof tree === "string" || typeof tree === "number") {
    return tree.toString();
  }

  if (typeof tree.tag === "string" || typeof tree.tag === "undefined") {
    return {
      tag: tree.tag || DEFAULT_VDOM.tag,
      lifecycle: { ...DEFAULT_VDOM.lifecycle, ...tree.lifecycle },
      attr: tree,
      children: (Array.isArray(tree.children) ? tree.children : [tree.children]).map(item =>
        transform(item, customizers, parentCallback, getSeedState)
      )
    };
  }

  // component node
  for (let customizer of customizers) tree.tag = customizer(tree.tag); // Let users do what they want!

  let el: Node;
  let lastVDOM: VDOM | string;
  let isActive = true;
  let inst: Component = tree.tag;
  let renderedChildren: Array<ExtendedUserVDOM> = []; // reference hacking
  let render = inst["render"];
  let state = getSeedState(tree);

  let methods: { [key: string]: any } = {};
  for (let k in inst) !SPECIAL[k] && (methods[k] = (...args: Array<any>) => inst[k].call(ctx(), ...args));

  let lifecycle: LifecycleObject = {
    mounted: (el: Node) => lifecycleWrap(inst["mounted"] || NOOP, 0, el),
    updated: (el: Node) => lifecycleWrap(inst["updated"] || NOOP, 1, el),
    destroyed: (el: Node) => lifecycleWrap(inst["destroyed"] || NOOP, 2, el)
  };

  let ctx = (): { state: any; props: any; setState: any; [key: string]: any } => {
    let partial = { ...methods, ["props"]: tree };
    if (!state) state = (inst.data || NOOP).call(partial) || {};
    return { ...partial, ["state"]: state, ["setState"]: setState };
  };

  /**
   * Turns out seeds are fucking great.
   * Also, this is near unreadable because it saves more bytes this way.
   */
  let setState = (f: any, cb: Function | undefined) => {
    if (!isActive) return;
    state = { ...state, ...(typeof f === "function" ? f(state) : f) };
    let userVDOM: UserVDOM = { ...render.call(ctx()), lifecycle: lifecycle };
    let next = transform(userVDOM, customizers, childCallback, findChildSeedState);
    patch(el, next, el, lastVDOM);
    lastVDOM = next;
    if (cb) cb();
  };

  let lifecycleWrap = (f: (element: Node) => void, key: number, next: Node): void => {
    el = next;
    if (key === 2) isActive = false;
    if (f) f.call(ctx(), el);
    parentCallback(key, el, tree, lastVDOM, ctx);
  };

  let childCallback = (key: number, el: Node, that: UserVDOM, vdom: any, childCtx: (() => ComponentContext)): void => {
    // For the case of intermediate components that do not touch children.
    parentCallback(key, el, that, vdom, childCtx);

    // For the case of parent only has one node child; another component.
    if (lastVDOM === vdom) {
      if (key === 0) {
        lifecycle.mounted(el);
      } else if (key === 1) {
        lifecycle.updated(el);
      } else if (key === 2) {
        lifecycle.destroyed(el);
      }
    }

    // why tf does any of this work?
    // We know why now!
    // Only ONE component is rendering at a time (duh)
    // other children don't care if they are wiped out
    // when they are not currently rendering.
    // But why is this an array? Because JavaScript references
    // are weird.
    if (key !== 0) renderedChildren = [];
    if (key !== 2) renderedChildren.push({ ...that, ctx: childCtx });
  };

  let findChildSeedState = (find: UserVDOM): Object | void => {
    return renderedChildren[0] && renderedChildren[0].tag === find.tag
      ? renderedChildren[0].ctx().state
      : getSeedState(find);
  };

  let userVDOM: UserVDOM = { ...render.call(ctx()), lifecycle: lifecycle };
  let vdom = transform(userVDOM, customizers, childCallback, findChildSeedState);
  return (lastVDOM = vdom);
};

export let render = (tag: Component, el: Node, ...customizers: Array<Customizer>): Node => {
  return patch(el, transform({ tag }, customizers, NOOP, NOOP), null, null);
};

export let h = (f: any, props: any, ...children: Array<any>): UserVDOM => ({
  tag: f,
  children: [].concat.apply([], children), // flat
  ...props
});

// @ts-ignore
self["render"] = render;
// @ts-ignore
self["h"] = h;
