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
  let parentCtx;

  let child = component({
    render() {
      return { children: `Current Count: ${this.props.count}` };
    }
  });

  let parent = component({
    data() {
      return { count: 0 };
    },
    render() {
      parentCtx = this;
      return {
        children: [{ tag: child, count: this.state.count }]
      };
    }
  });

  let el = await asyncRender(parent);
  await new Promise(resolve => parentCtx.setState(({ count }) => ({ count: count + 1 }), resolve));
  t.deepEqual(el.textContent, "Current Count: 1");

  await Promise.all([
    new Promise(resolve => parentCtx.setState(({ count }) => ({ count: count + 1 }), resolve)),
    new Promise(resolve => parentCtx.setState(({ count }) => ({ count: count + 1 }), resolve)),
    new Promise(resolve => parentCtx.setState(({ count }) => ({ count: count + 1 }), resolve))
  ]);
  t.deepEqual(el.textContent, "Current Count: 4");
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

test("String children are updated as expected.", async t => {
  let parentCtx;

  let Child = component({
    render() {
      return { children: `Children here: ${this.children}` };
    }
  });

  let Parent = component({
    data() {
      return { children: "Hello, World!" };
    },
    render() {
      parentCtx = this;
      return { children: [{ tag: Child, children: this.state.children }] };
    }
  });

  let el = await asyncRender(Parent);
  t.deepEqual(el.textContent, "Children here: Hello, World!");
  await new Promise(resolve => parentCtx.setState(() => ({ children: "This is a triumph." }), resolve));
  t.deepEqual(el.textContent, "Children here: This is a triumph.");
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
  let currentCount = 0;

  let child = ({ props }) => ({ children: `Current Count: ${props.count}` });
  let parent = () => ({ children: [{ tag: child, count: currentCount }] });

  let el = await asyncRender(parent);
  t.deepEqual(el.textContent, "Current Count: 0");

  currentCount += 3;

  el = await asyncRender(parent);
  t.deepEqual(el.textContent, "Current Count: 3");
});

// misc

test("Components work as first child part 1.", async t => {
  let child = component({
    render() {
      return { children: "here we go" };
    }
  });

  let parent = component({
    render() {
      return { tag: child };
    }
  });

  let el = await asyncRender(parent);
  t.deepEqual(el.textContent, "here we go");
});

test("Components work as first child part 2.", async t => {
  let child = component({
    render() {
      return { children: "here we go" };
    }
  });

  let parent = component({
    render() {
      return child;
    }
  });

  let el = await asyncRender(parent);
  t.deepEqual(el.textContent, "here we go");
});

test("Components can return null", async t => {
  let item = component({
    render() {
      return null;
    }
  });

  let el = await asyncRender(item);
  t.deepEqual(el.textContent, "");
});

// Lifecycles

test("Lifecycles work as expected part 1.", async t => {
  let lifecycles = [];
  let parentCtx;

  let child = component({
    mounted() {
      lifecycles.push("mounted");
    },
    updated() {
      lifecycles.push("updated");
    },
    destroyed() {
      lifecycles.push("destroyed");
    },
    render() {
      return { children: "hello world" };
    }
  });

  let parent = component({
    data() {
      return {
        active: true,
        text: "Hi!"
      };
    },

    render() {
      parentCtx = this;

      if (!this.state.active) {
        return {};
      }

      return {
        children: [
          {
            tag: child,
            text: this.state.text
          }
        ]
      };
    }
  });

  await asyncRender(parent);
  await new Promise(resolve => parentCtx.setState(() => ({ text: "Hello!" }), resolve));
  await new Promise(resolve => parentCtx.setState(() => ({ active: false }), resolve));
  t.deepEqual(lifecycles, ["mounted", "updated", "destroyed"]);
});

test("Lifecycles work as expected part 2.", async t => {
  let childMounted = false;
  let parentMounted = false;

  let child = component({
    mounted() {
      childMounted = true;
    },
    render() {
      return { children: "hello world" };
    }
  });

  let parent = component({
    mounted() {
      parentMounted = true;
    },
    render() {
      return child;
    }
  });

  await asyncRender(parent);
  t.deepEqual(childMounted, true);
  t.deepEqual(parentMounted, true);
});

test("Lifecycles work as expected part 3.", async t => {
  let lifecycles = [];
  let parentCtx;

  let child = component({
    mounted() {
      lifecycles.push("mounted");
    },
    updated() {
      lifecycles.push("updated");
    },
    destroyed() {
      lifecycles.push("destroyed");
    },
    render() {
      return { children: "hello world" };
    }
  });

  let parent = component({
    data() {
      return {
        active: true,
        text: "Hi!"
      };
    },

    render() {
      parentCtx = this;

      if (!this.state.active) {
        return { children: "inactive" };
      }

      return {
        tag: child,
        text: this.state.text
      };
    }
  });

  await asyncRender(parent);
  await new Promise(resolve => parentCtx.setState(() => ({ text: "Hello!" }), resolve));
  await new Promise(resolve => parentCtx.setState(() => ({ active: false }), resolve));

  t.deepEqual(lifecycles, ["mounted", "updated", "destroyed"]);
});
