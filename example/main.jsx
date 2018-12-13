import { render, state, effect } from "../src/wigly/wigly";

let Counter = ({ title }) => {
  let [count, set] = state(0);

  // return (
  //   <div>
  //     <div>
  //       {title}: {count}
  //     </div>
  //     <button onclick={() => set(count + 1)}>increment</button>
  //   </div>
  // );

  return [
    "div",
    ["div", `${title}: ${count}`],
    ["button", { onclick: () => set(count + 1) }, "increment"]
  ];
};

let App = () => {
  let [username, set] = state();

  effect(() => {
    setTimeout(set, 1000, "minieggs40");
  }, 0);

  // return (
  //   <div>
  //     <div>{username ? `Username: ${username}` : "loading..."}</div>
  //     {Array.from({ length: 3 }).map((_, key) => {
  //       return <Counter title="Counter" key={key} />;
  //     })}
  //   </div>
  // );

  let counters = Array.from({ length: 3 }).map((_, key) => [
    Counter,
    { title: "Counter", key }
  ]);

  return [
    "div",
    username ? `Username: ${username}` : "loading...",
    ...counters
  ];
};

let Child = () => {
  effect(() => {
    console.log("mount");
    return () => console.log("destroy");
  });

  // return <div>child goes here</div>;

  return ["div", "child goes here"];
};

App = () => {
  let [displayChild, set] = state(false);

  // return (
  //   <div>
  //     <button onclick={() => set(!displayChild)}>click me</button>
  //     <div>{displayChild && <Child />}</div>
  //   </div>
  // );

  return [
    "div",
    ["button", { onclick: () => set(!displayChild) }, "click me"],
    [Child],
    ["div", displayChild && [Child]]
  ];
};

render(App, document.body);
