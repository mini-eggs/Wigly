var keys = ["mounted", "updated", "destroyed"];

export var use = f => ({
  ["data"]: () => ({
    ["f"]: p => f(p),
    ["v"]: new Map(),
    ["l"]: new Map()
  }),

  ...keys.reduce(
    (total, key) => ({
      ...total,
      [key](el) {
        var f = this["state"]["l"]["get"](key);
        f && f(el);
      }
    }),
    {}
  ),

  ["use"](initial) {
    var current = this["state"]["v"]["get"](initial);
    return [
      current ? current.value : initial,
      value => {
        this["state"]["v"]["set"](initial, { value });
        this["setState"]({});
      }
    ];
  },

  ["reg"](i) {
    return f => this["state"]["l"]["set"](keys[i], f);
  },

  ["render"]() {
    return this["state"]["f"]({
      ...this["props"],
      ["useState"]: this["use"],
      ["useMount"]: this["reg"](0),
      ["useUpdate"]: this["reg"](1),
      ["useDestroy"]: this["reg"](2)
    });
  }
});
