export default store => (mapState = () => ({}), mapDispatch = () => ({})) => tag => ({
  ["data"]() {
    return {
      ["unsubscribe"]: store["subscribe"](this["handleSubscription"]),
      ["storeState"]: store["getState"]()
    };
  },
  ["handleSubscription"]() {
    this["setState"](() => ({ ["storeState"]: store["getState"]() }));
  },
  ["destroyed"]() {
    this["state"]["unsubscribe"]();
  },
  ["render"]() {
    let state = mapState(this["state"]["storeState"]);
    let actions = mapDispatch(store["dispatch"]);
    return { tag, ...state, ...actions, ...this["props"], ["children"]: this["children"] };
  }
});
