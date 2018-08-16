import { component, render } from "./wigly.js";

let w = typeof module !== "undefined" ? module["exports"] : (window["wigly"] = {});

w["component"] = component;
w["render"] = render;
