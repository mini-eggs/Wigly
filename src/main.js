/**
 * TYPES
 */

/**
 * @record
 */
function ComponentEnvironment() {}
/** @type {?} */
ComponentEnvironment.prototype.type;
/** @type {?} */
ComponentEnvironment.prototype.props;
/** @type {?} */
ComponentEnvironment.prototype.vars;
/** @type {?} */
ComponentEnvironment.prototype.childs;
/** @type {?} */
ComponentEnvironment.prototype.node;
/** @type {?} */
ComponentEnvironment.prototype.lastVDOM;
/** @type {?} */
ComponentEnvironment.prototype.effects;
/** @type {?} */
ComponentEnvironment.prototype.isActive;

/**
 * @record
 */
function SuperFineArgs() {}
/** @export @type {?} */
SuperFineArgs.prototype.props;

/**
 * @record
 */
function InternalLifecycle() {}
/** @export @type {?} */
InternalLifecycle.prototype.oncreate;
/** @export @type {?} */
InternalLifecycle.prototype.onupdate;
/** @export @type {?} */
InternalLifecycle.prototype.onremove;
/** @export @type {?} */
InternalLifecycle.prototype.ondestroy;

/**
 * @record
 */
function VDOM() {}
/** @export @type {InternalLifecycle} */
VDOM.prototype.props;

/**
 * @record
 */
function Effect() {}
/** @type {?} */
Effect.prototype.f;
/** @type {?} */
Effect.prototype.unique;
/** @type {?} */
Effect.prototype.last;
/** @type {?} */
Effect.prototype.cb;

/**
 * VARS
 */

let NOOP = () => {};
let actualUseState = NOOP;
let actualUseEffect = NOOP;
let getSeedState = NOOP;
let parentCallback = NOOP;

/**
 * FUNCTIONS
 */

let h = (type, props, ...rest) => {
  if (typeof type !== "function") {
    return superfine.h(type, props, ...rest);
  }

  let originalGetSeedState = getSeedState;
  let originalParentCallback = parentCallback;

  let stateCount = 0;
  let effectCount = 0;

  /** @type {ComponentEnvironment} */
  let seed = originalGetSeedState(type, props) || {};
  let { isActive = true, vars = {}, effects = [], childs = [], node, lastVDOM } = seed;

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
    let effect = { ...effects[key], f, unique };
    effects[key] = effect;
  };

  let internalGetSeedState = (find, props) => {
    for (let index in childs) {
      /** @type {ComponentEnvironment} */
      let child = childs[index];
      let key = (child.props || {}).key;
      if (child.type === find && key === (props || {}).key) {
        return { ...child, isActive };
      }
    }
  };

  // TODO: it's bogus.
  let internalParentCallback = data => {
    if (!data) {
      childs = [];
      return;
    }
    childs.push(data);
  };

  return work();

  function work() {
    actualUseState = internalUseState;
    actualUseEffect = internalUseEffect;
    getSeedState = internalGetSeedState;
    parentCallback = internalParentCallback;

    /** @type {SuperFineArgs} */
    let args = { props };

    /** @type {VDOM} */
    let res = type(args);

    stateCount = 0;
    effectCount = 0;
    actualUseState = NOOP;
    actualUseEffect = NOOP;
    getSeedState = originalGetSeedState;
    parentCallback = originalParentCallback;

    /** @type {VDOM} */
    let vdom = { ...res, props: { ...res.props, oncreate, onupdate, onremove, ondestroy } };

    return (lastVDOM = vdom);
  }

  function oncreate(el) {
    node = el;
    save();
    callEffects();
  }

  function onupdate() {
    callEffects();
  }

  function onremove(_, remove) {
    isActive = false;
    callEffects();
    update();
    remove();
    reset();
  }

  function ondestroy() {
    callEffects();
    reset();
  }

  function save() {
    /** @type {ComponentEnvironment} */
    let env = { type, props, vars, childs, node, lastVDOM, effects };
    originalParentCallback(env);
  }

  function reset() {
    originalParentCallback();
  }

  function update() {
    superfine.patch(lastVDOM, work(), node);
  }

  function callEffects() {
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
  }
};

let render = (app, el) => superfine.patch(null, app, el);
let useState = val => actualUseState(val);
let useEffect = (f, unique) => actualUseEffect(f, unique);

export { h, render, useState, useEffect };
