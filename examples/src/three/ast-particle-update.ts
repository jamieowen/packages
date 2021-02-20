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
} from "@thi.ng/shader-ast";

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
  const velocity = sym(sub($xyz(s2), $xyz(s1)));
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
    decl: [u_constants],
    main: [con, mass, decay, opt1, opt2],
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

export const astParticleLib = {
  readState2,
  readConstants,
};
