import test from "ava";

let { h, render, useState, useEffect } = require("../");

require("browser-env")();

test("'Hello, World!'", t => {
  let App = () => <div>Hello, World!</div>;
  let el = render(<App />, document.body);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("'useEffect' as mount.", t => {
  let mountedCount = 0;
  let set;

  let App = () => {
    let [count, setCount] = useState(0);
    set = setCount;
    useEffect(() => mountedCount++, 0);
    return <div>here we go</div>;
  };

  render(<App />, document.body);
  t.deepEqual(mountedCount, 1);
  set(1);
  t.deepEqual(mountedCount, 1);
});

test("'useEffect' as mount, destroyed func.", t => {
  let destroyCount = 0;
  let set;

  let Child = () => {
    useEffect(() => () => destroyCount++, 0);
    return <div>hi</div>;
  };

  let App = () => {
    let [count, setCount] = useState(0);
    set = setCount;
    return <div>{count === 0 && <Child />}</div>;
  };

  render(<App />, document.body);
  t.deepEqual(destroyCount, 0);
  set(1);
  t.deepEqual(destroyCount, 1);
});
