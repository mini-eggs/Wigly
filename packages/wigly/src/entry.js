import { h, component, render } from "./main";

let w = typeof module !== "undefined" ? module["exports"] : (window["wigly"] = {});

w["h"] = h;
w["render"] = render;
w["component"] = component;
