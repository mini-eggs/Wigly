// @jsx h
import { h } from "../../src/main.ts";
import useStore from "../containers/use-store";
import useInput from "../containers/use-input";

let Home = ({ greeting }) => {
  let [name] = useStore(store => store.name);
  let [values] = useInput("UPDATE_NAME", name);

  return (
    <div>
      <h1>
        {greeting}: {name}
      </h1>
      <input {...values} />
      <div>{name}</div>
    </div>
  );
};

export default Home;
