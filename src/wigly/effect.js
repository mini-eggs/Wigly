import { getCurrentlyExecutingComponent } from "./constants";

export let effect = (f, ...args) => {
  let curr = getCurrentlyExecutingComponent();
  let key = curr.iter++;
  let last = curr.effects[key];
  curr.effects[key] = { prev: [], ...last, f, args };
};

export let runEffects = (el, self) => {
  for (let key in self.effects) {
    let { prev, args, f, cleanup } = self.effects[key];
    if (args && f && (typeof prev === "undefined" || args.length === 0 || prev.join() !== args.join())) {
      if (cleanup) {
        if (cleanup.then) {
          cleanup.then(f => f && f());
        } else {
          cleanup();
        }
      }
      self.effects[key] = { prev: args, cleanup: f(el) };
    }
  }
};
