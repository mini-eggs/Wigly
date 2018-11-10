/**
 * @param {Function} f
 * @export
 */
let nexttick = f => {
  let ticker = typeof requestAnimationFrame !== "undefined" ? requestAnimationFrame : setTimeout;
  ticker(f, 0);
};
