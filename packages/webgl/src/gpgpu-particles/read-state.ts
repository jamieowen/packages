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
  Vec4Term,
  vec3,
  mul,
  ret,
  TaggedFn1,
} from "@thi.ng/shader-ast";
import { curlNoise3, snoiseVec3 } from "@thi.ng/shader-ast-stdlib";
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
export const readState2 = () => {
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
