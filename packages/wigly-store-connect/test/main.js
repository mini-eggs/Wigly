import test from "ava";
import { h, render } from "wigly";
import { createStore } from "wigly-store";
import { createConnector } from "../";

var React = { createElement: h }; // because jsx reasons

require("browser-env")();

test("This is a triumph.", t => {
  var user = {
    UPDATE_NAME: ({ payload }) => ({ name: payload }),
    _: ({ store = { name: "Evan" } }) => store
  };

  var store = createStore({ user });
  var connector = createConnector(store);

  var userConnector = connector(
    state => ({ ...state.user }),
    dispatch => ({ updateName: val => dispatch("UPDATE_NAME", val) })
  );

  var updaterFunc;

  var Parent = {
    render() {
      updaterFunc = this.props.updateName;
      return <div>Hello, {this.props.name}!</div>;
    }
  };

  Parent = userConnector(Parent);

  var App = {
    render() {
      return <Parent />;
    }
  };

  var el = render(App, document.body);
  t.deepEqual(el.textContent, "Hello, Evan!");

  updaterFunc("Joba");
  t.deepEqual(el.textContent, "Hello, Joba!");
});
