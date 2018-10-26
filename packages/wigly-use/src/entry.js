import { use } from "./main";

if (typeof module !== "undefined") {
  module["exports"] = use;
} else {
  window["wiglyUse"] = use;
  window["wiglyUse"] = use;
}
