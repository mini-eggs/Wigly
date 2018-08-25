import test from "ava";
import { component, render } from "../";

require("browser-env")();

test("'Hello, World!' - part one", async t => {
  let HelloWorld = component({
    render() {
      return { children: "Hello, World!" };
    }
  });

  let el = render(HelloWorld, document.body);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("Ensure prop updates happen everywhere", async t => {
  let childCtx;
  let parentCtx;

  let Child = component({
    tester() {
      return this.props.title;
    },
    render() {
      childCtx = this;
      return { children: [{ children: this.props.title }] };
    }
  });

  let Parent = component({
    data() {
      return { title: "Hello, World!" };
    },
    render() {
      parentCtx = this;
      return { children: [{ tag: Child, title: this.state.title }] };
    }
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Hello, World!");

  parentCtx.setState(() => ({ title: "Hello, Twitter!" }));
  t.deepEqual(el.textContent, "Hello, Twitter!");
  t.deepEqual(childCtx.tester(), "Hello, Twitter!");
});

test("Nully render", async t => {
  let Child = component({
    render() {
      return null;
    }
  });

  let Parent = component({
    render() {
      return { children: [{ tag: Child }] };
    }
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "");

  Parent = component({
    render() {
      return { children: [null] };
    }
  });

  el = render(Parent, document.body);
  t.deepEqual(el.textContent, "");
});

test("Falsies render", async t => {
  let Child = component({
    render() {
      return false;
    }
  });

  let Parent = component({
    render() {
      return { children: [{ tag: Child }] };
    }
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "");

  Parent = component({
    render() {
      return { children: [false] };
    }
  });

  el = render(Parent, document.body);
  t.deepEqual(el.textContent, "");
});
