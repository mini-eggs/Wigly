import * as superfine from "superfine";

let hookError = () => {
  throw new Error("May only call hooks from within components.");
};

let useState = hookError;
let useEffect = hookError;
let getSeedState = () => ({});
let parentCallback = () => {};

let h = (type, props, ...rest) => {
  if (typeof type !== "function") {
    return superfine.h(type, props, ...rest);
  }

  let originalGetSeedState = getSeedState;
  let originalParentCallback = parentCallback;
  let seed = originalGetSeedState(type, props);
  let stateCount = 0;
  let effectCount = 0;

  let { state = {}, effects = [], children = [], element, lastVDOM } = seed || {};

  let internalUseState = init => {
    let key = stateCount++;
    let value = state[key];

    if (value === undefined) {
      value = init;
    }

    return [
      value,
      next => {
        state[key] = next;
        save();
        update();
      }
    ];
  };

  let internalUseEffect = (f, unique) => {
    let key = effectCount++;
    effects[key] = { ...effects[key], f, unique };
  };

  let internalGetSeedState = (find, props) => {
    for (let child of children) {
      let key = (child.props || {}).key;
      if (child.type === find && key === (props || {}).key) {
        return child;
      }
    }
  };

  let internalParentCallback = data => {
    children.push(data);
  };

  return work();

  function work() {
    useState = internalUseState;
    useEffect = internalUseEffect;
    getSeedState = internalGetSeedState;
    parentCallback = internalParentCallback;

    let res = type({ props });

    stateCount = 0;
    effectCount = 0;
    useState = hookError;
    useEffect = hookError;
    getSeedState = originalGetSeedState;
    parentCallback = originalParentCallback;

    return (lastVDOM = { ...res, props: { ...res.props, oncreate, onupdate, ondestroy } });
  }

  function oncreate(el) {
    element = el;
    save();
    callEffects(true);
  }

  function onupdate() {
    callEffects(true);
  }

  function ondestroy() {
    callEffects(false);
  }

  function save() {
    originalParentCallback({ type, props, state, children, element, lastVDOM, effects });
  }

  function update() {
    superfine.patch(lastVDOM, work(), element);
  }

  function callEffects(call) {
    for (let key in effects) {
      let { f, unique, last, cb } = effects[key];
      let serialized = (Array.isArray(unique) ? unique : [unique]).join();
      if (unique === undefined || last !== serialized) {
        cb && cb();
        if (call) {
          effects[key].cb = f(element);
          effects[key].last = serialized;
        }
      }
    }
  }
};

let render = (app, el) => superfine.patch(null, app, el);

export { h, render, useState, useEffect };
