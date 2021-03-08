/**
 * Clamps value `x` to given closed interval.
 *
 * @param x - value to clamp
 * @param min - lower bound
 * @param max - upper bound
 */
const clamp = (x, min, max) => (x < min ? min : x > max ? max : x);
/**
 * Clamps value `x` to closed [0 .. 1] interval.
 *
 * @param x
 */
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
/**
 * Clamps value `x` to closed [-1 .. 1] interval.
 *
 * @param x
 */
const clamp11 = (x) => (x < -1 ? -1 : x > 1 ? 1 : x);

export { clamp01 as a, clamp11 as b, clamp as c };
//# sourceMappingURL=interval-ab795faf.js.map
