import test from "ava";
import { h, render } from "../dist/es6";

let React = { createElement: h }; // because jsx reasons

require("browser-env")();

test("'Hello, World!' - part one", async t => {
  let HelloWorld = {
    render: () => ({ children: "Hello, World!" })
  };

  let el = render(HelloWorld, document.body);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("Ensure prop updates happen everywhere", async t => {
  let childCtx;
  let parentCtx;

  let Child = {
    tester() {
      return this.props.title;
    },
    render() {
      childCtx = this;
      return { children: [{ children: this.props.title }] };
    }
  };

  let Parent = {
    data() {
      return { title: "Hello, World!" };
    },
    render() {
      parentCtx = this;
      return { children: [{ tag: Child, title: this.state.title }] };
    }
  };

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Hello, World!");

  parentCtx.setState(() => ({ title: "Hello, Twitter!" }));
  t.deepEqual(el.textContent, "Hello, Twitter!");
  t.deepEqual(childCtx.tester(), "Hello, Twitter!");
});

test("Nully render", async t => {
  let Child = {
    render() {
      return null;
    }
  };

  let Parent = {
    render() {
      return { children: [{ tag: Child }] };
    }
  };

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "");

  Parent = {
    render() {
      return { children: [null] };
    }
  };

  el = render(Parent, document.body);
  t.deepEqual(el.textContent, "");
});

test("Falsies render", async t => {
  let Child = {
    render() {
      return false;
    }
  };

  let Parent = {
    render() {
      return { children: [{ tag: Child }] };
    }
  };

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "");

  Parent = {
    render() {
      return { children: [false] };
    }
  };

  el = render(Parent, document.body);
  t.deepEqual(el.textContent, "");
});

test("Passing children works through intermediate components.", async t => {
  let Child = {
    render() {
      return { children: this.children };
    }
  };

  let Parent = {
    render() {
      return { tag: Child, children: ["here", "we", "go"] };
    }
  };

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, ["here", "we", "go"].join(""));
});

test("Passing children works through intermediate components with jsx.", async t => {
  let Child = {
    render() {
      return <div>{this.children}</div>;
    }
  };

  let Parent = {
    render() {
      return <Child>Here we go</Child>;
    }
  };

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Here we go");
});

test("Lifecyles work as expected", async t => {
  let mountCount = 0;

  let Child = {
    mounted() {
      mountCount++;
    },
    render() {
      return <div>testing</div>;
    }
  };

  let Parent = {
    mounted() {
      mountCount++;
    },
    render() {
      return <Child />;
    }
  };

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "testing");
  t.deepEqual(mountCount, 2);
});

test("Child components don't keep stale state.", async t => {
  let parentCtx;
  let childCtx;

  let Child = {
    data() {
      return { name: "World" };
    },

    render() {
      childCtx = this;
      return <div>Hello, {this.state.name}!</div>;
    }
  };

  let Parent = {
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
  };

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

  let Child = {
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
  };

  let Parent = {
    render() {
      return <Child greeting="Hello">World!</Child>;
    }
  };

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "Hello, World!");
  t.deepEqual(data, { props: { greeting: "Hello" }, children: ["World!"] });
});

test("Ensure mounted setState updates state", async t => {
  let test;

  let Child = {
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
  };

  let Parent = {
    data() {
      return { active: true };
    },

    mounted() {
      this.setState(() => ({ active: false }));
    },

    render() {
      return <div>{this.state.active && <Child />}</div>;
    }
  };

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "");
  t.deepEqual(test, "Hello, Twitter!");
});

test("Mapping props item stays consistent in DOM.", async t => {
  let parentCtx;

  let Child = {
    render() {
      return (
        <div>
          {this.props.items.map(({ title }) => (
            <div>{title}</div>
          ))}
        </div>
      );
    }
  };

  let Parent = {
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
  };

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, ["here", "we", "go"].join(""));

  parentCtx.setState(() => ({ active: false }));
  t.deepEqual(el.textContent, "");
});

test("Children with conditional renders are removed from DOM properly.", t => {
  let childOneCtx;
  let childTwoCtx;
  let parentCtx;

  let DeepChild = {
    render() {
      return <div>here we go</div>;
    }
  };

  let ChildOne = {
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
  };

  let ChildTwo = {
    render() {
      childTwoCtx = this;
      return <div>Child Two</div>;
    }
  };

  let Parent = {
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
  };

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
    let Child = {
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
    };

    let Parent = {
      data() {
        return { count: 0 };
      },

      render() {
        parentCtx = this;
        return <Child count={this.state.count} />;
      }
    };

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

  let One = {
    render: () => ({ children: "test 1" })
  };

  let Two = {
    render: () => ({ children: "test 2" })
  };

  let Parent = {
    data: () => ({ component: One }),
    render() {
      ctx = this;
      return <this.state.component />;
    }
  };

  let el = render(Parent, document.body);
  t.deepEqual(el.textContent, "test 1");

  ctx.setState(() => ({ component: Two }));
  t.deepEqual(el.textContent, "test 2");
});

