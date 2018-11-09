[![gzip size](http://img.badgesize.io/https://unpkg.com/wigly/dist/wigly.es6.js.gz)](https://unpkg.com/wigly/dist/wigly.es6.js.gz)

# Wigly

A React inspired, component-based UI library for the web. Built with Superfine. Built to be lean.

## Live example

[https://codepen.io/minieggs40/project/editor/AEyxBx](https://codepen.io/minieggs40/project/editor/AEyxBx)

## 'Hello, World!' example

```javascript
import { h, render } from "wigly";

function App(props) {
  return <div>{props.greeting}, World!</div>;
}

render(<App greeting="Hello" />, document.body);
```

## Stateful counter example

```javascript
import { h, render, useState } from "wigly";

function Counter() {
  var [count, set] = useState(0);
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onclick={set(count + 1)}>increment</button>
    </div>
  );
}

render(<Counter />, document.body);
```

## Using AJAX calls

```javascript
import { h, render, useState, useEffect } from "wigly";

function Counter(props) {
  var [username, set] = useState();

  // Optional second parameter, will only call first parameter when userId value changes.
  // If no second paramter is given the first parameter will be called after every render.
  // Operates the exact same as React's useEffect.
  useEffect(
    async function() {
      var request = await fetch(`/get/user/${props.userId}`);
      var result = await request.json();
      set(result.username);
    },
    [props.userId]
  );

  return (
    <div>
      <div>{username ? `Username: ${username}` : "loading"}</div>
    </div>
  );
}

render(<Counter userId={123} />, document.body);
```
