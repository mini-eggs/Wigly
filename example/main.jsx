import "@babel/polyfill";
import wigly from "../src/main";

let React = { createElement: wigly.h }; // for jsx

let getUsername = () =>
  new Promise(resolve => {
    setTimeout(resolve, 1000, "minieggs40");
  });

let Counter = ({ title }) => {
  let [count, setCounter] = wigly.state(0);

  return (
    <div>
      <div>
        {title}: {count}
      </div>
      <button onclick={() => setCounter(count + 1)}>increment</button>
    </div>
  );
};

let App = () => {
  let [username, setUsername] = wigly.state();

  wigly.effect(async () => {
    setUsername(await getUsername());
  }, 0);

  return (
    <div>
      <div>{username ? `Username: ${username}` : "loading..."}</div>
      {Array.from({ length: 3 }).map((_, key) => (
        <Counter title="Counter" key={key} />
      ))}
    </div>
  );
};

wigly.render(<App />, document.body);
