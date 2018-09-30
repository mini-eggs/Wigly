import test from "ava";
import { h, component, render } from "../";

var React = { createElement: h }; // for jsx

require("browser-env")();

test("'Hello, World!' - part one", async t => {
  var HelloWorld = component({
    render: () => ({ children: "Hello, World!" })
  });

  var el = render(HelloWorld, document.body);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("Ensure prop updates happen everywhere", async t => {
  var childCtx;
  var parentCtx;

  var Child = component({
    tester() {
      return this.props.title;
    },

    render() {
      childCtx = this;
      return { children: [{ children: this.props.title }] };
    }
  });

  var Parent = component({
    data() {
      return { title: "Hello, World!" };
    },

    render() {
      parentCtx = this;
      return { children: [Child({ title: this.state.title })] };
    }
  });

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Hello, World!");

  parentCtx.setState(() => ({ title: "Hello, Twitter!" }));
  t.deepEqual(el.textContent, "Hello, Twitter!");
  t.deepEqual(childCtx.tester(), "Hello, Twitter!");
});

test("Nully render", async t => {
  var Child = component({
    render() {
      return null;
    }
  });

  var Parent = component({
    render() {
      return { children: [Child()] };
    }
  });

  var el = render(Parent, document.body);
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
  var Child = component({
    render() {
      return false;
    }
  });

  var Parent = component({
    render() {
      return { children: [Child()] };
    }
  });

  var el = render(Parent, document.body);
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
  var Child = component({
    render() {
      return { children: this.props.children };
    }
  });

  var Parent = component({
    render() {
      return Child({ children: ["here", "we", "go"] });
    }
  });

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, ["here", "we", "go"].join(""));
});

test("Passing children works through intermediate components with jsx.", async t => {
  var Child = component({
    render() {
      return <div>{this.props.children}</div>;
    }
  });

  var Parent = component({
    render() {
      return <Child>Here we go</Child>;
    }
  });

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Here we go");
});

test("Lifecyles work as expected", async t => {
  var mountCount = 0;

  var Child = component({
    mounted() {
      mountCount++;
    },

    render() {
      return <div>testing</div>;
    }
  });

  var Parent = component({
    mounted() {
      mountCount++;
    },

    render() {
      return <Child />;
    }
  });

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, "testing");
  t.deepEqual(mountCount, 2);
});

