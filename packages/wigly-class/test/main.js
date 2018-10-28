import test from "ava";
import wigly from "wigly";
import h from "wigly-jsx";
import customizer from "wigly-customizer";
import classer from "../";

var React = { createElement: h };
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

  var custom = customizer(classer);
  var el = wigly.render(custom(App), document.body);
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

  var custom = customizer(classer);
  var el = wigly.render(custom(Three), document.body);
  t.deepEqual(el.textContent, "test");
});
