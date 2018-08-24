import { h, component, render } from "./wigly.js";

let w = typeof module !== "undefined" ? module["exports"] : (window["wigly"] = {});

w["h"] = h;
w["component"] = component;
w["render"] = render;
