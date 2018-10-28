class Component {
  static get isClassComponent() {
    return true;
  }
}

var classer = (sig: Component | any): any =>
  sig.isClassComponent === true
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

export { classer, Component };

// @ts-ignore
self["classer"] = classer;
// @ts-ignore
self["Component"] = Component;
