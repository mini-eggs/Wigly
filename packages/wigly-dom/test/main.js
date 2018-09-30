import test from "ava";
import { render } from "wigly";
import { component } from "wigly-component";
import { dom } from "../";

require("browser-env")();

test("Hello World!", t => {
  var App = component({
    render: () => dom.div("Hello, World!")
  });

  var el = render(App, document.body);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("A bit more complicated.", t => {
  var Child = component({
    data() {
      return { count: this.props.seed };
    },

    handleClick() {
      this.setState(({ count }) => ({ count: count + 1 }));
    },

    render() {
      return dom.button({ onclick: this.handleClick, children: this.state.count });
    }
  });

  var Parent = component({
    render: () => Child({ seed: 0 })
  });

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, "0");

  el.click();
  t.deepEqual(el.textContent, "1");
});
