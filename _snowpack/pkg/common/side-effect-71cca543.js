import { e as ensureTransducer, p as push, b as isReduced, m as map } from './map-3e2f222d.js';

/**
 * Single-step transducer execution wrapper.
 * Returns array if transducer produces multiple results
 * and undefined if there was no output. Else returns single
 * result value.
 *
 * @remarks
 * Likewise, once a transducer has produced a final / reduced
 * value, all further invocations of the stepper function will
 * return undefined.
 *
 * @example
 * ```ts
 * // single result
 * step(map(x => x * 10))(1);
 * // 10
 *
 * // multiple results
 * step(mapcat(x => [x, x + 1, x + 2]))(1)
 * // [ 1, 2, 3 ]
 *
 * // no result
 * f = step(filter((x) => !(x & 1)))
 * f(1); // undefined
 * f(2); // 2
 *
 * // reduced value termination
 * f = step(take(2));
 * f(1); // 1
 * f(1); // 1
 * f(1); // undefined
 * f(1); // undefined
 * ```
 *
 * @param tx -
 */
const step = (tx) => {
    const { 1: complete, 2: reduce } = ensureTransducer(tx)(push());
    let done = false;
    return (x) => {
        if (!done) {
            let acc = reduce([], x);
            done = isReduced(acc);
            if (done) {
                acc = complete(acc.deref());
            }
            return acc.length === 1 ? acc[0] : acc.length > 0 ? acc : undefined;
        }
    };
};

/**
 * Helper transducer. Applies given `fn` to each input value, presumably
 * for side effects. Discards function's result and yields original
 * inputs.
 *
 * @param fn - side effect
 */
const sideEffect = (fn) => map((x) => (fn(x), x));

export { sideEffect as a, step as s };
//# sourceMappingURL=side-effect-71cca543.js.map
