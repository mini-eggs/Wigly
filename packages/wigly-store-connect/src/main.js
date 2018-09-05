export default (wigly, store) => {
  return (mapState = () => ({}), mapDispatch = () => ({})) => {
    return component => {
      return wigly["component"]({
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
          return wigly["h"](component, { ...state, ...actions, ...this["props"] }, this["children"]);
        }
      });
    };
  };
};
