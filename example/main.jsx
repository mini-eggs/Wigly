// @jsx h
import { h, render, useState, useEffect } from "../dist/main.js";

let Test = ({ other }) => {
  let [msg, setMsg] = useState("wow!");

  useEffect(() => {
    console.log("mounted");
    return () => console.log("destroyed");
  }, 0);

  return (
    <div>
      <h2>Child {other}</h2>
      <div>{msg || "____"}</div>
      <input oninput={event => setMsg(event.target.value)} />
    </div>
  );
};

let Scene = () => {
  return (
    <div>
      <Test key={0} other={"1"} />
      <Test key={1} other={"2"} />
    </div>
  );
};

let App = () => {
  let [msg, setMsg] = useState("wow!");
  let [count, setCount] = useState(0);

  let oninput = event => {
    setMsg(event.target.value);
    setCount(count + 1);
  };

  return (
    <div>
      <h2>Parent</h2>
      <div>{msg || "____"}</div>
      <input oninput={oninput} />
      <div>{count % 2 === 0 && <Scene />}</div>
    </div>
  );
};

render(<App />, document.body);
