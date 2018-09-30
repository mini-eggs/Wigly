# Wigly

A silly-small, component-based UI library. Built to be lean.

[Live Example](https://codepen.io/minieggs40/project/editor/AwGdww)

<img src="https://raw.githubusercontent.com/mini-eggs/Wigly/master/assets/500x.png" 
     data-canonical-src="https://raw.githubusercontent.com/mini-eggs/Wigly/master/assets/500x.png" width="250" />

#### Why

I was rewriting a website of mine. Was aiming for zero dependencies and the least amount of JavaScript to send over the wire. This is what came out.

#### What

It's a view library! Like React/Preact, Vue, or HyperApp. It's my fav bits from React and Vue smashed into one while staying very lean with respect to kb size (the ES6 build is 1.43 kb gzipped and minified while the ES5 build is 2.07kb gzipped).

#### Examples

ES5 'Hello, World!'

```html
<body></body>
<script src="//unpkg.com/wigly"></script>
<script>
    var App = wigly.component({
        render: function() {
            return { children: "This is a triumph." };
        }
    });

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

TypeScript 'Hello, World!'

```typescript
import { h, component, render, IComponent } from "wigly";

var Child: IComponent<{ greeting: string }, { name: string }> = component({
  data() {
    return { name: "Evan" };
  },

  render() {
    return (
      <div>
        {this.props.greeting}, {this.state.name}!
      </div>
    );
  }
});

var Parent: IComponent<{}, {}> = component({
  data() {
    return {};
  },

  render() {
    return <Child greeting="Hi" />;
  }
});

var el = render(Parent, document.body);
t.deepEqual(el.textContent, "Hi, Evan!");
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
          {this.props.children}: {this.state.name || "____"}
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

#### Lifecycles.

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

#### Advanced patterns

There's a few common ways you can build abstractions with Wigly. Higher order components, render props, and mixins are all available. Here are examples of each:

#### Higher order components

```javascript
import { h, component, render } from "wigly";

var withName = Component =>
  component({
    data() {
      return { name: "Evan" };
    },

    render() {
      return <Component {...this.state} {...this.props} />;
    }
  });

var Example = component({
  render() {
    return <div>My name is {this.props.name}</div>;
  }
});

var ExampleWithName = withName(Example);

render(ExampleWithName, document.body);
```

#### Render props

```javascript
import { h, component, render } from "wigly";

var Name = component({
  data() {
    return { name: "Evan" };
  },

  render() {
    var f = this.props.children[0];
    return f(this.state);
  }
});

var Example = component({
  render() {
    return <Name>{({ name }) => <div>My name is {name}</div>}</Name>;
  }
});

render(Example, document.body);
```

#### Mixins

```javascript
import { h, render } from "wigly";

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
```
