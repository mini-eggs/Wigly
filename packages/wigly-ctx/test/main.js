import test from "ava";
import wigly from "wigly";
import customizer from "wigly-customizer";
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

  var ctx = customizer(contextualize({ helloWorldMsg: "Hello, World!" }));
  App = ctx(App);

  var el = wigly.render(App, document.body);
  t.deepEqual(el.textContent, "Hello, World!");
});
