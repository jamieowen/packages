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
 * WIP ON EMITTER DEFINITION.
 *
 * This has parallels with forces as well.
 * The key question is are emitters and forces defined as
 * REAL glsl functions ( using defn ) OR as ast/ts functions
 * that are inlined when composed.
 *
 * + Both are ok
 * + Forces are currently using the inlined method
 * + Using defn would give greater seperation
 * + Both situations, however would need predfined/standard method signatures?
 * + Or perhaps, the force function should be defined as required. No complecting.
 * + And any emitter definition wrapper can be applied.
 *
 * e.g.
 *
 * const emitRandom = ( min:vec3, max:vec3, etc:any )=> vec3
 *
 * // using known particle attributes as standardised emitter args?
 * const emitterSignatured = ( position, age, decay, mass )=>{}
 *
 * STOP trying to shoehorn things into an interface.
 * Things can be redefined if needed, or different stages ( age check, accumulate, etc ) can
 * be interchanged.
 */

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

const ageDecay = (age: Sym<"float">, decay: Sym<"float">, emitter: Emitter) => {
  const check = ifThen(gt(age, float(1.0)), [], []);
};

/**
 * Emitter
 */
const emitRandom = defn("vec3", "emitRandom", ["vec3"], (position) => [
  ret(snoiseVec3(position)),
]);

/**
 * Emitters - return a new position.
 */
type Emitter = (position: Sym<"vec3">) => Vec3Term;

// Emitter is any defn defined function that returns a vec4 ( to overwrite the position )
type Emitter2 = TaggedFn1<any, "vec4">;

type EmitterFactory = (...any: any) => Emitter;
