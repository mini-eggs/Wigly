export var h = (f, props, ...children) => {
  children = [].concat.apply([], children);
  return { tag: f, ...props, children };
};
