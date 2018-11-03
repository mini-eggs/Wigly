import useStore from "./use-store";
import debounce from "lodash/debounce";

let useInput = (type, initial, t = 250) => {
  let [_, dispatch] = useStore();
  let updater = debounce(payload => dispatch({ type, payload }), t);
  let wire = ({ target: { value } }) => updater(value);
  // return [{ defaultValue: initial, onInput: wire, onChange: wire }];
  return [{ value: initial, oninput: wire, onchange: wire }];
};

export default useInput;
