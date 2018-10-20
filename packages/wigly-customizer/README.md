# Wigly, the hackable JavaScript library for building user interfaces.

This package is an add-on to Wigly that allows users to create their own UI library built on top of Wigly (with only a little bit of pain). This package empowers users to modifying any/every component in a given component tree while needing to be used only once.

If you've ever wanted to create your own UI library but haven't much cared to dig down into DOM or spend the time making components communicate to each other effectively you have come to the right place.

The core of Wigly is fairly simple. A component looks like so:

```javascript
var HelloWorldComponent = {
  render() {
    return { children: "Hello, World!" };
  }
};
```

This "Hello, World" component would render a div with the text content being, of course, "Hello, World!" You would render the component onto page like so:

```javascript
wigly.render(HelloWorldComponent, document.body);
```

Other components would consume like so:

```javascript
var App = {
  render() {
    return { tag: HelloWorldComponent };
  }
};
```

When this is rendered it would also result in a single div tag with the text content being "Hello, World!" Those are the essential basics but Wigly is a stateful UI library that communicates with other components. Every method on a wigly component (render, data, mounted, updated, destroyed, ...insertYourMethodsHere) will have a `this`. For core Wigly `this` is shaped like so:

```javascript
this = {
    state: { /* current component state */ },
    props: { /* props given to us by parent component */ },
    setState, /* method for updating state and rerendering component, exactly like React's setState */
    ...methods /* things like your custom onclick handlers and so on */
}
```

Initial state is set by the data method:

```javascript
var App = {
  data() {
    return { name: "Evan" };
  },

  render() {
    return { tag: "span", children: "My name is " + this.state.name + "!" };
  }
};
```

When the component above mounts a span tag will be rendered with the text content being "My name is Evan!"

Props (and children) are passed via:

```javascript
var Child = {
  render() {
    return { tag: "span", children: this.props.children " " + this.props.name + "!" };
  }
};

var Parent = {
    render() {
        return {tag: Child, name: "Evan", children: "My name is"};
    }
}
```

These components would result in the same span tag rendered with the text content still being "My name is Evan!"

Every component will also have lifecycles that are called. Wigly core has only three- mounted, updated, and destroyed. As you will see, this Wigly Customizer package will let you easily build more on top of Wigly.

When I first created Wigly I was on the fence if it should be stateful or "functional". As seen above I went with a stateful approach, but with this Wigly Customizer package it is at the application author's hands to turn this into a "functional" UI library. Here's how one might do so, effectively creating their _own_ UI library.

```javascript
import wigly from "wigly"
import customizer from "wigly-customizer"

/**
 * Your internal UI library code
 */

var makeComponentFunctional = sig =>
  Object.keys(sig).reduce(
    (total, key) => ({
      ...total,
      [key]() {
        return sig[key].apply(undefined, [].concat.apply([this], arguments));
      }
    }),
    {}
  );

var fp = customizer(makeComponentFunctional, { applyToChildren: true });

/**
 * Your new, functional UI library
 */

var HeaderText = {
    render: self => ({tag: "h1", children: "Hi, my name is " + self.props.name + "!"})
}

var App = {
  data: () => ({
    name: "Evan"
  }),

  render: self => ({
    tag: HeaderText
    name: self.state.name
  })
};

wigly.render(fp(App), document.body);
```

As you might expect, this will render a single h1 tag with the text content of "Hi, my name is Evan!"

Here's another example, this time creating a "context" sort of API.

```javascript
import wigly from "wigly";
import customizer from "wigly-customizer";

var contextualize = vars => sig => {
  var next = {};

  for (let key of Object.keys(sig)) {
    next[key] = function() {
      return sig[key].apply({ ...this, ...vars }, arguments);
    };
  }

  return next;
};

var context = customizer(contextualize({ name: "Evan" }), { applyToChildren: true });

var App = {
  render() {
    return { tag: "h1", children: this.name };
  }
};

wigly.render(context(App), document.body);
```

That's all I have in me for now. I hope you see how powerful this package is. I'll add some more docs in time. Take it easy. 
