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
  const u_state1 = uniform("sampler2D", "state_1");
  const u_state2 = uniform("sampler2D", "state_2");
  const v_vUv = input("vec2", "vReadUV"); // TODO: Rename vReadUV - vUv

  // Main
  const s1 = sym(texture(u_state1, v_vUv));
  const s2 = sym(texture(u_state2, v_vUv));

  const position = sym($xyz(s1));
  const velocity = sym(sub($xyz(s2), $xyz(s1)));
  const age = sym($w(s1));

  return {
    decl: [u_state1, u_state2, v_vUv],
    main: [s1, s2, position, velocity, age],
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
