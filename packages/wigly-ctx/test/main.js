import test from "ava";
import wigly from "wigly";
import contextualize from "../";

require("browser-env")();

test("Hello World!", t => {
  var Child = {
    render() {
      return { children: this.helloWorldMsg };
    }
  };

  var App = {
    render() {
      return { tag: Child };
    }
  };

  var el = wigly.render(App, document.body, contextualize({ helloWorldMsg: "Hello, World!" }));
  t.deepEqual(el.textContent, "Hello, World!");
});
