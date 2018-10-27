import test from "ava";
import wigly from "wigly";
import h from "wigly-jsx";
import customizer from "wigly-customizer";
import use from "../";

var React = { createElement: h };

require("browser-env")();

function render(root) {
  var custom = customizer(use, { applyToChildren: true });
  return wigly.render(custom(root), document.body);
}

test("Hello World!", t => {
  function app({ useState }) {
    var [msg] = useState("Hello, World!");
    return <div>{msg}</div>;
  }

  t.deepEqual(render(app).textContent, "Hello, World!");
});

test("useMount.", t => {
  var mounted = false;

  function app({ useMount }) {
    useMount(() => (mounted = true));
    return <div>Hi!</div>;
  }

  render(app);

  t.deepEqual(mounted, true);
});

test("Click test.", t => {
  function Button({ useState }) {
    var [count, set] = useState(0);
    return <button onclick={() => set(count + 1)}>Click count: {count}</button>;
  }

  var el = render(Button);
  t.deepEqual(el.textContent, "Click count: 0");

  el.click();
  t.deepEqual(el.textContent, "Click count: 1");
});

test("Falsy values are correct.", t => {
  function Button({ useState }) {
    var [status, set] = useState(false);
    return <button onclick={() => set(!status)}>active: {status ? "yes" : "no"}</button>;
  }

  var el = render(Button);
  t.deepEqual(el.textContent, "active: no");

  el.click();
  t.deepEqual(el.textContent, "active: yes");

  el.click();
  t.deepEqual(el.textContent, "active: no");

  el.click();
  t.deepEqual(el.textContent, "active: yes");
});
