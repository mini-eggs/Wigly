import { defer, getCurrentlyExecutingComponent } from "./constants";

/**
 * @param {*} init
 * @return {[*, Function]} fo
 */
export let state = init => {
  /** @type {ComponentContext} */
  let curr = getCurrentlyExecutingComponent();
  let key = curr.iter++;
  let val = curr.states[key];

  if (typeof val === "undefined") {
    if (typeof init === "function") {
      val = init();
    } else {
      val = init;
    }
  }

  return [
    val,
    next => {
      curr.states[key] = next;
      defer(curr.update);
    }
  ];
};
