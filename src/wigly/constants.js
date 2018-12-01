let current;

export let getCurrentlyExecutingComponent = () => current;

export let setCurrentlyExecutingComponent = f => (current = f);

export let defer = Promise.resolve().then.bind(Promise.resolve());

export let traverse = (tree, f) => {
  Object.assign(tree, f(tree));
  if (tree.children) {
    for (let key in tree.children) {
      tree.children[key] = traverse(tree.children[key], f);
    }
  }
  return tree;
};
