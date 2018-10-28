import { h } from "./main";

if (typeof module !== "undefined") {
  module["exports"] = h;
} else {
  window["wiglyJSX"] = h;
}
