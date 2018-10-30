"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var iter = 0;
var exec;
var debounce = (f) => {
    var timer;
    return function () {
        clearTimeout(timer);
        timer = setTimeout(f.bind(this), 1, arguments);
    };
};
exports.use = (f) => typeof f === "function"
    ? {
        data: () => ({
            values: new Map(),
            effects: [],
            cleaners: []
        }),
        mounted(e) {
            this.call(e);
        },
        updated(e) {
            this.clean();
            this.call(e);
        },
        destroyed() {
            this.clean();
        },
        call(e) {
            var f;
            while ((f = this.state.effects.shift())) {
                this.state.cleaners.push(f(e) || (() => { }));
            }
        },
        clean() {
            this.state.cleaners.forEach(f => f());
        },
        update: debounce(function () {
            this.setState({});
        }),
        render() {
            iter = 0;
            exec = this;
            return f(this.props);
        }
    }
    : f;
exports.useState = (initial) => {
    var { update, state } = exec;
    var current = ++iter;
    var potential = state.values.get(current);
    var value = typeof potential === "undefined" ? initial : potential;
    return [
        value,
        (next) => {
            state.values.set(current, next);
            update();
        }
    ];
};
exports.useEffect = (f) => exec.state.effects.push(f);
// @ts-ignore
self["use"] = exports.use;
// @ts-ignore
self["useState"] = exports.useState;
// @ts-ignore
self["useEffect"] = exports.useEffect;
