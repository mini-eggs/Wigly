export var classer = sig =>
  typeof sig === "function"
    ? {
        ["data"]() {
          return new sig(this["props"])["state"] || {};
        },
        ...Object.getOwnPropertyNames(sig.prototype).reduce(
          (total, key) => ({ ...total, [key]: sig.prototype[key] }),
          {}
        )
      }
    : sig;
