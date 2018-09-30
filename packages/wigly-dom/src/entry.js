import { dom, elements } from "./main";

if (typeof module !== "undefined") {
  module["exports"]["dom"] = dom;
} else {
  window["wiglyDom"] = dom;
  window["wiglyDom"]["elements"] = elements;
}
