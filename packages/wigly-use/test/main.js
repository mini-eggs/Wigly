import test from "ava";
import wigly from "wigly";
import h from "wigly-jsx";
import customizer from "wigly-customizer";
import use from "../";

var React = { createElement: h };

require("browser-env")();

test("Hello World!", t => {
  function app({ useState }) {
    var [msg] = useState("Hello, World!");
    return <div>{msg}</div>;
  }

  var custom = customizer(use, { applyToChildren: true });
  var el = wigly.render(custom(app), document.body);

  t.deepEqual(el.textContent, "Hello, World!");
});

test("useMount.", t => {
  var mounted = false;

  function app({ useMount }) {
    useMount(() => (mounted = true));
    return <div>Hi!</div>;
  }

  var custom = customizer(use, { applyToChildren: true });
  var el = wigly.render(custom(app), document.body);

  t.deepEqual(mounted, true);
});
