// @jsx wigly.h
import wigly, { state } from "../src/main";

let Counter = ({ title }) => {
  let [count, set] = state(0);
  return (
    <div>
      <div>
        {title}: {count}
      </div>
      <button onclick={() => set(count + 1)}>increment</button>
    </div>
  );
};

let App = () => {
  let [username, set] = state();
  wigly.effect(() => {
    setTimeout(set, 1000, "minieggs40");
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
