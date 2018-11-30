require("browser-env")();

let test = require("ava");
let { h, render, state, effect } = require("../");

// console.log(require("../"));
// process.exit(0);

let sleep = t => new Promise(r => setTimeout(r, t));

test("'Hello, World'", t => {
  t.plan(1);

  let App = () => {
    let [msg] = state("Hello, World!");
    return <div>{msg}</div>;
  };

  render(<App />, document.body).then(el => {
    t.deepEqual(el.textContent, "Hello, World!");
  });

  return sleep();
});

test("Effects works as mounted and unmounted.", t => {
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

  render(<App />, document.body).then(el => {
    el.querySelector("button").click();
    el.querySelector("button").click();
  });

  return sleep();
});
