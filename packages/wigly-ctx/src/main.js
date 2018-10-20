export var contextualize = vars => sig => {
  var next = {};

  for (let key of Object.keys(sig)) {
    next[key] = function() {
      return sig[key].apply({ ...this, ...vars }, arguments);
    };
  }

  return next;
};
