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
 * Given a basic 'constants' texture ( RGBA ), and presuming
 * that r & g are mass and decay. the other two
 */
export const readConstants = (v_Uv: Sym<"vec2">) => {
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
