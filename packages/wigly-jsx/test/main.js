import test from "ava";
import { render } from "wigly";
import { h } from "../";

var React = { createElement: h };

require("browser-env")();

test("Hello World!", t => {
  var App = { render: () => <div>Hello, World!</div> };
  var el = render(App, document.body);
  t.deepEqual(el.textContent, "Hello, World!");
});
