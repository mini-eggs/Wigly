/**
 * @param {string|Function} f
 * @param {*=} props
 * @param {*[]=} children
 * @return {ComponentSpec}
 */
export let h = (f, props, ...children) => ({ f, props: props || {}, children: [].concat.apply([], children) });
