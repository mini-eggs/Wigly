// @jsx h
import { h, render } from "../src/main.ts";
import Router from "./router";

let App = () => (
  <div>
    <Router />
  </div>
);

render(<App />, document.body);
