import { r as range } from './range-778b1e8d.js';
import { g as compR, u as unreduced, b as isReduced, h as ensureReduced, i as illegalArity, d as isIterable, c as iterator, m as map } from './map-3e2f222d.js';
import { c as comp } from './comp-e3b62542.js';

/**
 * Transducer to concatenate iterable values. Iterates over each input
 * and emits individual values down stream, therefore removing one level
 * of nesting from the input.
 *
 * @remarks
 * If, during processing, the transducer is given a wrapped reduced
 * input iterable, it will still be processed as normal, but then
 * immediately triggers early termination by wrapping its own result in
 * {@link reduced}. E.g. this behavior allows a {@link (mapcat:1)} user
 * functions to benefit from reduced results.
 *
 * Also see:
 * - {@link concat}
 * - {@link (mapcat:1)}
 *
 * @example
 * ```ts
 * [...iterator(comp(map((x) => [x, x]), cat()), [1, 2, 3, 4])]
 * // [ 1, 1, 2, 2, 3, 3, 4, 4 ]
 *
 * [...iterator(
 *   comp(
 *     mapIndexed((i, x) => [[i], [x, x]]),
 *     cat(),
 *     cat()
 *   ),
 *   "abc"
 * )]
 * // [ 0, 'a', 'a', 1, 'b', 'b', 2, 'c', 'c' ]
 *
 * [...mapcat((x)=>(x > 1 ? reduced([x, x]) : [x, x]), [1, 2, 3, 4])]
 * // [ 1, 1, 2, 2 ]
 * ```
 *
 * @param rfn -
 */
const cat = () => (rfn) => {
    const r = rfn[2];
    return compR(rfn, (acc, x) => {
        if (x) {
            for (let y of unreduced(x)) {
                acc = r(acc, y);
                if (isReduced(acc)) {
                    break;
                }
            }
        }
        return isReduced(x) ? ensureReduced(acc) : acc;
    });
};

function* range2d(...args) {
    let fromX, toX, stepX;
    let fromY, toY, stepY;
    switch (args.length) {
        case 6:
            stepX = args[4];
            stepY = args[5];
        case 4:
            [fromX, toX, fromY, toY] = args;
            break;
        case 2:
            [toX, toY] = args;
            fromX = fromY = 0;
            break;
        default:
            illegalArity(args.length);
    }
    const rx = range(fromX, toX, stepX);
    for (let y of range(fromY, toY, stepY)) {
        for (let x of rx) {
            yield [x, y];
        }
    }
}

function mapcat(fn, src) {
    return isIterable(src) ? iterator(mapcat(fn), src) : comp(map(fn), cat());
}

export { mapcat as m, range2d as r };
//# sourceMappingURL=mapcat-f74e1642.js.map
