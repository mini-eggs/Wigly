require("browser-env")();
require("@babel/polyfill");

let test = require("ava");
let { h, render, state, effect } = require("../dist/wigly.es5");

let sleep = (t = 1) => new Promise(r => setTimeout(r, t));

test("'Hello, World'", async t => {
  let App = () => {
    let [msg] = state("Hello, World!");
    return <div>{msg}</div>;
  };

  let element = await render(<App />, document.body);
  t.deepEqual(element.textContent, "Hello, World!");
});

test("Conditional components work as expected.", async t => {
  let App = () => {
    let [active, set] = state(true);
    return (
      <div>
        {active && <h1>hi</h1>}
        <button onclick={() => set(!active)} />
      </div>
    );
  };

  let element = await render(<App />, document.body);
  t.deepEqual(element.textContent, "hi");

  element.querySelector("button").click();
  await sleep();

  t.deepEqual(element.textContent, "");
});

test("Immediate component children lifecycles.", async t => {
  let parentMounted = false;
  let childMounted = false;

  function Child() {
    effect(() => {
      childMounted = true;
    });

    return <div>child</div>;
  }

  function Parent() {
    effect(() => {
      parentMounted = true;
    });

    return (
      <div>
        <Child />
      </div>
    );
  }

  await render(<Parent />, document.body);

  t.deepEqual(parentMounted, true);
  t.deepEqual(childMounted, true);
});

test("Immediate components are removed properly.", async t => {
  let setter;

  function ChildOne() {
    return <div>here we go</div>;
  }

  function ChildTwo() {
    return <ChildOne />;
  }

  function Parent() {
    let [active, set] = state(true);
    setter = set;
    return <div>{active && <ChildTwo />}</div>;
  }

  let element = await render(<Parent />, document.body);
  t.deepEqual(element.textContent, "here we go");

  setter(false);
  await sleep();

  t.deepEqual(element.textContent, "");
});

test("parent merges vdom", async t => {
  let childF;
  let parentF;

  let Child = () => {
    let [list, set] = state([]);

    childF = set;

    return (
      <div>
        {list.map(item => (
          <i>{item}</i>
        ))}
      </div>
    );
  };

  let Parent = () => {
    let [_, set] = state(0);
    parentF = set;

    return (
      <div>
        <Child />
      </div>
    );
  };

  function App() {
    return <Parent />;
  }

  let element = await render(<App />, document.body);
  t.deepEqual(element.textContent, "");

  childF(["hi"]);
  await sleep();

  t.deepEqual(element.textContent, "hi");

  parentF(1);
  await sleep();

  t.deepEqual(element.textContent, "hi");
});

test("Basic lazy components work as expected.", async t => {
  let LazyChild = () => Promise.resolve({ default: () => <div>here we go</div> });
  let element = await render(<LazyChild />, document.body);
  t.deepEqual(element.textContent, "here we go");
});
