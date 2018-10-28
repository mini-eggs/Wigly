var bag = new Map();
var exec: any; // currently executing component

export var use = (f: any): any => ({
  ["data"]: () => ({ ["f"]: (props: any) => f(props) }),
  ["render"]() {
    exec = [this["state"]["f"], this];
    return this["state"]["f"](this["props"]);
  }
});

export var useState = (initial: any) => {
  var [key, ctx] = exec;
  var current = bag.get(key) || new Map();
  var potential = current.get(initial);
  var value = typeof potential === "undefined" ? initial : potential;
  return [
    value,
    (next: any) => {
      bag.set(key, current.set(initial, next));
      ctx["setState"]({});
    }
  ];
};

// @ts-ignore
self["use"] = use;
// @ts-ignore
self["useState"] = useState;
