require("browser-env")();

let test = require("ava");
let { h, render, state, effect } = require("../dist/wigly.es6");

let click = async query => {
  let $ = document.querySelector.bind(document);
  let sleep = (t = 0) => new Promise(r => setTimeout(r, t));
  $(query).click();
  await sleep();
};

test("'Hello, World'", t => {
  let App = () => {
    let [msg] = state("Hello, World!");
    return <div>{msg}</div>;
  };

  render(<App />, document.body);

  t.deepEqual(document.body.textContent, "Hello, World!");
});

test("Effects works as mounted and unmounted.", async t => {
  t.plan(2);
  let Child = () => {
    effect(() => {
      t.deepEqual(true, true);
      return () => t.deepEqual(true, true);
    });
    return h("div", {}, "Child goes here.");
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
  render(<App />, document.body);
  await click("button");
  await click("button");
});
