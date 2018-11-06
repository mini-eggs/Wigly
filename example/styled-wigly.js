import { h } from "../";

let stringcss = require("string-css").default;

export default new Proxy(
  {},
  { get: (_, name) => (...args) => props => h(name, { ...props, class: stringcss.css(...args) }) }
);

export let inject = stringcss.inject;
