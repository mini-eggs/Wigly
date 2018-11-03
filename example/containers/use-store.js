import Wigly, { useState, useEffect } from "../../src/main.ts";
import store from "../store";

let useStore = (filter = values => values) => {
  let [val, set] = useState(filter(store.getState()));

  useEffect(() => {
    let destroy = store.subscribe(() => set(filter(store.getState())));
    return () => destroy();
  }, 0);

  return [val, store.dispatch];
};

export default useStore;
