import test from "ava";
import { component, render } from "../";

require("browser-env")();

// Hello World

test("'Hello, World!' - part one", async t => {
  let HelloWorld = component({
    render() {
      return {children: "Hello, World!"}
    }
  })
  
  let el = render(HelloWorld, document.body)
  t.deepEqual(el.textContent, "Hello, World!")
})