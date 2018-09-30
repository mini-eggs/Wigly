import test from "ava";
import { createStore } from "../";

/**
 * Initial states and switches.
 */
let itemState = {
  items: [{ price: 99, title: "keyboard" }]
};

let itemSwitch = {
  NOOP: () => {},
  _: ({ state = itemState }) => state
};

let userState = {
  name: "Evan"
};

let userSwitch = {
  UPDATE_NAME: ({ payload }) => ({ name: payload }),
  _: ({ state = userState }) => state
};

/**
 * Tests.
 */
test("Hello World", t => {
  let count = 0;

  let store = createStore({ user: userSwitch, item: itemSwitch });
  let unsub = store.subscribe(() => count++);
  t.deepEqual(typeof unsub, "function");

  let stateOne = store.getState();
  t.deepEqual(stateOne, { user: { name: "Evan" }, item: itemState });
  t.deepEqual(count, 0);

  store.dispatch("UPDATE_NAME", "Joba");

  let stateTwo = store.getState();
  t.deepEqual(stateTwo, { user: { name: "Joba" }, item: itemState });
  t.deepEqual(count, 1);

  unsub();
  store.dispatch("UPDATE_NAME", "Madison");

  let stateThree = store.getState();
  t.deepEqual(stateThree, { user: { name: "Madison" }, item: itemState });
  t.deepEqual(count, 1);

  store.dispatch("NOOP");

  let stateFour = store.getState();
  t.deepEqual(stateFour, { user: { name: "Madison" }, item: itemState });
  t.deepEqual(count, 1);
});
