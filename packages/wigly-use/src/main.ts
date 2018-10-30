type State = {
  values: Map<number, any>;
  effects: Array<Function>;
  cleaners: Array<Function>;
};

declare type Context = {
  call(e: Node): void;
  clean(): void;
  update(): void;
  setState(next: Object): void;
  state: State;
  props: Object;
};

declare interface Component {
  data: any;
  mounted: any;
  updated: any;
  destroyed: any;
  call?: any;
  clean?: any;
  update?: any;
  render?: any;
}

var iter = 0;
var exec: Context;

var debounce = (f: Function) => {
  var timer: any;
  return function(this: any) {
    clearTimeout(timer);
    timer = setTimeout(f.bind(this), 1, arguments);
  };
};

export var use = (f: Function | Component): Component =>
  typeof f === "function"
    ? {
        data: (): State => ({
          values: new Map(),
          effects: [],
          cleaners: []
        }),

        mounted(this: Context, e: Node) {
          this.call(e);
        },

        updated(this: Context, e: Node) {
          this.clean();
          this.call(e);
        },

        destroyed(this: Context) {
          this.clean();
        },

        call(this: Context, e: Node) {
          var f;
          while ((f = this.state.effects.shift())) {
            this.state.cleaners.push(f(e) || (() => {}));
          }
        },

        clean(this: Context) {
          this.state.cleaners.forEach(f => f());
        },

        update: debounce(function(this: Context) {
          this.setState({});
        }),

        render(this: Context) {
          iter = 0;
          exec = this;
          return f(this.props);
        }
      }
    : f;

export var useState = (initial: any) => {
  var current = ++iter;
  var potential = exec.state.values.get(current);
  var value = typeof potential === "undefined" ? initial : potential;
  return [
    value,
    (next: any) => {
      exec.state.values.set(current, next);
      exec.update();
    }
  ];
};

export var useEffect = (f: Function) => exec.state.effects.push(f);

// @ts-ignore
self["use"] = use;
// @ts-ignore
self["useState"] = useState;
// @ts-ignore
self["useEffect"] = useEffect;
