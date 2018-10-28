import test from "ava";
import wigly from "wigly";
import { use, useState, useEffect } from "../";

require("browser-env")();

test("Hello World!", t => {
  function app() {
    var [msg] = useState("Hello, World!");
    return <div>{msg}</div>;
  }

  var el = wigly.render(app, document.body, use);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("useMount.", async t => {
  var mounted = false;

  var useMount = f => {
    var [hasRendered, setRenderStatus] = useState(false);

    // next tick
    setTimeout(() => {
      if (!hasRendered) {
        setRenderStatus(true);
        f();
      }
    }, 1);
  };

  function app() {
    useMount(() => (mounted = true));
    return <div>Hi!</div>;
  }

  wigly.render(app, document.body, use);

  await new Promise(r => setTimeout(r, 1));

  t.deepEqual(mounted, true);
});

test("Click test.", t => {
  function Button() {
    var [count, set] = useState(0);
    return <button onclick={() => set(count + 1)}>Click count: {count}</button>;
  }

  var el = wigly.render(Button, document.body, use);
  t.deepEqual(el.textContent, "Click count: 0");

  el.click();
  t.deepEqual(el.textContent, "Click count: 1");
});

test("Falsy values are correct.", t => {
  function Button() {
    var [status, set] = useState(false);
    return <button onclick={() => set(!status)}>active: {status ? "yes" : "no"}</button>;
  }

  var el = wigly.render(Button, document.body, use);
  t.deepEqual(el.textContent, "active: no");

  el.click();
  t.deepEqual(el.textContent, "active: yes");

  el.click();
  t.deepEqual(el.textContent, "active: no");

  el.click();
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
      }, 200);
    });

    return <h1>{msg}</h1>;
  }

  var el = wigly.render(Title, document.body, use);
  await new Promise(r => setTimeout(r, 100));

  t.deepEqual(effected, 4);
  t.deepEqual(el.textContent, "yo");

  await new Promise(r => setTimeout(r, 200));

  t.deepEqual(effected, 6);
  t.deepEqual(el.textContent, "wow");
  t.deepEqual(mounted, 1);
});
