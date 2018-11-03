import test from "ava";
import { h, render, useState, useEffect } from "../";

require("browser-env")();

let sleep = (t = 1) => new Promise(r => setTimeout(r, t)); // Update "chunks" are pool'd together.

test("'Hello, World!'", async t => {
  let App = () => <div>Hello, World!</div>;
  let el = render(<App />, document.body);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("'useEffect' as mount.", async t => {
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
  await sleep();

  t.deepEqual(mountedCount, 1);
});

test("'useEffect' as mount, destroyed func.", async t => {
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
  await sleep();

  t.deepEqual(destroyCount, 1);
});
