import { mapcat } from "@thi.ng/transducers";
import {
  uniform,
  input,
  assign,
  sym,
  sub,
  texture,
  $xyz,
  $x,
  $y,
  $z,
  $w,
  Sym,
  Term,
  ifThen,
  gt,
  float,
  Vec3Sym,
  FloatSym,
  Vec3Term,
  add,
  FloatTerm,
  defn,
} from "@thi.ng/shader-ast";
import { curlNoise3 } from "@thi.ng/shader-ast-stdlib";
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
    decl: [uni_state1, uni_state2, input_vUv] as [
      Sym<"sampler2D">,
      Sym<"sampler2D">,
      Sym<"vec2">
    ],
    main: [s1, s2, position, velocity, age] as [
      Sym<"vec4">,
      Sym<"vec4">,
      Sym<"vec3">,
      Sym<"vec3">,
      Sym<"float">
    ],
  };
};

// ++ readState1

/**
 * Given a basic 'constants' texture ( RGBA ), and presuming
 * that r & g are mass and decay. the other two
 */
const readConstants = (v_Uv: Sym<"vec2">) => {
  // Decl
  const u_constants = uniform("sampler2D", "constants");

  // Main
  const con = sym(texture(u_constants, v_Uv));
  const mass = sym($x(con));
  const decay = sym($y(con));
  const opt1 = sym($z(con));
  const opt2 = sym($w(con));

  return {
    decl: ([u_constants] as [Sym<"sampler2D">]) as [input: Sym<"sampler2D">],
    main: [con, mass, decay, opt1, opt2] as [
      constants: Sym<"vec4">,
      mass: Sym<"float">,
      decay: Sym<"float">,
      opt1: Sym<"float">,
      opt2: Sym<"float">
    ],
  };
};

// Some ideas for decay implemtation.
// Could also be a function? that returns new age?
const ageCheck = (
  age: Sym<"float">,
  decay: Sym<"float">,
  truthy: Term<any>[],
  falsey: Term<any>[] = []
) => {
  return {
    decl: [],
    main: [ifThen(gt(age, float(1.0)), truthy, falsey)],
  };
};

// discard vertex / fragment
const ageDecayDiscard = () => {};

/**
 * Forces
 */

/**
 *
 * Standard interface for a force.
 * Used by the accumulateForces
 *
 * Accepts some values and returns a force creation function.
 *
 */

type Force = (
  position: Vec3Sym,
  velocity: Vec3Sym,
  mass: FloatSym,
  age: FloatSym
) => Vec3Sym;

type ForceFactory = (...any: any) => Force;

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
const accumulateForces = (
  position: Vec3Sym,
  velocity: Vec3Sym,
  mass: FloatSym,
  age: FloatSym,
  forces: Force[]
) => {
  const transformP = sym(position);
  const transformV = sym(velocity);
  // let accum = [];
  // for (let i = 0; i < forces.length; i++) {
  //   const f = forces[i];
  //   accum = [
  //     ...accum,
  //     ...[assign(transformV, f(position, velocity, mass, age))],
  //   ];
  // }
  return [
    transformP,
    transformV,
    // ...accum,
    ...forces.map((f) => assign(transformV, f(position, velocity, mass, age))),
    assign(transformP, add(position, transformV)),
  ];
};

const gravity: ForceFactory = (constant: Vec3Term) => {
  return (position) => {
    return sym(add(position, constant));
  };
};

// const curlPosition: ForceFactory = (input: FloatTerm, scale: FloatTerm) => {
//   return (position) => {
//     return sym(add());
//   };
// };

export const astParticleLib = {
  readState2,
  readConstants,
  accumulateForces,
  gravity,
};
