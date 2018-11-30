let current;

/**
 * @return {ComponentContext}
 */
export let getCurrentlyExecutingComponent = () => current;

/**
 * @param {ComponentContext} f
 */
export let setCurrentlyExecutingComponent = f => {
  current = f;
};

/**
 * @param {Function} f
 */
export let defer = Promise.resolve().then.bind(Promise.resolve());

/**
 * @param {HTMLElement} el
 * @param {ComponentContext} self
 */
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

/**
 * @param {UpperVDOM} tree
 * @param {Function} f
 * @return {UpperVDOM}
 */
export let traverse = (tree, f) => {
  Object.assign(tree, f(tree));
  if (tree.children) {
    for (let key in tree.children) {
      tree.children[key] = traverse(tree.children[key], f);
    }
  }
  return tree;
};
