# Wigly

A silly-small, component-based UI library. Built to be lean. Inspired by React.

## Minimal example:

```javascript
import { h, render } from "wigly";

function App(props) {
  return <div>Hello, {props.name}!</div>;
}

render(<App name="World" />, document.body);
```

## Stateful example:

```javascript
import { h, render, useState } from "wigly";

let App = () => {
  let [name, set] = useState();

  return (
    <div>
      <h1>Hello, {name || "..."}!</h1>
      <input oninput={event => set(event.target.value)} />
    </div>
  );
};

render(<App />, document.body);
```
