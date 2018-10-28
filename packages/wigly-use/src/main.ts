var bag = new Map();
var exec: any; // currently executing component

type State = {
  component: Function;
  effects: Array<Function>;
};

export var use = (f: any) =>
  typeof f === "function"
    ? {
        ["data"]: (): State => ({
          component: (props: any) => f(props),
          effects: []
        }),

        ["mounted"](e: any): void {
          this["call"](e);
        },

        ["updated"](e: any): void {
          this["call"](e);
        },

        ["call"](e: any): void {
          var f;
          while ((f = ((this as any)["state"] as State).effects.shift())) f(e);
        },

        ["render"](): any {
          exec = this;
          return ((this as any)["state"] as State).component((this as any)["props"]);
        }
      }
    : f;

export var useState = (initial: any) => {
  var key = (exec["state"] as State).component;
  var update = exec["setState"];
  var current = bag.get(key) || new Map();
  var potential = current.get(initial);
  var value = typeof potential === "undefined" ? initial : potential;
  return [
    value,
    (next: any) => {
      bag.set(key, current.set(initial, next));
      update({});
    }
  ];
};

export var useEffect = (f: Function) => (exec["state"] as State).effects.push(f);

// @ts-ignore
self["use"] = use;
// @ts-ignore
self["useState"] = useState;
// @ts-ignore
self["useEffect"] = useEffect;
