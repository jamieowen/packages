import { u as unsupported } from './unsupported-608d53c8.js';
import { i as illegalArity, m as map, e as ensureTransducer, r as reduce, j as reducer, $ as $iter, g as compR, d as isIterable, c as iterator, h as ensureReduced, k as reduced } from './map-3e2f222d.js';
import { c as comp } from './comp-e3b62542.js';
import { r as range } from './range-778b1e8d.js';

function transduce(...args) {
    return $transduce(transduce, reduce, args);
}
const $transduce = (tfn, rfn, args) => {
    let acc, xs;
    switch (args.length) {
        case 4:
            xs = args[3];
            acc = args[2];
            break;
        case 3:
            xs = args[2];
            break;
        case 2:
            return map((x) => tfn(args[0], args[1], x));
        default:
            illegalArity(args.length);
    }
    return rfn(ensureTransducer(args[0])(args[1]), acc, xs);
};

function str(sep, xs) {
    sep = sep || "";
    let first = true;
    return xs
        ? [...xs].join(sep)
        : reducer(() => "", (acc, x) => ((acc = first ? acc + x : acc + sep + x), (first = false), acc));
}

function* zip(...src) {
    const iters = src.map((s) => s[Symbol.iterator]());
    while (true) {
        const tuple = [];
        for (let i of iters) {
            let v = i.next();
            if (v.done) {
                return;
            }
            tuple.push(v.value);
        }
        yield tuple;
    }
}

function mapIndexed(...args) {
    return ($iter(mapIndexed, args) ||
        ((rfn) => {
            const r = rfn[2];
            const fn = args[0];
            let i = args[1] || 0;
            return compR(rfn, (acc, x) => r(acc, fn(i++, x)));
        }));
}

function take(n, src) {
    return isIterable(src)
        ? iterator(take(n), src)
        : (rfn) => {
            const r = rfn[2];
            let m = n;
            return compR(rfn, (acc, x) => --m > 0
                ? r(acc, x)
                : m === 0
                    ? ensureReduced(r(acc, x))
                    : reduced(acc));
        };
}

/** @internal */
// prettier-ignore
const MATH = (op) => ([o, a, b]) => `${o}=${a}${op}${b};`;
/** @internal */
// prettier-ignore
const MATH_N = (op) => ([o, a]) => `${o}=${a}${op}n;`;
/** @internal */
// prettier-ignore
const FN = (op = "op") => ([o, a]) => `${o}=${op}(${a});`;
/** @internal */
// prettier-ignore
const FN3 = (op = "op") => ([o, a, b, c]) => `${o}=${op}(${a},${b},${c});`;
/** @internal */
const DOT = ([a, b]) => `${a}*${b}`;
/** @internal */
const DOT_G = ([a, b]) => `s+=${a}*${b};`;
/** @internal */
const SET = ([o, a]) => `${o}=${a};`;

/**
 * Specialized / optimized version of {@link @thi.ng/defmulti# | @thi.ng/defmulti} for
 * vector operations. Uses simplified logic to dispatch on length
 * (vector size) of `dispatch` argument.
 *
 * @param dispatch - arg index
 */
const vop = (dispatch = 0) => {
    const impls = new Array(5);
    let fallback;
    const fn = (...args) => {
        const g = impls[args[dispatch].length] || fallback;
        return g
            ? g(...args)
            : unsupported(`no impl for vec size ${args[dispatch].length}`);
    };
    fn.add = (dim, fn) => (impls[dim] = fn);
    fn.default = (fn) => (fallback = fn);
    fn.impl = (dim) => impls[dim] || fallback;
    // fn.impls = impls;
    return fn;
};

/** @internal */
const ARGS_V = "o,a";
/** @internal */
const ARGS_VV = "o,a,b";
/** @internal */
const ARGS_VVV = "o,a,b,c";
/** @internal */
const ARGS_VN = "o,a,n";
/** @internal */
const SARGS_V = "io=0,ia=0,so=1,sa=1";
/** @internal */
const NEW_OUT = "!o&&(o=[]);";
/**
 * HOF array index lookup gen to provide optimized versions of:
 *
 * @example
 * ```ts
 * lookup("a")(0) // a[ia]
 * lookup("a")(1) // a[ia * sa]
 * lookup("a")(2) // a[ia + 2 * sa]
 * ```
 *
 * @param sym -
 */
const lookup = (sym) => (i) => i > 1
    ? `${sym}[i${sym}+${i}*s${sym}]`
    : i == 1
        ? `${sym}[i${sym}+s${sym}]`
        : `${sym}[i${sym}]`;
