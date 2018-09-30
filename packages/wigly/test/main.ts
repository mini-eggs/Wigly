import test from "ava";
import { component, render, IComponent } from "../dist/es6";

// @ts-ignore
require("browser-env")();

test("Typed components work as expected.", t => {
  var Child: IComponent<{ greeting: string }, { name: string }> = component({
    data() {
      return { name: "Evan" };
    },

    render() {
      return { children: `${this.props.greeting}, ${this.state.name}!` };
    }
  });

  var Parent: IComponent<{}, {}> = component({
    data() {
      return {};
    },

    render() {
      return Child({ greeting: "Hi" });
    }
  });

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Hi, Evan!");
});
