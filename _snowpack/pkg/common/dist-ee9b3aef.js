import { d as defMathOpN, a as defMathOp, b as defOp, N as NEW_OUT, S as SET, c as defHofOp, v as vop, e as compileG, f as compile } from './codegen-5794034c.js';
import { c as clamp } from './interval-ab795faf.js';

const [mulN, mulN2, mulN3, mulN4] = defMathOpN("*");

const [add, add2, add3, add4] = defMathOp("+");

const [set, set2, set3, set4] = defOp(SET, "o,a", undefined, "o", 1, NEW_OUT);

const [clampN, clampN2, clampN3, clampN4] = defHofOp(clamp, ([o, a]) => `${o}=op(${a},n,m);`, "o,a,n,m", "o,a");

const tpl = ([a, b]) => `t=${a}-${b};s+=t*t;`;
const pre = "let t,s=0;";
const $ = (dim) => distSq.add(dim, compile(dim, tpl, "a,b", undefined, "s", "", pre));
const distSq = vop();
distSq.default(compileG(tpl, "a,b", undefined, "s", pre));
$(2);
const distSq3 = $(3);
$(4);

const dist3 = (a, b) => Math.sqrt(distSq3(a, b));

export { add3 as a, mulN as b, clampN3 as c, dist3 as d, set as e, mulN2 as f, mulN4 as g, add4 as h, mulN3 as m, set3 as s };
//# sourceMappingURL=dist-ee9b3aef.js.map
