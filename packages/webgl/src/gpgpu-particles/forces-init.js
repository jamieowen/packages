import {
  assign,
  sym,
  add,
  vec3,
  mul
} from "../../../../_snowpack/pkg/@thi.ng/shader-ast.js";
import {curlNoise3} from "../../../../_snowpack/pkg/@thi.ng/shader-ast-stdlib.js";
export const accumulateForces = (position, velocity, mass, age, forces) => {
  const transformP = sym(position);
  const transformV = sym(vec3(0));
  return [
    transformP,
    transformV,
    ...forces.map((f) => assign(transformV, add(transformV, f(position, velocity, mass, age)))),
    assign(transformP, add(position, transformV))
  ];
};
export const gravity = (constant) => {
  return (position) => {
    return constant;
  };
};
export const curlPosition = (scale, input) => {
  return (position) => {
    return mul(scale, curlNoise3(position, input));
  };
};
//# sourceMappingURL=forces-init.js.map
