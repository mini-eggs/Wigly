import wigly from "wigly";
import { createStore } from "wigly-store";
import { createConnector } from "wigly-store-connect";
import search from "./switches/search";
import navigation from "./switches/navigation";

let store = createStore({ search, navigation });
let connector = createConnector(wigly, store);

export default connector;
