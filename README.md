# Wigly

A humble library for creating your website or application views.

#### Why

I was rewriting a website of mine. Was aiming for zero dependencies and the least amount of JavaScript to send over the wire. This is what came out.

#### What

It's a view library! Like React/Preact, Vue, or HyperApp. It's my fav bits from React and Vue smashed into one while staying very lean with respect to kb size (the ES6 build is 1.2kb gzipped).

#### Live example

[Live codepen example.](https://codepen.io/minieggs40/project/editor/ZONPpa)

#### How

Using ECMAScript 5:

```html
<script src="https://unpkg.com/wigly@0.0.19/dist/es5.js"></script>
<script>
    var component = function () {
        return { children: "Hello, World!" }
    }

    window.onload = function (event) {
        wigly.render(component, event.target.body)
    }
</script>
```

Using modern JavaScript:

```javascript
import { render } from "wigly";

let app = () => ({ children: "Hello, World!" });

window.onload = event => render(app, event.target.body);
```

Using components:

```javascript
import { component, render } from "wigly";

let MyCoolTitle = component({
  render() {
    return { tag: "h1", children: this.props.title };
  }
});

let MyCoolInput = component({
  render() {
    return {
      tag: "input",
      oninput: event => this.props.updateName(event.target.value),
      autofocus: true,
      style: { marginBottom: "15px" }
    };
  }
});

let app = component({
  data() {
    // setting initial state.
    return { title: "Please enter your name.", name: "" };
  },

  updateName(name) {
    // updating component state
    this.setState(() => ({ name }), this.afterNameUpdate);
  },

  afterNameUpdate() {
    // at this point the name update
    // has been put into dom.
    console.log(`Current name is ${this.state.name}`);
  },

  render() {
    return {
      children: [
        { tag: MyCoolTitle, title: this.state.title },
        { tag: MyCoolInput, updateName: this.updateName },
        this.state.name && { children: `Your name is ${this.state.name}.` } // conditionally render this
      ]
    };
  }
});

function main() {
  render(app, document.body);
}

window.onload = main;
```

Using lifecycles:

```javascript
import { component, render } from "wigly";

let LifecycleExample = component({
  mounted() {
    // called once in dom
  },

  updated() {
    // called when parent changes props
  },

  destroyed() {
    // called once out of dom
  },

  render() {
    return { children: "Hello, World!" };
  }
});

let app = component({
  render() {
    return { tag: LifecycleExample };
  }
});

function main() {
  render(app, document.body);
}

window.onload = main;
```
