import * as wigly from "./wigly/wigly";

if (typeof module !== "undefined") {
  module["exports"] = wigly;
} else {
  window["wigly"] = wigly;
}
