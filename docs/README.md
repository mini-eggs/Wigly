# What is Wigly?

Wigly is a React inspired, component-based UI library for the web. It's lean and small. A functional subset of the React API.

# What does it look like?

```javascript
import { render } from "wigly";

function App() {
  return <div>Pretty similar to React I would say!</div>;
}

render(<App />, document.body);
```

# Why use Wigly?

One might use Wigly if they enjoy the "hooks" style of frontend development the latest versions of React has offered us and wants their application to be _small_ (with respect to total kilobytes sent over the wire). Wigly's ES6 build is 2.46 kilobytes at the time of the writing (while the ES5 build is sub 5 kilobytes).

# How do I use Wigly?

Wigly assumes some knowledge of the current JavaScript ecosystem. My recommend way to use Wigly is with the [Parcel](https://parceljs.org/) web application bundler. You can see how to setup a Wigly application [here](SETUP.md). If you've used React, Webpack, or Create React App in the past you should feel right at home.
