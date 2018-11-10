// @jsx h
import { h, render, useState, useEffect } from "../src/wigly";
import styled, { inject } from "./styled-wigly";

let Wowza = styled.div`
  background: grey;
`;

let Deep = () => {
  useEffect(() => {
    console.log("Deep mounted");
    return () => console.log("Deep destroyed");
  }, 0);

  return <div>lifecycle test</div>;
};

let Test = ({ other }) => {
  let [msg, setMsg] = useState("wow!");

  useEffect(() => {
    console.log("Test mounted");
    return () => console.log("Test destroyed");
  }, 0);

  return (
    <div>
      <h2>Child {other}</h2>
      <div>{msg || "____"}</div>
      <input oninput={event => setMsg(event.target.value)} />
      <Deep />
    </div>
  );
};

let Scene = ({ displayLast }) => {
  return (
    <div>
      <Test key={0} other={"1"} />
      {displayLast && <Test key={1} other={"2"} />}
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
      <Wowza>Wowza</Wowza>
      <h2>Parent</h2>
      <div>{msg || "____"}</div>
      <input oninput={oninput} />
      <div>
        <Scene displayLast={count % 3 !== 0} />
      </div>
    </div>
  );
};

render(<App />, document.body);
inject();
