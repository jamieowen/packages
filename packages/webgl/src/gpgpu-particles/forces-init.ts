import {
  assign,
  sym,
  Sym,
  Vec3Sym,
  FloatSym,
  Vec3Term,
  add,
  FloatTerm,
  vec3,
  mul,
} from "@thi.ng/shader-ast";
import { curlNoise3 } from "@thi.ng/shader-ast-stdlib";

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
) => Vec3Term;

// TODO: This is not corrent - perhaps get rid of?
// Arguments are not being resolved correctly,
type ForceFactory<T extends Array<T> = any[]> = (...any: T) => Force;

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
export const accumulateForces = (
  position: Vec3Sym,
  velocity: Vec3Sym,
  mass: FloatSym,
  age: FloatSym,
  forces: Force[]
) => {
  const transformP = sym(position);
  const transformV = sym(vec3(0.0));
  // const transformV = sym(velocity); // TODO
  return ([
    transformP,
    transformV,
    ...forces.map((f) =>
      assign(transformV, add(transformV, f(position, velocity, mass, age)))
    ),
    assign(transformP, add(position, transformV)),
    // temp ts fix??
  ] as unknown) as [transformedP: Sym<"vec3">, transformedV: Sym<"vec3">];
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

export const gravity: ForceFactory = (constant: Vec3Sym) => {
  return (position) => {
    // don't return a sym term here. Probably to map cat
    return constant;
  };
};

export const curlPosition: ForceFactory = (
  scale: FloatTerm,
  input: FloatTerm
) => {
  return (position) => {
    return mul(scale, curlNoise3(position, input));
  };
};
