import { classer } from "./main";

if (typeof module !== "undefined") {
  module["exports"] = classer;
} else {
  window["wiglyClass"] = classer;
  window["wiglyClass"] = classer;
}
