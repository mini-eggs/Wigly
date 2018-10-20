export var customizer = (f, options) => {
  var arr = item => (Array.isArray(item) ? item : [item]);

  var traverse = struct => {
    if (typeof struct === "number" || typeof struct === "string" || !struct) {
      return struct;
    }

    return {
      ...struct,
      ["children"]: arr(struct["children"] || []).map(child => (options["applyToChildren"] ? traverse(child) : child)),
      ["tag"]: typeof struct["tag"] === "object" ? f(struct["tag"]) : struct["tag"]
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
