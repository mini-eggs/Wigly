import { defer } from "./constants";
import { transformer } from "./transformer";
import { h } from "./jsx";
import { patch } from "../superfine/superfine";

export let render = (f, el) => {
  let cb;
  defer(() => {
    transformer(
      h(() => f),
      () => ({}),
      () => ({}),
      /**
       * @param {UpperVDOM} vdom
       */
      vdom => {
        patch(null, vdom, el);
        cb && cb(vdom.element);
      },
      () => {}
    );
  });
  return { then: f => (cb = f) };
};
