import test from "ava";
import { render } from "wigly";
import { component } from "../";

require("browser-env")();

test("Hello World!", t => {
  var App = component({ render: () => ({ children: "Hello, World!" }) });
  var el = render(App, document.body);
  t.deepEqual(el.textContent, "Hello, World!");
});
