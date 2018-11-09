import test from "ava";
import { h, render, useState, useEffect } from "../";

require("browser-env")();

test("'Hello, World'", t => {
  let App = () => {
    let [msg] = useState("Hello, World!");
    return <div>{msg}</div>;
  };

  let el = render(h(App), document.body);
  t.deepEqual(el.textContent, "Hello, World!");
});

test("Conditional components work as expected.", t => {
  let App = () => {
    let [active, set] = useState(true);
    return (
      <div>
        {active && <h1>hi</h1>}
        <button onclick={set(!active)} />
      </div>
    );
  };

  let el = render(<App />);
  t.deepEqual(el.textContent, "hi");
  el.querySelector("button").click();
  t.deepEqual(el.textContent, "");
});
