/**
 * @const
 */
let NOOP = () => {};

let actualUseState = NOOP;
let actualUseEffect = NOOP;
let getSeedState = NOOP;
let parentCallback = NOOP;

/**
 * @export
 */
let wigly = {
  /**
   * @export
   */
  h: (type, props, ...children) => {
    if (typeof type !== "function") {
      return superfine.h(type, props, ...children);
    }

    /** @type {ComponentProps} */
    props = props || {};

    let originalGetSeedState = getSeedState;
    let originalParentCallback = parentCallback;

    let stateCount = 0;
    let effectCount = 0;

    /** @type {ComponentEnvironment} */
    let seed = originalGetSeedState(type, props) || {};
    let { isActive = false, vars = {}, effects = [], childs = [], node, lastVDOM } = seed;

    let internalUseState = init => {
      let key = stateCount++;
      let value = vars[key];

      if (value === undefined) {
        value = init;
      }

      return [
        value,
        next => {
          vars[key] = next;
          save();
          update();
        }
      ];
    };

    let internalUseEffect = (f, unique) => {
      let key = effectCount++;
      /** @type {Effect} */
      let effect = { ...(effects[key] || {}), f, unique };
      effects[key] = effect;
    };

    let internalGetSeedState = (find, props) => {
      for (let index in childs) {
        /** @type {ComponentEnvironment} */
        let child = childs[index];
        let key = child.props.key;
        if (child.type === find && key === props.key) {
          return { ...child, isActive };
        }
      }
    };

    let internalParentCallback = (data, toRemove) => {
      if (toRemove) {
        childs = childs.filter(child => !(child.type === data.type && child.props.key === data.props.key));
      } else {
        let exists = childs.reduce(
          (total, curr) => (curr.type === data.type && curr.props.key === data.props.key ? true : total),
          false
        );
        if (exists) {
          childs = childs.map(child => (child.type === data.type && child.props.key === data.props.key ? data : child));
        } else {
          childs.push(data);
        }
      }

      save();
    };

    let work = () => {
      actualUseState = internalUseState;
      actualUseEffect = internalUseEffect;
      getSeedState = internalGetSeedState;
      parentCallback = internalParentCallback;

      /** @type {VDOM} */
      let res = type({ ...props, children });

      stateCount = 0;
      effectCount = 0;
      actualUseState = NOOP;
      actualUseEffect = NOOP;
      getSeedState = originalGetSeedState;
      parentCallback = originalParentCallback;

      /** @type {VDOM} */
      return { ...res, props: { ...res.props, oncreate, onupdate, onremove, ondestroy } };
    };

    let oncreate = el => {
      node = el;
      isActive = true;
      save();
      callEffects();
    };

    let onupdate = el => {
      node = el;
      isActive = true;
      save();
      requestAnimationFrame(callEffects);
    };

    let onremove = (el, remove) => {
      node = el;
      isActive = false;
      save();
      update();
      remove();
    };

    let ondestroy = el => {
      node = el;
      isActive = false;
      originalParentCallback(env(), true); // remove records from parent
    };

    let save = () => {
      originalParentCallback(env());
    };

    let env = () => {
      /** @type {ComponentEnvironment} */
      return { type, props, vars, childs, node, lastVDOM, effects };
    };

    let update = () => {
      if (!isActive) return;
      let container = lastVDOM.element ? lastVDOM.element.parentElement : node.parentElement;
      lastVDOM = superfine.patch(lastVDOM, work(), container);
    };

    let callEffects = () => {
      for (let key in effects) {
        /** @type {Effect} */
        let value = effects[key];
        let { f, unique, last, cb } = value;
        let serialized = (Array.isArray(unique) ? unique : [unique]).join();

        if (unique === undefined || last !== serialized || !isActive) {
          cb && cb();

          if (isActive) {
            effects[key].cb = f(node);
            effects[key].last = serialized;
          }
        }
      }
    };

    /** @type {VDOM} */
    let results = (lastVDOM = work());
    return results.element

  },

  /**
   * @export
   */
  render: (app, el) => superfine.patch(null, app, el),

  /**
   * @export
   */
  useState: val => actualUseState(val),

  /**
   * @export
   */
  useEffect: (f, unique) => actualUseEffect(f, unique)
};
