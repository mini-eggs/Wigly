import { customizer } from "./main";

if (typeof module !== "undefined") {
  module["exports"] = customizer;
} else {
  window["wiglyCustomizer"] = customizer;
  window["wiglyCustomizer"] = customizer;
}
