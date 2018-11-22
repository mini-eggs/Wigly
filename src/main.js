import * as superfine from "superfine";

// globals
let currentlyExecutingComponent; // for hooks
let globalComponentBag = new WeakMap(); // for keeping track of lists of components
let componentBag = new Map(); // holds given component state
// let defer = f => () => Promise.resolve().then.bind(Promise.resolve())(f);

let copy = f => {
  let copied = (...args) => f(...args);
  Object.defineProperty(copied, "isCopied", {
    value: true,
    writable: false
  });
  return copied;
};

let getComponentEnv = ref => {
  let env = componentBag.get(ref);
  return { ...env };
};

let setComponentEnv = (ref, next) => {
  let base = { effects: {}, states: {}, stateCount: 0, effectCount: 0 };
  let last = getComponentEnv(ref);
  componentBag.set(ref, { ...base, ...last, ...next });
  return getComponentEnv(ref);
};

let traverseTree = (tree, f) => {
  let next = f(tree);
  return {
    ...next,
    children: next.children.filter(child => !!child).map(child => traverseTree(child, f))
  };
};

let updateComponent = ref => {
  let { props, children, vdom, el } = getComponentEnv(ref);

  if (!el || !el.parentElement) {
    return;
  }

  let latestVDOM = traverseTree(vdom, item => {
    if (item.internal) {
      if (item.internal.ref() === item.internal.ref()) {
        let { vdom } = item.internal.env();
        return vdom || item;
      }
      return item;
    } else {
      return item;
    }
  });

  vdom = superfine.patch(latestVDOM, h(ref, props, ...children), el.parentElement);
  setComponentEnv({ vdom });
};

let runEffects = async ref => {
  let { effects, el } = getComponentEnv(ref);

  for (let key in effects) {
    let effect = effects[key];

    if (effect.opts.length < 1 || effect.prev.join() !== effect.opts.join()) {
      if (effect.cleanup) effect.cleanup();
      effects[key] = { ...effect, prev: effect.opts, cleanup: await effect.f(el) };
    }
  }

  setComponentEnv({ effects });
};

export let h = (f, props, ...children) => {
  let isComponent = typeof f === "function";
  props = props || {};
  props.key = props.key || 0;

  if (isComponent && !f.isCopied) {
    let possible = globalComponentBag.get(f);
    if (possible) {
      let specific = possible.get(props.key);
      if (specific) {
        f = specific;
      } else {
        f = copy(f);
        possible.set(props.key, f);
      }
    } else {
      globalComponentBag.set(f, new Map());
      return h(f, props, ...children);
    }
  }

  setComponentEnv(f, { effectCount: 0, stateCount: 0 });
  currentlyExecutingComponent = f;

  return (vdom => {
    return (vdom = {
      ...vdom,
      props: {
        ...vdom.props,
        ...(!isComponent
          ? {}
          : {
              oncreate: el => {
                setComponentEnv(f, { vdom, el, props, children });
                setTimeout(runEffects, 1, f);
              },
              onupdate: el => {
                setComponentEnv(f, { vdom, el, props, children });
                setTimeout(runEffects, 1, f);
              },
              ondestroy: () => {
                let env = getComponentEnv(f);
                setComponentEnv(f, { states: {} });
                if (Object.keys(env).length) {
                  for (let key of Object.keys(env.effects)) {
                    let { cleanup } = env.effects[key];
                    if (cleanup) cleanup();
                  }
                }
              }
            })
      },
      internal: {
        ref: () => f,
        env: () => getComponentEnv(f)
      }
    });
  })(superfine.h(f, props, children));
};

export let render = (f, el) => superfine.patch(null, f, el).element;

export let state = init => {
  let ref = currentlyExecutingComponent;
  let { states, stateCount } = getComponentEnv(ref);
  let index = stateCount++;
  let val = states[index];

  if (typeof val === "undefined") {
    if (typeof init === "function") {
      val = init();
    } else {
      val = init;
    }
  }

  setComponentEnv(ref, { stateCount });

  return [
    val,
    next => {
      let { states } = getComponentEnv(ref);
      states[index] = next;
      setComponentEnv(ref, { states });
      updateComponent(ref);
    }
  ];
};

export let effect = (f, ...opts) => {
  let ref = currentlyExecutingComponent;
  let { effects, effectCount } = getComponentEnv(ref);
  let index = effectCount++;
  let base = { prev: [], cleanup: () => {} };
  let prev = effects[index] || {};
  effects[index] = { ...base, ...prev, f, opts };
  setComponentEnv(ref, { effects, effectCount });
};

export default { h, render, state, effect };
