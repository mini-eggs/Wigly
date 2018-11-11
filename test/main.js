import test from "ava";
import { h, render, useState, useEffect } from "../";

require("browser-env")();

test("'Hello, World'", t => {
  let App = () => {
    let [msg] = useState("Hello, World!");
    return <div>{msg}</div>;
  };

  let { element } = render(<App />, document.body);
  t.deepEqual(element.textContent, "Hello, World!");
});

test("Conditional components work as expected.", t => {
  let App = () => {
    let [active, set] = useState(true);
    return (
      <div>
        {active && <h1>hi</h1>}
        <button onclick={() => set(!active)} />
      </div>
    );
  };

  let { element } = render(<App />, document.body);
  t.deepEqual(element.textContent, "hi");

  element.querySelector("button").click();
  t.deepEqual(element.textContent, "");
});

test("Immediate component children lifecycles.", t => {
  let parentMounted = false;
  let childMounted = false;

  function Child() {
    useEffect(() => {
      childMounted = true;
    }, 0);

    return <div>child</div>;
  }

  function Parent() {
    useEffect(() => {
      parentMounted = true;
    }, 0);

    return <Child />;
  }

  render(<Parent />, document.body);
  t.deepEqual(parentMounted, true);
  t.deepEqual(childMounted, true);
});

test("Immediate components are removed properly.", t => {
  let setter;

  function ChildOne() {
    return <div>here we go</div>;
  }

  function ChildTwo() {
    return <ChildOne />;
  }

  function Parent() {
    let [active, set] = useState(true);
    setter = set;
    return <div>{active && <ChildTwo />}</div>;
  }

  var { element } = render(<Parent />, document.body);
  t.deepEqual(element.textContent, "here we go");

  setter(false);
  t.deepEqual(element.textContent, "");
});
