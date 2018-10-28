import test from "ava";
import { render } from "wigly";
import customizer from "../";

require("browser-env")();

var functional = sig =>
  Object.keys(sig).reduce(
    (total, key) => ({
      ...total,
      [key]() {
        return sig[key].apply(undefined, [].concat.apply([this], arguments));
      }
    }),
    {}
  );

test("Hello World!", t => {
  var Child = {
    data: () => ({ greeting: "Hi" }),
    render: self => ({ children: `${self.state.greeting}, my name is ${self.props.name}!` })
  };

  var App = {
    data: () => ({ name: "Evan" }),
    render: self => ({ tag: Child, name: self.state.name })
  };

  var fp = customizer(functional);
  var el = render(fp(App), document.body);
  t.deepEqual(el.textContent, "Hi, my name is Evan!");
});

var makeClass = someClass => ({
  data() {
    var instance = new someClass(this.props);
    return { _instance: instance, ...(instance.state || {}) };
  },

  _getContext() {
    for (var proto of Object.getOwnPropertyNames(someClass.prototype)) {
      if (typeof this.state._instance[proto] === "function") {
        this[proto] = this.state._instance[proto].bind(this);
      }
    }

    var special = { constructor: true, _instance: true, _getContext: true };
    return Object.keys(this).reduce((total, key) => (special[key] ? total : { ...total, [key]: this[key] }), {});
  },

  mounted() {
    return this.state._instance.mounted && this.state._instance.mounted.apply(this._getContext(), arguments);
  },

  updated() {
    return this.state._instance.updated && this.state._instance.updated.apply(this._getContext(), arguments);
  },

  destroyed() {
    return this.state._instance.destroyed && this.state._instance.destroyed.apply(this._getContext(), arguments);
  },

  render() {
    return this.state._instance.render && this.state._instance.render.apply(this._getContext(), arguments);
  }
});

test("Make class based", t => {
  class App {
    constructor() {
      this.state = { count: 0 };
    }

    handleBtnClick() {
      this.setState(({ count }) => ({ count: count + 1 }));
    }

    render() {
      return { tag: "button", children: `Count: ${this.state.count}`, onclick: this.handleBtnClick };
    }
  }

  var makeStateBased = customizer(makeClass);
  App = makeStateBased(App);

  var el = render(App, document.body);
  t.deepEqual(el.textContent, "Count: 0");

  el.click();
  t.deepEqual(el.textContent, "Count: 1");
});
