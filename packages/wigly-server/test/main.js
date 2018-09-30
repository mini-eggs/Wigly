import test from "ava";
import { h } from "wigly-jsx";
import render from "../";

let React = { createElement: h }; // because jsx reasons

test("Hello World", t => {
  let app = { render: () => ({ children: "Hello, World!" }) };
  let str = render(app);
  t.deepEqual(str, "<div>Hello, World!</div>");
});

test("Styles", t => {
  let app = { render: () => ({ children: "Hello, World!", style: { backgroundColor: "blue" } }) };
  let str = render(app);
  t.deepEqual(str, `<div style="background-color:blue;">Hello, World!</div>`);
});

test("Complex styles", t => {
  let Parent = {
    render() {
      return (
        <div id="parent">
          <main style={{ fontSize: "18px" }}>This is a triumph.</main>
        </div>
      );
    }
  };

  let App = {
    render() {
      return <Parent />;
    }
  };

  let str = render(App);
  t.deepEqual(str, `<div id="parent"><main style="font-size:18px;">This is a triumph.</main></div>`);
});

test("Conditional are not rendered.", t => {
  let App = { render: () => <div>{false}</div> };
  let str = render(App);
  t.deepEqual(str, "<div></div>");
});
