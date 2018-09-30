import { dom, elements } from "./main";

if (typeof module !== "undefined") {
  module["exports"]["dom"] = dom;
  module["exports"]["elements"] = elements;
} else {
  window["wiglyDOM"] = dom;
  window["wiglyDOM"]["elements"] = elements;
}
