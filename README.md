[![gzip size](http://img.badgesize.io/https://unpkg.com/wigly/dist/wigly.es6.js.gz)](https://unpkg.com/wigly/dist/wigly.es6.js.gz)

# Wigly

A React inspired, component-based UI library for the web. Built with [Superfine](https://github.com/jorgebucaran/superfine/). Built to be lean.

## Live example

[https://codepen.io/minieggs40/project/editor/AEyxBx](https://codepen.io/minieggs40/project/editor/AEyxBx)

## 'Hello, World!' example

```javascript
import wigly from "wigly";

function App(props) {
  return <div>{props.greeting}, World!</div>;
}

wigly.render(<App greeting="Hello" />, document.body);
```

## Stateful counter example

```javascript
import wigly, { useState } from "wigly";

function Counter() {
  var [count, set] = wigly.useState(0);
  return (
    <div>
      <h1>Count: {count}</h1>
      <button onclick={set(count + 1)}>increment</button>
    </div>
  );
}

wigly.render(<Counter />, document.body);
```

## Using AJAX calls

```javascript
import wigly, { useState, useEffect } from "wigly";

function App(props) {
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

wigly.render(<App userId={123} />, document.body);
```

## Advanced, creating a 'styled-components' package

```javascript
import wigly, { useState, useEffect } from "wigly";
import tags from "dom-tags";
import stringcss from "string-css";

let styled = tags.reduce(
  (fns, key) => ({
    ...fns,
    [key]: style => props => {
      let [classes] = useState(stringcss.css(style));
      useEffect(stringcss.inject, 0);
      return wigly.h(key, { ...props, class: props.class ? `${classes} ${props.class}` : classes });
    }
  }),
  {}
);

let Title = styled.h1`
  color: #121212;
  font-family: nyt-cheltenham, georgia, "times new roman", times, serif;
  font-weight: 700;
  font-style: italic;
`;

wigly.render(<Title>Your Styled Component Here</Title>, document.body);
```
