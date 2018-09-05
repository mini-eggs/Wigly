import test from "ava";
import { h, component, render, hydrate } from "../";

let React = { createElement: h }; // because jsx reasons

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

test("Passing children works through intermediate components.", async t => {
  let Child = component({
    render() {
      return { children: this.children };
    }
  });

  let Parent = component({
    render() {
      return { tag: Child, children: ["here", "we", "go"] };
    }
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, ["here", "we", "go"].join(""));
});

test("Passing children works through intermediate components with jsx.", async t => {
  let Child = component({
    render() {
      return <div>{this.children}</div>;
    }
  });

  let Parent = component({
    render() {
      return <Child>Here we go</Child>;
    }
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Here we go");
});

test("Lifecyles work as expected", async t => {
  let mountCount = 0;

  let Child = component({
    mounted() {
      mountCount++;
    },
    render() {
      return <div>testing</div>;
    }
  });

  let Parent = component({
    mounted() {
      mountCount++;
    },
    render() {
      return <Child />;
    }
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "testing");
  t.deepEqual(mountCount, 2);
});

test("Child components don't keep stale state.", async t => {
  let parentCtx;
  let childCtx;

  let Child = component({
    data() {
      return { name: "World" };
    },
    render() {
      childCtx = this;
      return <div>Hello, {this.state.name}!</div>;
    }
  });

  let Parent = component({
    data() {
      return { active: true };
    },
    render() {
      parentCtx = this;

      if (!this.state.active) {
        return <div>Testing</div>;
      }

      return (
        <div>
          <Child />
        </div>
      );
    }
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Hello, World!");

  childCtx.setState(() => ({ name: "Twitter" }));
  t.deepEqual(el.textContent, "Hello, Twitter!");

  parentCtx.setState(() => ({ active: false }));
  t.deepEqual(el.textContent, "Testing");

  parentCtx.setState(() => ({ active: true }));
  t.deepEqual(el.textContent, "Hello, World!");
});

test("Data hook has props and children set correctly.", async t => {
  let data;

  let Child = component({
    data() {
      data = this;
    },
    render() {
      return (
        <div>
          {this.props.greeting}, {this.children}
        </div>
      );
    }
  });

  let Parent = component({
    render() {
      return <Child greeting="Hello">World!</Child>;
    }
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Hello, World!");
  t.deepEqual(data, { props: { greeting: "Hello" }, children: ["World!"] });
});

test("Ensure mounted setState updates state", async t => {
  let test;

  let Child = component({
    data() {
      return { cb: false };
    },

    mounted() {
      this.setState(() => ({ cb: () => "Hello, Twitter!" }));
    },

    destroyed() {
      test = this.state.cb();
    },

    render() {
      return <div>Hello, World!</div>;
    }
  });

  let Parent = component({
    data() {
      return { active: true };
    },

    mounted() {
      this.setState(() => ({ active: false }));
    },

    render() {
      return <div>{this.state.active && <Child />}</div>;
    }
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "");
  t.deepEqual(test, "Hello, Twitter!");
});

test("Mapping props item stays consistent in DOM.", async t => {
  let parentCtx;

  let Child = component({
    render() {
      return (
        <div>
          {this.props.items.map(({ title }) => (
            <div>{title}</div>
          ))}
        </div>
      );
    }
  });

  let Parent = component({
    data() {
      return {
        items: [{ title: "here" }, { title: "we" }, { title: "go" }],
        active: true
      };
    },

    render() {
      parentCtx = this;
      return <div>{this.state.active && <Child items={this.state.items} />}</div>;
    }
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, ["here", "we", "go"].join(""));

  parentCtx.setState(() => ({ active: false }));
  t.deepEqual(el.textContent, "");
});

test("Children with conditional renders are removed from DOM properly.", t => {
  let childOneCtx;
  let childTwoCtx;
  let parentCtx;

  let DeepChild = component({
    render() {
      return <div>here we go</div>;
    }
  });

  let ChildOne = component({
    data() {
      return { active: false };
    },

    render() {
      childOneCtx = this;
      return (
        <div>
          {this.state.active && <DeepChild />}
          <div>Child One</div>
        </div>
      );
    }
  });

  let ChildTwo = component({
    render() {
      childTwoCtx = this;
      return <div>Child Two</div>;
    }
  });

  let Parent = component({
    data() {
      return { component: ChildOne, name: "ChildOne" };
    },

    render() {
      let Curr = this.state.component;
      parentCtx = this;
      return (
        <div>
          <Curr />
        </div>
      );
    }
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Child One");

  parentCtx.setState(() => ({ component: ChildTwo, name: "ChildTwo" }));
  t.deepEqual(el.textContent, "Child Two");

  parentCtx.setState(() => ({ component: ChildOne, name: "ChildOne" }));
  childOneCtx.setState(() => ({ active: true }));
  t.deepEqual(el.textContent, "here we go" + "Child One");

  parentCtx.setState(() => ({ component: ChildTwo, name: "ChildTwo" }));
  t.deepEqual(el.textContent, "Child Two");

  parentCtx.setState(() => ({ component: ChildOne, name: "ChildOne" }));
  t.deepEqual(el.textContent, "Child One");
});

test("setState and callback after mount works as expected", async t => {
  let parentCtx;
  let childCtx;
  let root;

  let promise = new Promise(resolve => {
    let Child = component({
      data() {
        return { count: 0 };
      },

      updated(el) {
        if (this.props.count === 1 && this.state.count === 0) {
          this.setState(({ count }) => ({ count: count + 1 }), () => this.onUpdate(el));
        }
      },

      onUpdate(el) {
        resolve({ el, ctx: this });
      },

      render() {
        childCtx = this;
        return (
          <div>
            {this.props.count} - {this.state.count}
          </div>
        );
      }
    });

    let Parent = component({
      data() {
        return { count: 0 };
      },

      render() {
        parentCtx = this;
        return <Child count={this.state.count} />;
      }
    });

    root = render(Parent, document.body);
  });

  t.deepEqual(root.textContent, "0 - 0");

  parentCtx.setState(() => ({ count: 1 }));

  let { el, ctx } = await promise;
  t.deepEqual(el.textContent, "1 - 1");
  t.deepEqual(ctx.props, { count: 1 });
  t.deepEqual(ctx.state, { count: 1 });
});

test("Swapping children works as expected.", t => {
  let ctx;

  let One = component({
    render: () => ({ children: "test 1" })
  });

  let Two = component({
    render: () => ({ children: "test 2" })
  });

  let Parent = component({
    data: () => ({ component: One }),
    render() {
      ctx = this;
      return <this.state.component />;
    }
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "test 1");

  ctx.setState(() => ({ component: Two }));
  t.deepEqual(el.textContent, "test 2");
});

test("Falsy values are renderd as comments.", t => {
  let Parent = component({
    render: () => <div>{false}</div>
  });

  let el = render(Parent, document.body);
  t.deepEqual(el.nodeName.toUpperCase(), "DIV");
  t.deepEqual(el.innerHTML, "<!---->");
});

test("Hydration works as expected.", t => {
  document.body.innerHTML = "<div>This is a triumph.</div>";

  let App = component({
    render: () => <div>This is a triumph.</div>
  });

  let el = hydrate(App, document.body);
  t.deepEqual(el.textContent, "This is a triumph.");
  t.deepEqual(document.body.innerHTML, "<div>This is a triumph.</div>");
});

test("Hydration mount hook is called.", t => {
  let mounted = false;
  document.body.innerHTML = "<div>This is a triumph.</div>";

  let App = component({
    mounted: () => (mounted = true),
    render: () => <div>This is a triumph.</div>
  });

  let el = hydrate(App, document.body);
  t.deepEqual(el.textContent, "This is a triumph.");
  t.deepEqual(document.body.innerHTML, "<div>This is a triumph.</div>");
  t.deepEqual(true, mounted);
});
