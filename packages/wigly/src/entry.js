import { h, render } from "./main";

let w = typeof module !== "undefined" ? module["exports"] : (window["wigly"] = {});

w["h"] = h;
w["render"] = render;