test("Falsy values are renderd as comments.", t => {
  let Parent = {
    render: () => <div>{false}</div>
  };

  let el = render(Parent, document.body);
  t.deepEqual(el.nodeName.toUpperCase(), "DIV");
  t.deepEqual(el.innerHTML, "<!---->");
});

// test("Hydration works as expected.", t => {
//   document.body.innerHTML = "<div>This is a triumph.</div>";

//   let App = ({
//     render: () => <div>This is a triumph.</div>
//   });

//   let el = hydrate(App, document.body);
//   t.deepEqual(el.textContent, "This is a triumph.");
//   t.deepEqual(document.body.innerHTML, "<div>This is a triumph.</div>");
// });

// test("Hydration mount hook is called.", t => {
//   let mounted = false;
//   document.body.innerHTML = "<div>This is a triumph.</div>";

//   let App = ({
//     mounted: () => (mounted = true),
//     render: () => <div>This is a triumph.</div>
//   });

//   let el = hydrate(App, document.body);
//   t.deepEqual(el.textContent, "This is a triumph.");
//   t.deepEqual(document.body.innerHTML, "<div>This is a triumph.</div>");
//   t.deepEqual(true, mounted);
// });

test("Updates work as expected with parent setState.", t => {
  let ctx;

  let Child = {
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
  };

  let Parent = {
    data() {
      return { val: 0 };
    },

    handleUpdate(val) {
      this.setState(() => ({ val }));
    },

    render() {
      return <Child oninput={this.handleUpdate} />;
    }
  };

  let el = render(Parent, document.body);
  t.deepEqual(el.querySelectorAll(".active").length, 0);

  ctx.setState(({ items }) => ({ items: items.map(({ title }) => ({ title, active: true })) }), ctx.afterUpdate);
  t.deepEqual(el.querySelectorAll(".active").length, 5);

  ctx.setState(({ items }) => ({ items: items.map(({ title }) => ({ title, active: false })) }), ctx.afterUpdate);
  t.deepEqual(el.querySelectorAll(".active").length, 0);
});

test("Both types of setStates work.", t => {
  let ctx;

  let app = {
    data: () => ({ name: "Evan" }),
    render() {
      ctx = this;
      return <div>Hello, my name is {this.state.name}.</div>;
    }
  };

  let el = render(app, document.body);
  t.deepEqual(el.textContent, "Hello, my name is Evan.");

  ctx.setState({ name: "Joba" });
  t.deepEqual(el.textContent, "Hello, my name is Joba.");

  ctx.setState(() => ({ name: "Madison" }));
  t.deepEqual(el.textContent, "Hello, my name is Madison.");
});

test("Hello, Twitter!", t => {
  var Child = {
    render() {
      return <div>This is a {this.props.title} =-D</div>;
    }
  };

  var App = {
    data() {
      return { title: "triumph" };
    },

    render() {
      return <Child {...this.state} />;
    }
  };

  var el = render(App, document.body);
  t.deepEqual(el.textContent, "This is a triumph =-D");
});

/**
 * README advanced examples.
 */

test("Example: higher order components", t => {
  var withName = Component => ({
    data() {
      return { name: "Evan" };
    },

    render() {
      return <Component {...this.state} />;
    }
  });

  var Example = {
    render() {
      return <div>My name is {this.props.name}</div>;
    }
  };

  var ExampleWithName = withName(Example);

  var el = render(ExampleWithName, document.body);
  t.deepEqual(el.textContent, "My name is Evan");
});

test("Example: render props", t => {
  var Name = {
    data() {
      return { name: "Evan" };
    },

    render() {
      // we only care about the first child for this example
      var f = this.children[0];
      return f(this.state);
    }
  };

  var Example = {
    render() {
      return <Name>{({ name }) => <div>My name is {name}</div>}</Name>;
    }
  };

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

  var Form = {
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
  };

  render(Form, document.body);
  t.deepEqual(ctx.state, { fname: "", lname: "" });

  var el = document.querySelector("input[name='fname']");
  el.value = "Evan";
  el.dispatchEvent(new Event("input"));
  t.deepEqual(ctx.state, { fname: "Evan", lname: "" });
});

test("Deep children behave properly.", t => {
  var One = {
    render() {
      return <button onclick={this.props.onclick} />;
    }
  };

  var Two = {
    render() {
      return <div>{this.children}</div>;
    }
  };

  var Three = {
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
  };

  var el = render(Three, document.body);
  t.deepEqual(el.textContent, "Click Count: 0");

  el.querySelector("button").click();
  t.deepEqual(el.textContent, "Click Count: 1");
});

test("Deep and nested children will update correctly.", async t => {
  var ctx;

  var Destination = {
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
          <h2>{this.children}</h2>
        </div>
      );
    }
  };

  var Intermediate = {
    render() {
      return (
        <main>
          <div>{this.children}</div>
        </main>
      );
    }
  };

  var App = {
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
  };

  var el = render(App, document.body);
  t.deepEqual(el.textContent, "");

  ctx.setState({ title: "working" });
  t.deepEqual(el.textContent, "workingmsg");
});
