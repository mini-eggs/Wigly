export var h = (f, props, ...children) => {
  children = [].concat.apply([], children);
  return f["__fc__"] ? f({ ...props, children }) : { tag: f, ...props, children };
  // return typeof f === "function" ? f({ ...props, children }) : { tag: f, ...props, children };
};
