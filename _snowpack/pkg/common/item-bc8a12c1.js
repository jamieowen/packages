import { a as illegalArgs, b as isString, i as isNumber } from './illegal-arguments-07fc2d96.js';
import { i as isPlainObject } from './is-plain-object-7a83b681.js';
import { i as isBoolean } from './is-boolean-04a49a85.js';

const RE_VEC = /^[iub]?vec[234]$/;
const RE_MAT = /^mat[234]$/;
/**
 * Returns true if given `t` is a {@link Term}-like object.
 *
 * @param t
 */
const isTerm = (t) => isPlainObject(t) && !!t.tag && !!t.type;
/**
 * Returns true, if given term evaluates to a vector value (vec, ivec, bvec).
 */
const isVec = (t) => RE_VEC.test(t.type);
/**
 * Returns true, if given term evaluates to a matrix value.
 */
const isMat = (t) => RE_MAT.test(t.type);

let symID = 0;
/**
 * Generates a new symbol name, e.g. `_sa2`. Uses base36 for counter to
 * keep names short.
 */
const gensym = () => `_s${(symID++).toString(36)}`;

function sym(type, ...xs) {
    let id;
    let opts;
    let init;
    switch (xs.length) {
        case 0:
            if (!isString(type)) {
                init = type;
                type = init.type;
            }
            break;
        case 1:
            if (isString(xs[0])) {
                id = xs[0];
            }
            else if (xs[0].tag) {
                init = xs[0];
            }
            else {
                opts = xs[0];
            }
            break;
        case 2:
            if (isString(xs[0])) {
                [id, opts] = xs;
            }
            else {
                [opts, init] = xs;
            }
            break;
        case 3:
            [id, opts, init] = xs;
            break;
        default:
            illegalArgs();
    }
    return {
        tag: "sym",
        type,
        id: id || gensym(),
        opts: opts || {},
        init: init,
    };
}
const input = (type, id, opts) => sym(type, id, Object.assign({ q: "in", type: "in" }, opts));
const output = (type, id, opts) => sym(type, id, Object.assign({ q: "out", type: "out" }, opts));
const uniform = (type, id, opts) => sym(type, id, Object.assign({ q: "in", type: "uni" }, opts));

const lit = (type, val, info) => ({
    tag: "lit",
    type,
    info,
    val,
});
const bool = (x) => lit("bool", isNumber(x) ? !!x : x);
const float = (x) => lit("float", isBoolean(x) ? x & 1 : x);
const int = (x) => lit("int", isBoolean(x) ? x & 1 : isNumber(x) ? x | 0 : x);
const uint = (x) => lit("uint", isBoolean(x) ? x & 1 : isNumber(x) ? x >>> 0 : x);
const wrap = (type, ctor) => (x) => isNumber(x)
    ? ctor(x)
    : x !== undefined && !isVec(x) && x.type !== type
        ? ctor(x)
        : x;
/**
 * Takes a plain number or numeric term and wraps it as float literal if
 * needed.
 *
 * @param x -
 */
const wrapFloat = wrap("float", float);
const FLOAT0 = float(0);
const FLOAT1 = float(1);
const FLOAT2 = float(2);
const FLOAT05 = float(0.5);
const $gvec = (wrap, init) => (xs) => [xs[0] === undefined ? init : wrap(xs[0]), ...xs.slice(1).map(wrap)];
const $vec = $gvec(wrapFloat, FLOAT0);
const $info = (xs, info) => isVec(xs[0]) ? xs[0].type[0] : info[xs.length];
const $gvec2 = (type, ctor, xs) => lit(type, (xs = ctor(xs)), $info(xs, ["n", "n"]));
const $gvec3 = (type, ctor, xs) => lit(type, (xs = ctor(xs)), xs.length === 2 ? "vn" : $info(xs, ["n", "n"]));
const $gvec4 = (type, ctor, xs) => lit(type, (xs = ctor(xs)), xs.length === 2
    ? isVec(xs[1])
        ? "vv"
        : "vn"
    : $info(xs, ["n", "n", , "vnn"]));
// prettier-ignore
function vec2(...xs) {
    return $gvec2("vec2", $vec, xs);
}
function vec3(...xs) {
    return $gvec3("vec3", $vec, xs);
}
function vec4(...xs) {
    return $gvec4("vec4", $vec, xs);
}

/**
 * Returns base type for given term. Used for array ops.
 *
 * @example
 * ```ts
 * itemType("vec2[]") => "vec2"
 * ```
 */
const itemType = (type) => type.replace("[]", "");
/**
 * Takes a numeric term and a plain number, returns number wrapped in
 * typed literal compatible with term.
 *
 * @param t -
 * @param x -
 */
const numberWithMatchingType = (t, x) => {
    const id = t.type[0];
    return id === "i"
        ? int(x)
        : id === "u"
            ? uint(x)
            : id === "b"
                ? bool(x)
                : float(x);
};

export { FLOAT1 as F, vec2 as a, isVec as b, isMat as c, itemType as d, isTerm as e, float as f, gensym as g, vec3 as h, input as i, FLOAT05 as j, FLOAT0 as k, FLOAT2 as l, numberWithMatchingType as n, output as o, sym as s, uniform as u, vec4 as v };
//# sourceMappingURL=item-bc8a12c1.js.map
