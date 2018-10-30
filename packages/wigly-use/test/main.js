import test from "ava";
import wigly from "wigly";
import { use, useState, useEffect } from "../";

require("browser-env")();

var sleep = (t = 10) => new Promise(r => setTimeout(r, t));

test("Hello World!", t => {
  function app() {
    var [msg] = useState("Hello, World!");
    return <div>{msg}</div>;
  }

  var el = wigly.render(app, document.body, use);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("Click test.", async t => {
  function Button() {
    var [count, set] = useState(0);
    return <button onclick={() => set(count + 1)}>Click count: {count}</button>;
  }

  var el = wigly.render(Button, document.body, use);
  t.deepEqual(el.textContent, "Click count: 0");

  el.click();
  await sleep();

  t.deepEqual(el.textContent, "Click count: 1");
});

test("Falsy values are correct.", async t => {
  function Button() {
    var [status, set] = useState(false);
    return <button onclick={() => set(!status)}>active: {status ? "yes" : "no"}</button>;
  }

  var el = wigly.render(Button, document.body, use);
  t.deepEqual(el.textContent, "active: no");

  el.click();
  await sleep();

  t.deepEqual(el.textContent, "active: yes");

  el.click();
  await sleep();

  t.deepEqual(el.textContent, "active: no");

  el.click();
  await sleep();

  t.deepEqual(el.textContent, "active: yes");
});

test("Test effects.", async t => {
  var effected = 0;
  var mounted = 0;

  function Title() {
    var [msg, set] = useState("hi");

    useEffect(() => {
      if (mounted === 0) {
        mounted++;
      }
    });

    useEffect(() => {
      effected++;
    });

    useEffect(() => {
      effected++;
      if (msg === "hi") set("yo");
    });

    useEffect(() => {
      setTimeout(() => {
        if (msg === "yo") set("wow");
      }, 10);
    });

    return <h1>{msg}</h1>;
  }

  var el = wigly.render(Title, document.body, use);

  await sleep(100);

  t.deepEqual(effected, 6);
  t.deepEqual(el.textContent, "wow");
  t.deepEqual(mounted, 1);
});

test("useMount", async t => {
  var callCount = 0;
  var setter;

  var useMount = f => {
    var [target, set] = useState();

    useEffect(el => {
      if (!target) {
        set(el);
        f();
      }
    });
  };

  function App() {
    let [msg, set] = useState("loading");

    useMount(() => {
      callCount++;
      set("done");
    });

    setter = set;

    return <div>{msg}</div>;
  }

  var el = wigly.render(App, document.body, use);

  t.deepEqual(el.textContent, "loading");

  await sleep(1);

  t.deepEqual(el.textContent, "done");

  setter("test");

  await sleep(1);

  t.deepEqual(el.textContent, "test");
  t.deepEqual(callCount, 1);
});
