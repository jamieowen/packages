export { c as compileProgramAst, i as gpgpuFragmentBase, f as gpgpuQuadVertexShader, g as gpgpuSetup, h as gpgpuTriangleVertexShader, j as gpgpuWriteOperation, b as linesFragmentShader, l as linesVertexShader, p as particleLinesProgram, a as particlePointsProgram, e as pointsFragmentShader, d as pointsVertexShader } from '../common/ast-compile-helpers-350d4721.js';
import { i as ifThen } from '../common/controlflow-d41082a2.js';
import { a as assign, b as add, n as gt, m as mul, h as $x, g as $y, o as $z, i as $w, k as $xyz, s as sub } from '../common/math-9c107e9c.js';
import { f as float, s as sym, h as vec3, u as uniform, i as input } from '../common/item-bc8a12c1.js';
import { c as curlNoise3 } from '../common/curl3-76240b6b.js';
import { t as texture } from '../common/texture-9eea8e8b.js';
import '../common/target-220e3a94.js';
import '../common/logger-b7639346.js';
import '../common/unsupported-608d53c8.js';
import '../common/deferror-99934d1f.js';
import '../common/illegal-arguments-07fc2d96.js';
import '../common/is-boolean-04a49a85.js';
import '../common/assert-cf4243e4.js';
import '../common/_node-resolve_empty-7606bff8.js';
import '../common/map-3e2f222d.js';
import '../common/is-node-aee4b371.js';
import '../common/filter-44dab916.js';
import '../common/is-array-065cc62f.js';
import '../common/is-plain-object-7a83b681.js';

/**
 *
 * Advance age by decay amount, by assigning
 * decay + age to age symbol.
 *
 * Once age > 1.0, reset age to 0.0 and apply
 * dead terms.
 *
 * @param age
 * @param decay
 * @param dead
 */
const advanceAgeByDecay = (age, decay, dead) => {
    return ifThen(gt(age, float(1.0)), [assign(age, float(0.0)), ...dead], [assign(age, add(age, decay))]);
};
/**
 *
 * Same as @see advanceAgeByDecay(),
 * but assign an emitter term to
 * the position.
 *
 * @param age
 * @param decay
 * @param emitter
 */
const advanceAgeByDecayEmit = (age, decay, position, emitter) => advanceAgeByDecay(age, decay, [assign(position, emitter)]);

/**
 *
 * Accumulates provided forces.
 * This is an 'inline' approach without using glsl functions.
 *
 * @example
 * // glsl output
 * vec3 transformP = position;
 * vec3 transformV = velocity;
 * transformV = transformV + vec3(0.0,0.23,0.0);
 * transformV = transformV + curlNoise(position,0.3);
 * // etc ( per force )
 *
 * transformP = position + velocity;
 * // cap velocity speed.
 *
 *
 * @param position
 * @param velocity
 * @param mass
 * @param age
 * @param forces
 */
const accumulateForces = (position, velocity, mass, age, forces) => {
    const transformP = sym(position);
    const transformV = sym(vec3(0.0));
    // const transformV = sym(velocity); // TODO
    return [
        transformP,
        transformV,
        ...forces.map((f) => assign(transformV, add(transformV, f(position, velocity, mass, age)))),
        assign(transformP, add(position, transformV)),
        // temp ts fix??
    ];
};
// From Previous
// Including velocity? - needs capping and resetting at emission point
// const transformed = sym(
//   add(position, add(velocity, add(gravity, mul(curl, vec3(curlScale)))))
// );
// No Velocity
// const transformed = sym(
//   add(position, add(gravity, mul(curl, curlScale)))
// );
const gravity = (constant) => {
    return (position) => {
        // don't return a sym term here. Probably to map cat
        return constant;
    };
};
const curlPosition = (scale, input) => {
    return (position) => {
        return mul(scale, curlNoise3(position, input));
    };
};

/**
 * Given a basic 'constants' texture ( RGBA ), and presuming
 * that r & g are mass and decay. the other two
 */
const readConstants = (v_Uv) => {
    // Decl
    const u_constants = uniform("sampler2D", "constants");
    // Main
    const con = sym(texture(u_constants, v_Uv));
    const mass = sym($x(con));
    const decay = sym($y(con));
    const opt1 = sym($z(con));
    const opt2 = sym($w(con));
    return {
        decl: [u_constants],
        main: [con, mass, decay, opt1, opt2],
    };
};

/**
 *
 * @description
 *
 * Declare setup for 2 state values,
 * read them in a
 *
 * @example
 *
 * const read = readState2();
 * return program([
 *  ...read.decl,
 *  defMain(()=>[
 *    ...read.main
 *  ])
 * ])
 */
const readState2 = () => {
    // Decl
    const uni_state1 = uniform("sampler2D", "state_1");
    const uni_state2 = uniform("sampler2D", "state_2");
    const input_vUv = input("vec2", "vReadUV"); // TODO: Rename vReadUV - vUv
    // Main
    const s1 = sym(texture(uni_state1, input_vUv));
    const s2 = sym(texture(uni_state2, input_vUv));
    const position = sym($xyz(s1));
    // const velocity = sym(sub($xyz(s2), $xyz(s1)));
    const velocity = sym(sub($xyz(s1), $xyz(s2)));
    const age = sym($w(s1));
    return {
        // Enforce types.
        // Typescript seems to only apply a union / or type on array contents ( not order )
        decl: [uni_state1, uni_state2, input_vUv],
        main: [s1, s2, position, velocity, age],
    };
};
// ++ readState1

export { accumulateForces, advanceAgeByDecay, advanceAgeByDecayEmit, curlPosition, gravity, readConstants, readState2 };
//# sourceMappingURL=webgl.js.map
