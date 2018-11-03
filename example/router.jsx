// @jsx h
import { h } from "../src/main.ts";
import Home from "./scenes/home";

let Router = () => {
  return (
    <div>
      <Home greeting={"NAME"} />
    </div>
  );
};

export default Router;
