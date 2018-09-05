import { h, component, render, hydrate } from "./main";

let w = typeof module !== "undefined" ? module["exports"] : (window["wigly"] = {});

w["h"] = h;
w["component"] = component;
w["render"] = render;
w["hydrate"] = hydrate;
