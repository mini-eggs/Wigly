import "@babel/polyfill";
import { render, h, state, effect } from "../src/main";

let React = { createElement: h }; // for jsx

let Child = () => {
  return <div>Child Here</div>;
};

let App = () => {
  let [show, set] = state(true);
  return (
    <div>
      {show && <Child />}
      <button onclick={() => set(!show)}>click me</button>
    </div>
  );
};

render(<App />, document.body);
