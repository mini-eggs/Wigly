import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import InputReducer from "./reducers/input";

let store = createStore(InputReducer, composeWithDevTools());

export default store;
