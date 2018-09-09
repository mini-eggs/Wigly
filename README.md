# Wigly

A silly-small, component-based UI library. Built to be lean.

<img src="https://raw.githubusercontent.com/mini-eggs/Wigly/master/assets/wigly_final.png" 
     data-canonical-src="https://raw.githubusercontent.com/mini-eggs/Wigly/master/assets/wigly_final.png" width="250" />

#### Why

I was rewriting a website of mine. Was aiming for zero dependencies and the least amount of JavaScript to send over the wire. This is what came out.

#### What

It's a view library! Like React/Preact, Vue, or HyperApp. It's my fav bits from React and Vue smashed into one while staying very lean with respect to kb size (the ES6 build is 1.4 kb gzipped and minified).

#### Examples

ES5 'Hello, World!'

```html
<body></body>
<script src="//unpkg.com/wigly@latest"></script>
<script>
    var App = wigly.component({
        render() {
            return { children: "This is a triumph." };
        }
    })

    wigly.render(App, document.body);
</script>
```

JSX 'Hello, World!'

```javascript
import { h, component, render } from "wigly";

let App = component({
  render() {
    return <div>This is a triumph.</div>;
  }
});

render(App, document.body);
```

State, props, children, and events.

```javascript
import { h, component, render } from "wigly";

let InputContainer = component({
  data() {
    return { name: "" }; // initial state
  },

  handleInput(event) {
    this.setState(() => ({ name: event.target.value }));
  },

  render() {
    return (
      <div>
        <h1>{this.props.title}</h1>
        <h2>
          {this.children}: {this.state.name || "____"}
        </h2>
        <input oninput={this.handleInput} />
      </div>
    );
  }
});

let App = component({
  render() {
    return <InputContainer title="Please enter your name below.">Your name is</InputContainer>;
  }
});

render(App, document.body);
```

Lifecycles.

```javascript
import { h, component, render } from "wigly";

let App = component({
  mounted(el) {
    // called after component has entered DOM.
  },

  updated(el) {
    // called after component has updated. I.e. after this.setState
    // has been called or after props/children change.
  },

  destroyed(el) {
    // called after component has left DOM.
  },

  render() {
    return <div>This is a triumph.</div>;
  }
});

render(App, document.body);
```
