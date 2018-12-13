import { ensureArr } from "./constants";

export let h = (f, props, ...children) => {
  children = children.reduce((total, curr) => {
    let allArray = ensureArr(curr).reduce(
      (status, val) => status && Array.isArray(val),
      true
    );

    return total.concat(allArray ? curr : [curr]);
  }, []);

  return [f, props || {}, ...children];
};