test("Child components don't keep stale state.", async t => {
  var parentCtx;
  var childCtx;

  var Child = component({
    data() {
      return { name: "World" };
    },

    render() {
      childCtx = this;
      return <div>Hello, {this.state.name}!</div>;
    }
  });

  var Parent = component({
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

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Hello, World!");

  childCtx.setState(() => ({ name: "Twitter" }));
  t.deepEqual(el.textContent, "Hello, Twitter!");

  parentCtx.setState(() => ({ active: false }));
  t.deepEqual(el.textContent, "Testing");

  parentCtx.setState(() => ({ active: true }));
  t.deepEqual(el.textContent, "Hello, World!");
});

test("Data hook has props and children set correctly.", async t => {
  var data;

  var Child = component({
    data() {
      data = this;
    },
    render() {
      return (
        <div>
          {this.props.greeting}, {this.props.children}
        </div>
      );
    }
  });

  var Parent = component({
    render() {
      return <Child greeting="Hello">World!</Child>;
    }
  });

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Hello, World!");
  t.deepEqual(data, { props: { greeting: "Hello", children: ["World!"] } });
});

test("Ensure mounted setState updates state", async t => {
  var test;

  var Child = component({
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

  var Parent = component({
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

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, "");
  t.deepEqual(test, "Hello, Twitter!");
});

test("Mapping props item stays consistent in DOM.", async t => {
  var parentCtx;

  var Child = component({
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

  var Parent = component({
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

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, ["here", "we", "go"].join(""));

  parentCtx.setState(() => ({ active: false }));
  t.deepEqual(el.textContent, "");
});

test("Children with conditional renders are removed from DOM properly.", t => {
  var childOneCtx;
  var childTwoCtx;
  var parentCtx;

  var DeepChild = component({
    render() {
      return <div>here we go</div>;
    }
  });

  var ChildOne = component({
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

  var ChildTwo = component({
    render() {
      childTwoCtx = this;
      return <div>Child Two</div>;
    }
  });

  var Parent = component({
    data() {
      return { component: ChildOne, name: "ChildOne" };
    },

    render() {
      var Curr = this.state.component;
      parentCtx = this;
      return (
        <div>
          <Curr />
        </div>
      );
    }
  });

  var el = render(Parent, document.body);
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
  var parentCtx;
  var childCtx;
  var root;

  var promise = new Promise(resolve => {
    var Child = component({
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

    var Parent = component({
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

  var { el, ctx } = await promise;
  t.deepEqual(el.textContent, "1 - 1");
  t.deepEqual(ctx.props, { count: 1, children: [] });
  t.deepEqual(ctx.state, { count: 1 });
});

test("Swapping children works as expected.", t => {
  var ctx;

  var One = component({
    render: () => ({ children: "test 1" })
  });

  var Two = component({
    render: () => ({ children: "test 2" })
  });

  var Parent = component({
    data: () => ({ component: One }),
    render() {
      ctx = this;
      return <this.state.component />;
    }
  });

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, "test 1");

  ctx.setState(() => ({ component: Two }));
  t.deepEqual(el.textContent, "test 2");
});

test("Falsy values are rendered as comments.", t => {
  var Parent = component({
    render: () => <div>{false}</div>
  });

  var el = render(Parent, document.body);
  t.deepEqual(el.nodeName.toUpperCase(), "DIV");
  t.deepEqual(el.innerHTML, "<!---->");
});

test("Updates work as expected with parent setState.", t => {
  var ctx;

  var Child = component({
    data() {
      return {
        items: [
          { title: "test 1", active: false },
          { title: "test 2", active: false },
          { title: "test 3", active: false },
          { title: "test 4", active: false },
          { title: "test 5", active: false }
        ]
      };
    },

    afterUpdate() {
      this.props.oninput(this.state.items.filter(({ active }) => active).length);
    },

    render() {
      ctx = this;
      return (
        <div>
          {this.state.items.map((item, i) => (
            <div class={item.active ? "active" : ""}>{item.title}</div>
          ))}
        </div>
      );
    }
  });

  var Parent = component({
    data() {
      return { val: 0 };
    },

    handleUpdate(val) {
      this.setState(() => ({ val }));
    },

    render() {
      return <Child oninput={this.handleUpdate} />;
    }
  });

  var el = render(Parent, document.body);
  t.deepEqual(el.querySelectorAll(".active").length, 0);

  ctx.setState(({ items }) => ({ items: items.map(({ title }) => ({ title, active: true })) }), ctx.afterUpdate);
  t.deepEqual(el.querySelectorAll(".active").length, 5);

  ctx.setState(({ items }) => ({ items: items.map(({ title }) => ({ title, active: false })) }), ctx.afterUpdate);
  t.deepEqual(el.querySelectorAll(".active").length, 0);
});

test("Both types of setStates work.", t => {
  var ctx;

  var app = component({
    data: () => ({ name: "Evan" }),
    render() {
      ctx = this;
      return <div>Hello, my name is {this.state.name}.</div>;
    }
  });

  var el = render(app, document.body);
  t.deepEqual(el.textContent, "Hello, my name is Evan.");

  ctx.setState({ name: "Joba" });
  t.deepEqual(el.textContent, "Hello, my name is Joba.");

  ctx.setState(() => ({ name: "Madison" }));
  t.deepEqual(el.textContent, "Hello, my name is Madison.");
});

test("Hello, Twitter!", t => {
  var Child = component({
    render() {
      return <div>This is a {this.props.title} =-D</div>;
    }
  });

  var App = component({
    data() {
      return { title: "triumph" };
    },

    render() {
      return <Child {...this.state} />;
    }
  });

  var el = render(App, document.body);
  t.deepEqual(el.textContent, "This is a triumph =-D");
});

/**
 * README advanced examples.
 */

test("Example: higher order components", t => {
  var withName = Component =>
    component({
      data() {
        return { name: "Evan" };
      },

      render() {
        return <Component {...this.state} />;
      }
    });

  var Example = component({
    render() {
      return <div>My name is {this.props.name}</div>;
    }
  });

  var ExampleWithName = withName(Example);

  var el = render(ExampleWithName, document.body);
  t.deepEqual(el.textContent, "My name is Evan");
});

test("Example: render props", t => {
  var Name = component({
    data() {
      return { name: "Evan" };
    },

    render() {
      // we only care about the first child for this example
      var f = this.props.children[0];
      return f(this.state);
    }
  });

  var Example = component({
    render() {
      return <Name>{({ name }) => <div>My name is {name}</div>}</Name>;
    }
  });

  var el = render(Example, document.body);
  t.deepEqual(el.textContent, "My name is Evan");
});

test("Example: mixin", t => {
  var ctx;

  var FormMixin = {
    update(key) {
      return event => this.setState({ [key]: event.target.value });
    },

    stop(f) {
      return event => {
        event.stopPropagation();
        event.preventDefault();
        f(event);
        return false;
      };
    }
  };

  var Form = component({
    ...FormMixin,

    data() {
      return { fname: "", lname: "" };
    },

    handleSubmit(event) {
      alert("Do the thing!");
    },

    render() {
      ctx = this;
      return (
        <form onsubmit={this.stop(this.handleSubmit)}>
          <input type="text" oninput={this.update("fname")} name="fname" placeholder="First Name" />
          <input type="text" oninput={this.update("lname")} name="lname" placeholder="Last Name" />
          <input type="submit" value="Submit" />
        </form>
      );
    }
  });

  render(Form, document.body);
  t.deepEqual(ctx.state, { fname: "", lname: "" });

  var el = document.querySelector("input[name='fname']");
  el.value = "Evan";
  el.dispatchEvent(new Event("input"));
  t.deepEqual(ctx.state, { fname: "Evan", lname: "" });
});

test("Deep children behave properly.", t => {
  var One = component({
    render() {
      return <button onclick={this.props.onclick} />;
    }
  });

  var Two = component({
    render() {
      return <div>{this.props.children}</div>;
    }
  });

  var Three = component({
    data() {
      return { click: 0 };
    },

    handleClick() {
      this.setState(({ click }) => ({ click: click + 1 }));
    },

    render() {
      return (
        <div>
          <div>Click Count: {this.state.click}</div>
          <Two>
            <One onclick={this.handleClick} />
          </Two>
        </div>
      );
    }
  });

  var el = render(Three, document.body);
  t.deepEqual(el.textContent, "Click Count: 0");

  el.querySelector("button").click();
  t.deepEqual(el.textContent, "Click Count: 1");
});

test("Deep and nested children will update correctly.", async t => {
  var ctx;

  var Destination = component({
    data() {
      return { active: false, title: this.props.title };
    },

    updated() {
      if (this.props.title !== this.state.title) {
        this.setState({ title: this.props.title, active: true });
      }
    },

    render() {
      if (!this.state.active) return;
      return (
        <div>
          <h1>{this.state.title}</h1>
          <h2>{this.props.children}</h2>
        </div>
      );
    }
  });

  var Intermediate = component({
    render() {
      return (
        <main>
          <div>{this.props.children}</div>
        </main>
      );
    }
  });

  var App = component({
    data() {
      return { title: "title", msg: "msg" };
    },

    render() {
      ctx = this;
      return (
        <div>
          <Intermediate>
            <Destination title={this.state.title}>{this.state.msg}</Destination>
          </Intermediate>
        </div>
      );
    }
  });

  var el = render(App, document.body);
  t.deepEqual(el.textContent, "");

  ctx.setState({ title: "working" });
  t.deepEqual(el.textContent, "workingmsg");
});

test("Breaking change for enabling typed (ts) components.", t => {
  var Child = component({
    render() {
      return (
        <div>
          {this.props.hi}, {this.props.children}!
        </div>
      );
    }
  });

  var Parent = component({
    render() {
      // or without jsx: return Child({ hi:"Hi", children: "Evan" })
      return <Child hi="Hi">Evan</Child>;
    }
  });

  var el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Hi, Evan!");
});
