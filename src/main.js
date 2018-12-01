import * as wigly from "./wigly/wigly";

if (typeof module !== "undefined") {
  module["exports"] = wigly;
} else {
  window["wigly"] = wigly;
}

// export default wigly;
// export let state = wigly.state;
// export let effect = wigly.effect;
