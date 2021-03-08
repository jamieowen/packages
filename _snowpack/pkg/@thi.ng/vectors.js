import { b as mulN, e as set } from '../common/dist-ee9b3aef.js';
export { a as add3, h as add4, c as clampN3, d as dist3, f as mulN2, m as mulN3, g as mulN4, s as set3 } from '../common/dist-ee9b3aef.js';
import { v as vop, e as compileG, f as compile, c as defHofOp, A as ARGS_VVV, F as FN3, a as defMathOp } from '../common/codegen-5794034c.js';
import { E as EPS } from '../common/api-b6b788f6.js';
export { s as sub3, a as sub4 } from '../common/sub-16feec6f.js';
import { c as clamp$1, a as clamp01, b as clamp11 } from '../common/interval-ab795faf.js';
import '../common/unsupported-608d53c8.js';
import '../common/deferror-99934d1f.js';
import '../common/map-3e2f222d.js';
import '../common/comp-e3b62542.js';
import '../common/range-778b1e8d.js';

const $$1 = (dim) => magSq.add(dim, compile(dim, ([a]) => `${a}*${a}`, "a", "a", "", "+", "return ", ";"));
const magSq = vop();
magSq.default(compileG(([a]) => `sum+=${a}*${a};`, "a", undefined, "sum", "let sum=0;"));
$$1(2);
$$1(3);
$$1(4);

const mag = (v) => Math.sqrt(magSq(v));

/**
 * Normalizes vector to given (optional) length (default: 1). If `out`
 * is null, modifies `v` in place.
 *
 * @param out -
 * @param v -
 * @param n -
 */
const normalize = (out, v, n = 1) => {
    !out && (out = v);
    const m = mag(v);
    return m >= EPS ? mulN(out, v, n / m) : out !== v ? set(out, v) : out;
};

const [clamp, clamp2, clamp3, clamp4] = defHofOp(clamp$1, FN3(), ARGS_VVV);
defHofOp(clamp01, FN3(), ARGS_VVV);
defHofOp(clamp11, FN3(), ARGS_VVV);

const $ = (dim) => distManhattan.add(dim, compile(dim, ([a, b]) => `Math.abs(${a}-${b})`, "a,b", undefined, "", "+", "return ", ";"));
const distManhattan = vop();
distManhattan.default(compileG(([a, b]) => `sum+=Math.abs(${a}-${b});`, "a,b", undefined, "sum", "let sum=0;"));
$(2);
const distManhattan3 = $(3);
$(4);

const [mul, mul2, mul3, mul4] = defMathOp("*");

const [div, div2, div3, div4] = defMathOp("/");

export { clamp4, distManhattan3, div4, mul4, normalize };
//# sourceMappingURL=vectors.js.map
