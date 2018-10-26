var keys = ["mounted", "updated", "destroyed"];

export var use = f => ({
  ["data"]: () => ({
    ["f"]: p => f(p),
    ["values"]: new Map(),
    ["lifecycles"]: new Map()
  }),

  ...keys.reduce(
    (total, key) => ({
      ...total,
      [key](el) {
        var f = this["state"]["lifecycles"]["get"](key);
        f && f(el);
      }
    }),
    {}
  ),

  ["render"]() {
    return this["state"]["f"]({
      ...this["props"],
      ["useState"]: initial => [
        this["state"]["values"]["get"](initial) || initial,
        value => {
          this["state"]["values"]["set"](initial, value), this["setState"]({});
        }
      ],
      ["useMount"]: f => this["state"]["lifecycles"]["set"](keys[0], f),
      ["useUpdate"]: f => this["state"]["lifecycles"]["set"](keys[1], f),
      ["useDestroy"]: f => this["state"]["lifecycles"]["set"](keys[2], f)
    });
  }
});
