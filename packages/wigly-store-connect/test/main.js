import test from "ava";
import wigly, { h, component, render } from "wigly";
import { createStore } from "wigly-store";
import { createConnector } from "../";

let React = { createElement: h }; // because jsx reasons

require("browser-env")();

test("This is a triumph.", t => {
  let user = {
    UPDATE_NAME: ({ payload }) => ({ name: payload }),
    _: ({ store = { name: "Evan" } }) => store
  };

  let connector = createConnector(wigly, createStore({ user }));

  let userConnector = connector(
    state => ({ ...state.user }),
    dispatch => ({ updateName: val => dispatch("UPDATE_NAME", val) })
  );

  let updaterFunc;
  let Parent = component({
    render() {
      updaterFunc = this.props.updateName;
      return <div>Hello, {this.props.name}!</div>;
    }
  });

  Parent = userConnector(Parent);

  let App = component({
    render() {
      return <Parent />;
    }
  });

  let el = render(App, document.body);
  t.deepEqual(el.textContent, "Hello, Evan!");

  updaterFunc("Joba");
  t.deepEqual(el.textContent, "Hello, Joba!");
});
