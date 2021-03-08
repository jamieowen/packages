import { d as defError } from './deferror-99934d1f.js';

const implementsFunction = (x, fn) => x != null && typeof x[fn] === "function";

const isArrayLike = (x) => x != null && typeof x !== "function" && x.length !== undefined;

const isIterable = (x) => x != null && typeof x[Symbol.iterator] === "function";

/**
 * Internal use only. **Do NOT use in user land code!**
 *
 * @internal
 */
const SEMAPHORE = Symbol();
/**
 * No-effect placeholder function.
 */
const NO_OP = () => { };

const ensureTransducer = (x) => implementsFunction(x, "xform")
    ? x.xform()
    : x;

class Reduced {
    constructor(val) {
        this.value = val;
    }
    deref() {
        return this.value;
    }
}
const reduced = (x) => new Reduced(x);
const isReduced = (x) => x instanceof Reduced;
const ensureReduced = (x) => x instanceof Reduced ? x : new Reduced(x);
const unreduced = (x) => (x instanceof Reduced ? x.deref() : x);

const IllegalArityError = defError(() => "illegal arity");
const illegalArity = (n) => {
    throw new IllegalArityError(n);
};

const parseArgs = (args) => args.length === 2
    ? [undefined, args[1]]
    : args.length === 3
        ? [args[1], args[2]]
        : illegalArity(args.length);
function reduce(...args) {
    const rfn = args[0];
    const init = rfn[0];
    const complete = rfn[1];
    const reduce = rfn[2];
    args = parseArgs(args);
    const acc = args[0] == null ? init() : args[0];
    const xs = args[1];
    return unreduced(complete(implementsFunction(xs, "$reduce")
        ? xs.$reduce(reduce, acc)
        : isArrayLike(xs)
            ? reduceArray(reduce, acc, xs)
            : reduceIterable(reduce, acc, xs)));
}
const reduceArray = (rfn, acc, xs) => {
    for (let i = 0, n = xs.length; i < n; i++) {
        acc = rfn(acc, xs[i]);
        if (isReduced(acc)) {
            acc = acc.deref();
            break;
        }
    }
    return acc;
};
const reduceIterable = (rfn, acc, xs) => {
    for (let x of xs) {
        acc = rfn(acc, x);
        if (isReduced(acc)) {
            acc = acc.deref();
            break;
        }
    }
    return acc;
};
/**
 * Convenience helper for building a full {@link Reducer} using the identity
 * function (i.e. `(x) => x`) as completion step (true for 90% of all
 * bundled transducers).
 *
 * @param init - init step of reducer
 * @param rfn - reduction step of reducer
 */
const reducer = (init, rfn) => [init, (acc) => acc, rfn];

function push(xs) {
    return xs
        ? [...xs]
        : reducer(() => [], (acc, x) => (acc.push(x), acc));
}

/**
 * Takes a transducer and input iterable. Returns iterator of
 * transformed results.
 *
 * @param xform -
 * @param xs -
 */
function* iterator(xform, xs) {
    const rfn = ensureTransducer(xform)(push());
    const complete = rfn[1];
    const reduce = rfn[2];
    for (let x of xs) {
        const y = reduce([], x);
        if (isReduced(y)) {
            yield* unreduced(complete(y.deref()));
            return;
        }
        if (y.length) {
            yield* y;
        }
    }
    yield* unreduced(complete([]));
}
/**
 * Optimized version of {@link iterator} for transducers which are
 * guaranteed to:
 *
 * 1) Only produce none or a single result per input
 * 2) Do not require a `completion` reduction step
 *
 * @param xform -
 * @param xs -
 */
function* iterator1(xform, xs) {
    const reduce = (ensureTransducer(xform)([NO_OP, NO_OP, (_, x) => x]))[2];
    for (let x of xs) {
        let y = reduce(SEMAPHORE, x);
        if (isReduced(y)) {
            y = unreduced(y.deref());
            if (y !== SEMAPHORE) {
                yield y;
            }
            return;
        }
        if (y !== SEMAPHORE) {
            yield y;
        }
    }
}
/**
 * Helper function used by various transducers to wrap themselves as
 * transforming iterators. Delegates to {@link iterator1} by default.
 *
 * @param xform -
 * @param args -
 * @param impl -
 *
 * @internal
 */
const $iter = (xform, args, impl = iterator1) => {
    const n = args.length - 1;
    return isIterable(args[n])
        ? args.length > 1
            ? impl(xform.apply(null, args.slice(0, n)), args[n])
            : impl(xform(), args[0])
        : undefined;
};

/**
 * Reducer composition helper, internally used by various transducers
 * during initialization. Takes existing reducer `rfn` (a 3-tuple) and a
 * reducing function `fn`. Returns a new reducer tuple.
 *
 * @remarks
 * `rfn[2]` reduces values of type `B` into an accumulator of type `A`.
 * `fn` accepts values of type `C` and produces interim results of type
 * `B`, which are then (possibly) passed to the "inner" `rfn[2]`
 * function. Therefore the resulting reducer takes inputs of `C` and an
 * accumulator of type `A`.
 *
 * It is assumed that `fn` internally calls `rfn[2]` to pass its own
 * results for further processing by the nested reducer `rfn`.
 *
 * @example
 * ```ts
 * compR(rfn, fn)
 * // [rfn[0], rfn[1], fn]
 * ```
 *
 * @param rfn -
 * @param fn -
 */
const compR = (rfn, fn) => [rfn[0], rfn[1], fn];

function map(fn, src) {
    return isIterable(src)
        ? iterator1(map(fn), src)
        : (rfn) => {
            const r = rfn[2];
            return compR(rfn, (acc, x) => r(acc, fn(x)));
        };
}

export { $iter as $, NO_OP as N, SEMAPHORE as S, implementsFunction as a, isReduced as b, iterator as c, isIterable as d, ensureTransducer as e, iterator1 as f, compR as g, ensureReduced as h, illegalArity as i, reducer as j, reduced as k, map as m, push as p, reduce as r, unreduced as u };
//# sourceMappingURL=map-3e2f222d.js.map
