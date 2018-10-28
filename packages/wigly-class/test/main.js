import test from "ava";
import wigly from "wigly";
import classer from "../";

let React = { createElement: wigly.h };

require("browser-env")();

test("Hello World!", t => {
  class Child {
    render() {
      return <div>Hello, World!</div>;
    }
  }

  class App {
    render() {
      return <Child />;
    }
  }

  var el = wigly.render(App, document.body, classer);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("Nested components work, duh.", t => {
  class One {
    render() {
      return <div>test</div>;
    }
  }

  class Two {
    render() {
      return <div>{this.props.children}</div>;
    }
  }

  class Three {
    render() {
      return (
        <Two>
          <One />
        </Two>
      );
    }
  }

  var el = wigly.render(Three, document.body, classer);
  t.deepEqual(el.textContent, "test");
});