/**
 * Infinite iterator of strided index lookups for `sym`.
 *
 * @param sym -
 */
const indicesStrided = (sym) => map(lookup(sym), range());
/**
 * Infinite iterator of simple (non-strided) index lookups for `sym`.
 *
 * @param sym -
 */
const indices = (sym) => map((i) => `${sym}[${i}]`, range());
/**
 * Code generator for loop-unrolled vector operations. Takes a vector
 * size `dim`, a code template function `tpl` and an array of symbol
 * names participating in the template. For each symbol, creates
 * iterator of index lookups (e.g. `a[0]` or `a[ia+k*sa]`), forms them
 * into tuples and passes them to template to generate code and joins
 * generated result with `opJoin` separator (default:
 * `""`).
 *
 * If the optional `ret` arg is not `null` (default `"a"`), appends a
 * `return` statement to the result array, using `ret` as return value.
 * Returns array of source code lines.
 *
 * The optional `pre` and `post` strings can be used to wrap the
 * generated code. `post` will be injected **before** the generated
 * return statement (if not suppressed).
 *
 * @param dim -
 * @param tpl -
 * @param syms -
 * @param ret -
 * @param opJoin -
 * @param pre -
 * @param post -
 * @param strided -
 */
const assemble = (dim, tpl, syms, ret = "a", opJoin = "", pre = "", post = "", strided = false) => [
    pre,
    transduce(comp(take(dim), mapIndexed((i, x) => tpl(x, i))), str(opJoin), (zip.apply(null, syms.split(",").map(strided ? indicesStrided : indices)))),
    post,
    ret !== "" ? `return ${ret};` : "",
];
const assembleG = (tpl, syms, ret = "a", pre, post, strided = false) => [
    pre,
    "for(let i=a.length;--i>=0;) {",
    tpl(syms
        .split(",")
        .map(strided ? (x) => `${x}[i${x}+i*s${x}]` : (x) => `${x}[i]`)),
    "}",
    post,
    ret !== null ? `return ${ret};` : "",
];
/** @internal */
const defaultOut = (o, args) => `!${o} && (${o}=${args.split(",")[1]});`;
/** @internal */
const compile = (dim, tpl, args, syms = args, ret = "a", opJoin, pre, post, strided = false) => (new Function(args, assemble(dim, tpl, syms, ret, opJoin, pre, post, strided).join("")));
/** @internal */
const compileHOF = (dim, fns, tpl, hofArgs, args, syms = args, ret = "a", opJoin = "", pre, post, strided = false) => {
    return new Function(hofArgs, `return (${args})=>{${assemble(dim, tpl, syms, ret, opJoin, pre, post, strided).join("")}}`)(...fns);
};
/** @internal */
const compileG = (tpl, args, syms = args, ret = "a", pre, post, strided = false) => (new Function(args, assembleG(tpl, syms, ret, pre, post, strided).join("")));
/** @internal */
const compileGHOF = (fns, tpl, hofArgs, args, syms = args, ret = "a", pre, post, strided = false) => (new Function(hofArgs, `return (${args})=>{${assembleG(tpl, syms, ret, pre, post, strided).join("")}}`)(...fns));
const defOp = (tpl, args = ARGS_VV, syms, ret = "o", dispatch = 1, pre) => {
    syms = syms || args;
    pre = pre != null ? pre : defaultOut(ret, args);
    const fn = vop(dispatch);
    const $ = (dim) => fn.add(dim, compile(dim, tpl, args, syms, ret, "", pre));
    fn.default(compileG(tpl, args, syms, ret, pre));
    return [fn, $(2), $(3), $(4)];
};
const defHofOp = (op, tpl, args = ARGS_V, syms, ret = "o", dispatch = 1, pre) => {
    const _tpl = tpl || FN("op");
    syms = syms || args;
    pre = pre != null ? pre : defaultOut(ret, args);
    const $ = (dim) => compileHOF(dim, [op], _tpl, "op", args, syms, ret, "", pre);
    const fn = vop(dispatch);
    fn.default(compileGHOF([op], _tpl, "op", args, syms, ret, pre));
    return [fn, $(2), $(3), $(4)];
};
const defMathOp = (op) => defOp(MATH(op));
const defMathOpN = (op) => defOp(MATH_N(op), ARGS_VN);

export { ARGS_VVV as A, DOT_G as D, FN3 as F, NEW_OUT as N, SET as S, defMathOp as a, defOp as b, defHofOp as c, defMathOpN as d, compileG as e, compile as f, DOT as g, SARGS_V as h, vop as v };
//# sourceMappingURL=codegen-5794034c.js.map
