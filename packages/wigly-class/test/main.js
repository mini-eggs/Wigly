import test from "ava";
import wigly from "wigly";
import { classer, Component } from "../";

require("browser-env")();

test("Hello World!", t => {
  class Child extends Component {
    render() {
      return <div>Hello, World!</div>;
    }
  }

  class App extends Component {
    render() {
      return <Child />;
    }
  }

  var el = wigly.render(App, document.body, classer);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("Nested components work, duh.", t => {
  class One extends Component {
    render() {
      return <div>test</div>;
    }
  }

  class Two extends Component {
    render() {
      return <div>{this.props.children}</div>;
    }
  }

  class Three extends Component {
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

test("HOC.", t => {
  var WithName = name => Child => {
    return class extends Component {
      render() {
        return <Child name="Evan" />;
      }
    };
  };

  class App extends Component {
    render() {
      return <div>Hi, {this.props.name}!</div>;
    }
  }

  var el = wigly.render(WithName("Evan")(App), document.body, classer);
  t.deepEqual(el.textContent, "Hi, Evan!");
});
