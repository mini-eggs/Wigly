import test from "ava";
import { component, render } from "../";
import { resolve } from "path";

require("browser-env")();

let asyncRender = component => {
  return new Promise(resolve => {
    let el = document.createElement("div");
    render(component, el, () => {
      resolve(el);
    });
  });
};

// Most basic of tests

test("'Hello, World' basic 1.", async t => {
  let el = await asyncRender("Hello, World!");
  t.deepEqual(el.textContent, "Hello, World!");
});

test("'Hello, World' basic 2.", async t => {
  let el = await asyncRender({ children: "Hello, World!" });
  t.deepEqual(el.textContent, "Hello, World!");
});

test("'Hello, World' basic 3.", async t => {
  let el = await asyncRender(() => ({ children: "Hello, World!" }));
  t.deepEqual(el.textContent, "Hello, World!");
});

// Normal components.

test("'Hello, World' component.", async t => {
  let SimpleComponentRenderTest = component({
    render() {
      return { children: "Hello, World!" };
    }
  });

  let el = await asyncRender(SimpleComponentRenderTest);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("Composed components.", async t => {
  let ChildComponent = component({
    render() {
      return { children: "You're name is Evan." };
    }
  });

  let ParentComponent = component({
    render() {
      return { children: [{ tag: ChildComponent }] };
    }
  });

  let el = await asyncRender(ParentComponent);
  t.deepEqual(el.textContent, "You're name is Evan.");
});

test("Composed components with props.", async t => {
  let ChildComponent = component({
    render() {
      return { children: `You're name is ${this.props.name}.` };
    }
  });

  let ParentComponent = component({
    render() {
      return { children: [{ tag: ChildComponent, name: "Evan" }] };
    }
  });

  let el = await asyncRender(ParentComponent);
  t.deepEqual(el.textContent, "You're name is Evan.");
});

test("Composed components with children.", async t => {
  throw new Error("TODO");
});

test("Updating components works as expected.", async t => {
  let parentCtx;

  let ChildComponent = component({
    render() {
      return { children: `You're name is ${this.props.name}.` };
    }
  });

  let ParentComponent = component({
    data() {
      return { name: "Evan" };
    },
    render() {
      parentCtx = this;
      return { children: [{ tag: ChildComponent, name: this.state.name }] };
    }
  });

  let el = await asyncRender(ParentComponent);

  t.deepEqual(el.textContent, "You're name is Evan.");

  await new Promise(resolve => {
    parentCtx.setState(() => ({ name: "Robby" }), resolve);
  });

  t.deepEqual(el.textContent, "You're name is Robby.");
});

// Functional components

test("'Hello, World' functional component.", async t => {
  let SimpleComponentRenderTest = () => ({ children: "Hello, World!" });
  let el = await asyncRender(SimpleComponentRenderTest);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("Composed functional components.", async t => {
  let ChildComponent = () => ({ children: "You're name is Evan." });
  let ParentComponent = () => ({ children: [{ tag: ChildComponent }] });
  let el = await asyncRender(ParentComponent);
  t.deepEqual(el.textContent, "You're name is Evan.");
});

test("Composed functional components with props.", async t => {
  let ChildComponent = ({ props }) => ({ children: `You're name is ${props.name}.` });
  let ParentComponent = () => ({ children: [{ tag: ChildComponent, name: "Evan" }] });
  let el = await asyncRender(ParentComponent);
  t.deepEqual(el.textContent, "You're name is Evan.");
});

test("Composed functional components with children.", async t => {
  throw new Error("TODO");
});
