import { component } from "./main";

if (typeof module !== "undefined") {
  module["exports"]["component"] = component;
} else {
  window["wiglyComponent"] = component;
}
