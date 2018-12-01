import { defer, getCurrentlyExecutingComponent } from "./constants";

export let state = init => {
  let curr = getCurrentlyExecutingComponent();
  let key = curr.iter++;
  let val = curr.states[key];

  if (typeof val === "undefined") {
    if (typeof init === "function") {
      val = init();
    } else {
      val = init;
    }
  }

  return [
    val,
    next => {
      curr.states[key] = next;
      // defer(() => {
      //   // console.log(curr.test().update);
      //   // console.log(curr.update);
      //   console.log(curr.test().update === curr.update);

      //   let updater = curr.test().update || curr.update;
      //   updater();

      //   // curr.update();
      //   // curr.test().update();
      // });
      defer(curr.update);
    }
  ];
};
