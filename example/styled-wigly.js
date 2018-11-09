import { h } from "../";
import tags from "dom-tags";
import stringcss from "string-css/dist/string-css.module.js";

export default tags.reduce(
  (fns, key) => ({
    ...fns,
    [key]: style => props => h(key, { ...props, class: stringcss.css(style) })
  }),
  {}
);

export let inject = stringcss.inject;
