export let h = (f, props, ...children) => ({ f, props: props || {}, children: [].concat.apply([], children) });
