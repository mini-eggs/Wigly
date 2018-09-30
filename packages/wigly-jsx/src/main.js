export var h = (f, props, ...children) => {
  children = [].concat.apply([], children);
  return typeof f === "function" ? f({ ...props, children }) : { tag: f, ...props, children };
};
