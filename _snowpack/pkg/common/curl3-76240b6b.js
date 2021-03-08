import { r as defn, t as ret, e as mod, m as mul, b as add, f as floor, u as dot, s as sub, j as step, v as $, w as min, x as max, a as assign, h as $x, o as $z, g as $y, y as abs, z as neg, $ as $xy, i as $w, c as div } from './math-9c107e9c.js';
import { f as float, F as FLOAT1, s as sym, h as vec3, j as FLOAT05, v as vec4, k as FLOAT0, l as FLOAT2, a as vec2 } from './item-bc8a12c1.js';

const __permute = (type, suffix = "") => defn(type, `permute${suffix}`, [type], (v) => [
    ret(mod(mul(v, add(mul(v, float(34)), FLOAT1)), float(289))),
]);
__permute("float");
__permute("vec2", "2");
__permute("vec3", "3");
const permute4 = __permute("vec4", "4");

const snoise3 = defn("float", "snoise3", ["vec3"], (v) => {
    let g;
    let j;
    let l;
    let m;
    let p;
    let norm;
    let _x;
    let x;
    let y;
    let h;
    let sh;
    let a0;
    let a1;
    let b0;
    let b1;
    let x0;
    let x1;
    let x2;
    let x3;
    let p0;
    let p1;
    let p2;
    let p3;
    let i;
    let i1;
    let i2;
    const NS = 1 / 7;
    const NSX = NS * 2;
    const NSY = NS * 0.5 - 1;
    return [
        (i = sym(floor(add(v, dot(v, vec3(1 / 3)))))),
        (x0 = sym(add(sub(v, i), dot(i, vec3(1 / 6))))),
        (g = sym(step($(x0, "yzx"), x0))),
        (l = sym($(sub(FLOAT1, g), "zxy"))),
        (i1 = sym(min(g, l))),
        (i2 = sym(max(g, l))),
        (x1 = sym(add(sub(x0, i1), 1 / 6))),
        (x2 = sym(add(sub(x0, i2), 1 / 3))),
        (x3 = sym(sub(x0, FLOAT05))),
        assign(i, mod(i, float(289))),
        (p = sym(permute4(add(permute4(add(permute4(add(vec4(FLOAT0, $z(i1), $z(i2), FLOAT1), $z(i))), add(vec4(FLOAT0, $y(i1), $y(i2), FLOAT1), $y(i)))), add(vec4(FLOAT0, $x(i1), $x(i2), FLOAT1), $x(i)))))),
        (j = sym(sub(p, mul(floor(mul(p, NS * NS)), 49)))),
        (_x = sym(floor(mul(j, NS)))),
        (x = sym(add(mul(_x, NSX), NSY))),
        (y = sym(add(mul(floor(sub(j, mul(_x, 7))), NSX), NSY))),
        (h = sym(sub(sub(FLOAT1, abs(x)), abs(y)))),
        (sh = sym(neg(step(h, vec4())))),
        (b0 = sym(vec4($xy(x), $xy(y)))),
        (b1 = sym(vec4($(x, "zw"), $(y, "zw")))),
        (a0 = sym(add($(b0, "xzyw"), mul($(add(mul(floor(b0), FLOAT2), FLOAT1), "xzyw"), $(sh, "xxyy"))))),
        (a1 = sym(add($(b1, "xzyw"), mul($(add(mul(floor(b1), FLOAT2), FLOAT1), "xzyw"), $(sh, "zzww"))))),
        (p0 = sym(vec3($xy(a0), $x(h)))),
        (p1 = sym(vec3($(a0, "zw"), $y(h)))),
        (p2 = sym(vec3($xy(a1), $z(h)))),
        (p3 = sym(vec3($(a1, "zw"), $w(h)))),
        (norm = sym(sub(1.79284291400159, mul(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)), 0.85373472095314)))),
        assign(p0, mul(p0, $x(norm))),
        assign(p1, mul(p1, $y(norm))),
        assign(p2, mul(p2, $z(norm))),
        assign(p3, mul(p3, $w(norm))),
        (m = sym(max(vec4(), sub(0.6, vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)))))),
        assign(m, mul(m, m)),
        ret(mul(42, dot(mul(m, m), vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3))))),
    ];
});
const snoiseVec3 = defn("vec3", "snoiseVec3", ["vec3"], (p) => {
    return [
        ret(vec3(snoise3(p), snoise3(vec3(sub($y(p), 19.1), add($z(p), 33.4), add($x(p), 47.2))), snoise3(vec3(add($z(p), 74.2), sub($x(p), 124.5), add($y(p), 99.4))))),
    ];
});

const curlNoise3 = defn("vec3", "curlNoise3", ["vec3", "float"], (p, e) => {
    let D;
    let px0;
    let px1;
    let py0;
    let py1;
    let pz0;
    let pz1;
    return [
        (D = sym(vec2(e, 0))),
        (px0 = sym(snoiseVec3(sub(p, $(D, "xyy"))))),
        (px1 = sym(snoiseVec3(add(p, $(D, "xyy"))))),
        (py0 = sym(snoiseVec3(sub(p, $(D, "yxy"))))),
        (py1 = sym(snoiseVec3(add(p, $(D, "yxy"))))),
        (pz0 = sym(snoiseVec3(sub(p, $(D, "yyx"))))),
        (pz1 = sym(snoiseVec3(add(p, $(D, "yyx"))))),
        ret(div(vec3(add(sub(sub($z(py1), $z(py0)), $y(pz1)), $y(pz0)), add(sub(sub($x(pz1), $x(pz0)), $z(px1)), $z(px0)), add(sub(sub($y(px1), $y(px0)), $x(py1)), $x(py0))), mul(2, e))),
    ];
});

export { curlNoise3 as c, snoiseVec3 as s };
//# sourceMappingURL=curl3-76240b6b.js.map
