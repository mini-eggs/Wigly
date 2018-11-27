require("browser-env")();

let test = require("ava");
let { h, render, state, effect } = require("../src/main");

let sleep = t => new Promise(r => setTimeout(r, t));

test("'Hello, World'", async t => {
  let App = () => {
    let [msg] = state("Hello, World!");
    return <div>{msg}</div>;
  };

  await render(<App />, document.body);

  t.deepEqual(document.body.textContent, "Hello, World!");
});

test("Effects works as mounted and unmounted.", async t => {
  t.plan(2);

  let Child = () => {
    effect(() => {
      t.deepEqual(true, true);
      return () => t.deepEqual(true, true);
    });
    return <div>child goes here</div>;
  };

  let App = () => {
    let [displayChild, set] = state(false);
    return (
      <div>
        <button onclick={() => set(!displayChild)}>click me</button>
        <div>{displayChild && <Child />}</div>
      </div>
    );
  };

  let el = await render(<App />, document.body);

  el.querySelector("button").click();
  el.querySelector("button").click();

  await sleep();
});
