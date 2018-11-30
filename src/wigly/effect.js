import { getCurrentlyExecutingComponent } from "./constants";

/**
 * @param {Function} f
 * @param {*[]=} args
 */
export let effect = (f, ...args) => {
  /** @type {ComponentContext} */
  let curr = getCurrentlyExecutingComponent();
  let key = curr.iter++;
  let last = curr.effects[key];
  curr.effects[key] = { prev: [], ...last, f, args };
};
