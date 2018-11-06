import test from "ava";
import { h, render, useState, useEffect } from "../";

require("browser-env")();

test("'Hello, World'", t => {
  let App = () => {
    let [msg] = useState("Hello, World!");
    return h("div", {}, msg);
  };

  render(h(App), document.body);

  t.deepEqual(document.body.firstChild.textContent, "Hello, World!");
});
