interface ExtendedNode extends HTMLElement {
  events: { [key: string]: any };
  data: { [key: string]: any };
}

interface State {
  [key: string]: any;
  effectKeys: Array<any>;
  effectCleanups: Array<any>;
}

declare interface Props {
  [key: string]: any;
  children: Array<Transformable>;
}

interface Component {
  func: FunctionComponent | string;
  props: { [key: string]: any };
  childs: Array<Transformable>;
}

interface ExtendedComponent {
  item: Component;
  el?: HTMLElement;
  key: undefined | number;
  state?: State;
}

interface VDOM {
  func: string;
  props: { [key: string]: any };
  childs: Array<VDOM>;
  created?: (el: HTMLElement) => void;
  killed?: () => void;
}

type FunctionComponent = (props: Props) => Component;
type Transformable = FunctionComponent | Component | string | number;
type Callback = (item: ExtendedComponent) => void;
type GetEnv = (item: Component) => Env;

interface Env {
  target?: ExtendedNode;
  state?: State;
}

let useState: any;
let useEffect: any;

let transform = (item: Transformable, cb: Callback = () => {}, env: GetEnv = () => ({})): VDOM => {
  // leaf
  if (typeof item === "string" || typeof item === "number") {
    // @ts-ignore
    return item;
  }

  // plain
  let { func, props, childs = [] } = item as Component;
  if (typeof func !== "function") {
    return { func, props, childs: childs.map((child: Transformable) => transform(child, cb, env)) };
  }

  // component
  let alive: Array<ExtendedComponent> = [];
  let { target, state = { effectKeys: [], effectCleanups: [] } } = env(item as Component);
  let effects: Array<{ f: any; uniquers: any }> = [];

  let work = (state: State): VDOM => {
    let stateCount = 0;
    let effectCount = 0;

    useState = (initial: any) => {
      let key = stateCount++;
      let value = state[key];

      if (value === undefined) {
        value = initial;
      }

      return [
        value,
        (next: any) => {
          let el = create(work({ ...state, [key]: next }));
          target && patch(target, el);
        }
      ];
    };

    useEffect = (f: Function, uniquers: Array<any>) => {
      effects[effectCount++] = { f, uniquers };
    };

    let hospital: Callback = child => {
      cb(child);

      if (child.state === undefined) {
        // dead
        alive = alive.filter(set => !(set.item.func === child.item.func && child.key === set.key));
      } else {
        // alive
        alive.push(child);
      }
    };

    let provider: GetEnv = find => {
      for (let e = 0; e < alive.length; e++) {
        let child: ExtendedComponent = alive[alive.length - e - 1];
        if (child.item && child.item.func === find.func && child.key === (find.props || {}).key) {
          return { target: child.el as ExtendedNode, state: child.state };
        }
      }

      return env(find);
    };

    let res: VDOM = transform((func as FunctionComponent)({ ...props, children: childs }), hospital, provider);

    return {
      ...res,
      created: (el: HTMLElement, force = false) => {
        if (!target || force) {
          target = el as ExtendedNode;
        }

        cb({ item: item as Component, state, el: target, key: (props || {}).key });

        for (let index in effects) {
          let { f, uniquers } = effects[index];
          let last = state.effectKeys[index] || [];
          if (uniquers.join() !== last.join() || uniquers.length === 0) {
            let cleaner = state.effectCleanups[index];
            cleaner && cleaner();
            state.effectKeys[index] = uniquers;
            state.effectCleanups[index] = f(target);
          }
        }
      },
      killed: () => {
        // delete target;
        cb({ item: item as Component, key: (props || {}).key });

        for (let cleaner of state.effectCleanups) {
          cleaner && cleaner();
        }
      }
    };
  };

  return work(state);
};

let render = (root: Component, el: HTMLElement): HTMLElement => el.appendChild(create(transform(root)));

let create = ({ func, props, childs = [], created = () => {}, killed = () => {} }: VDOM): ExtendedNode => {
  let el = document.createElement(func) as ExtendedNode;
  el.events = {};
  el.data = {};
  el.data.created = created;
  el.data.killed = killed;

  for (let key in props) {
    let value = props[key];

    if (key[0] === "o" && key[1] === "n") {
      let name = key.slice(2);
      el.events[name] = value;
      el.addEventListener(name, value);
      continue;
    }

    value !== undefined && el.setAttribute(key, value);
  }

  for (let child of childs) {
    if (typeof child === "string" || typeof child === "number") {
      el.textContent += child;
      continue;
    } else if (!child.func) {
      continue;
    }

    el.appendChild(create(child));
  }

  created(el);

  return el;
};

let kill = (tree: ExtendedNode) => {
  if (tree.data.killed) tree.data.killed();
  for (let child of tree.childNodes) {
    kill(child as ExtendedNode);
  }
};

let patch = (target: ExtendedNode, next: ExtendedNode) => {
  for (let key in target.events) {
    target.removeEventListener(key, target.events[key]);
  }

  if (next.nodeName.toUpperCase() !== target.nodeName.toUpperCase()) {
    // kill(target); // do this above
    // @ts-ignore
    return target.replaceWith(next);
  }

  for (let key in next.events) {
    target.events[key] = next.events[key];
    target.addEventListener(key, next.events[key]);
  }

  // @ts-ignore
  for (let key of new Set([...target.getAttributeNames(), ...next.getAttributeNames()])) {
    let value = next.getAttribute(key);
    let last = target.getAttribute(key);

    if (value === null) {
      target.removeAttribute(key);
    } else if (value !== last && value !== null) {
      target.setAttribute(key, value);
    }
  }

  if ((target.innerHTML || "").trim() === (target.textContent || "").trim()) {
    // next.data.created(next, true);
    // @ts-ignore
    return target.replaceWith(next);
  }

  let nextC = [...next.childNodes];
  let pastC = [...target.childNodes];
  let diff = pastC.length - nextC.length;

  for (let i = pastC.length - 1; i >= nextC.length; i--) {
    let one = pastC[diff + 1 - i] as ExtendedNode;
    let two = pastC[i - 1] as ExtendedNode;
    let three = pastC[i];
    kill(two || one || three); // this doesnt make any sense
    target.removeChild(pastC[i]);
  }

  for (let i = 0; i < nextC.length; i++) {
    if (pastC[i]) {
      patch(pastC[i] as ExtendedNode, nextC[i] as ExtendedNode);
    } else {
      (nextC[i] as ExtendedNode).data.created(nextC[i], true);
      target.appendChild(nextC[i]);
    }
  }
};

let h = (func: string | FunctionComponent, props: Object, ...childs: Array<string | FunctionComponent>): Component => ({
  func,
  props,
  childs: [].concat.apply([], childs)
});

// @ts-ignore
// var self = {};
// @ts-ignore
self["h"] = h;
// @ts-ignore
self["render"] = render;
// @ts-ignore
self["useState"] = val => useState(val);
// @ts-ignore
self["useEffect"] = (f, ...uniquers) => useEffect(f, [].concat.apply([], uniquers));

// export default self;
