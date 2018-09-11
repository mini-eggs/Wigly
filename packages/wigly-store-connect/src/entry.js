import createConnector from "./main";

let w = typeof module !== "undefined" ? module["exports"] : (window["wiglyStoreConnector"] = {});
w["createConnector"] = createConnector;
