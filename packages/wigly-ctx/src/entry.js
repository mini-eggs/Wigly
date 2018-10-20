import { contextualize } from "./main";

if (typeof module !== "undefined") {
  module["exports"] = contextualize;
} else {
  window["wiglyCTX"] = contextualize;
  window["wiglyCTX"] = contextualize;
}
