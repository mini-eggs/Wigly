// @jsx h
import { h, render, useState, useEffect } from "../src/main";

let Test = ({ other }) => {
  let [msg, setMsg] = useState("wow!");

  useEffect(() => {
    console.log("post render");
    return () => console.log("flush");
  });

  useEffect(() => {
    console.log("mounted");
  }, 0);

  return (
    <div>
      <h2>Child {other}</h2>
      <div>{msg}</div>
      <input oninput={event => setMsg(event.target.value)} />
    </div>
  );
};

let Scene = () => {
  let [msg, setMsg] = useState("wow!");

  return (
    <div>
      <h2>Parent</h2>
      <div>{msg}</div>
      <input oninput={event => setMsg(event.target.value)} />
      <Test key={0} other={msg + " 1"} />
      <Test key={1} other={msg + " 2"} />
    </div>
  );
};

let App = () => {
  let [msg, setMsg] = useState("wow!");

  return (
    <div>
      <h2>Parent</h2>
      <div>{msg}</div>
      <input oninput={event => setMsg(event.target.value)} />
      <Test key={0} other={msg + " 1"} />
      <Test key={1} other={msg + " 2"} />
      <Scene />
    </div>
  );
};

render(<App />, document.body);
