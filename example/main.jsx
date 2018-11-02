// @jsx h
import wigly from "../src/main.ts";
let { h, render, useState, useEffect } = wigly;

// import { h, render, useState, useEffect } from "../";

// test.serial("'useEffect' as mount, destroyed func.", t => {
let destroyCount = 0;
let set;

let Child = () => {
  useEffect(() => () => destroyCount++, 0);
  return <div>hi</div>;
};

let App = () => {
  let [count, setCount] = useState(0);
  set = setCount;
  return <div>{count % 2 === 0 && <Child />}</div>;
};

render(<App />, document.body);
set(1);
// t.deepEqual(destroyCount, 0);
set(2);
// t.deepEqual(destroyCount, 1);
// });

// let Counter = () => {
//   let [val, set] = useState(0);

//   useEffect(el => {
//     console.log("mounted");
//     return () => console.log("destroyed");
//   }, 0);

//   return <button onclick={e => set(val + 1)}>count {val}</button>;
// };

// let Container = ({ children }) => <div>{children}</div>;

// let App = () => {
//   let [count, setCount] = useState(0);
//   let [active, setActive] = useState(true);

//   useEffect(el => {
//     console.log("this operates as a mount func");
//   }, 0);

//   useEffect(el => {
//     console.log("this operates as an updated+mount func");
//   });

//   return (
//     <Container>
//       {Array.from({ length: active ? 5 : 10 }).map((_, key) => (
//         <Counter key={key} />
//       ))}
//       <div>
//         <button class={count % 2 === 0 ? `item-${count}` : undefined} onclick={() => setCount(count + 1)}>
//           update {count}
//         </button>
//         <button onclick={() => setActive(!active)}>toggle</button>
//       </div>
//     </Container>
//   );
// };

// render(<App />, document.body);
