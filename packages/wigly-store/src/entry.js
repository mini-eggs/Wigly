import createStore from "./main";

let w = typeof module !== "undefined" ? module["exports"] : (window["wiglyStore"] = {});

w["createStore"] = createStore;
