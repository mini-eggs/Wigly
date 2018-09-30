import test from "ava";
import { component, render, IComponent } from "../dist/es6";

// @ts-ignore
require("browser-env")();

test("Typed components work as expected.", t => {
  interface ChildProps {
    greeting: string;
  }

  interface ChildState {
    name: string;
  }

  console.log("HERE WE GO 1");

  var Child: IComponent<ChildProps, ChildState> = component({
    data() {
      return { name: "Evan" };
    },

    render() {
      return { children: `${this.props.greeting}, ${this.state.name}!` };
    }
  });

  console.log("HERE WE GO 2");

  var Parent: IComponent<{}, {}> = component({
    data() {
      return {};
    },

    render() {
      return Child({ greeting: "Hi" });
    }
  });

  console.log("HERE WE GO 3");

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Hi, Evan!");
});
