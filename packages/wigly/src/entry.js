import { render } from "./main";

let w = typeof module !== "undefined" ? module["exports"] : (window["wigly"] = {});

w["render"] = render;
