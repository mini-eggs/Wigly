import { defer, ensureArr } from "./constants";
import { transformer } from "./transformer";
import { h } from "./jsx";
import { patch } from "../../node_modules/superfine/src/index.js";

export let render = (f, el) => {
  let cb;
  defer(() => {
    transformer(
      h(() => ensureArr(f)),
      () => ({}),
      () => ({}),
      vdom => {
        patch(null, vdom, el);
        cb && cb(vdom.element);
      },
      () => {}
    );
  });
  return { then: f => (cb = f) };
};
