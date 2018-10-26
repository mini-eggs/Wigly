import { h } from "./main";

if (typeof module !== "undefined") {
  module["exports"] = h;
  module["exports"]["h"] = h;
} else {
  window["wiglyJSX"] = h;
}
