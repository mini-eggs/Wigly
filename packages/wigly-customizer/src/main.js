var arr = item => (Array.isArray(item) ? item : [item]);

export var customizer = f => {
  var traverse = struct => {
    if (["number", "string"].indexOf(typeof struct) !== -1 || !struct) {
      return struct;
    }

    return {
      ...struct,
      ["children"]: arr(struct["children"] || []).map(traverse),
      ["tag"]:
        ["object", "function"].indexOf(typeof struct["tag"]) !== -1 ? customizer(f)(struct["tag"]) : struct["tag"]
    };
  };

  return sig => {
    var next = f(sig);
    return {
      ...next,
      ["render"]: function() {
        return traverse(next["render"].call(this));
      }
    };
  };
};
