import {
  assign,
  defMain,
  input,
  program,
  uniform,
  mul,
  vec4,
  add,
  output,
  $xy,
  sym,
  texture
} from "../../../../_snowpack/pkg/@thi.ng/shader-ast.js";
export const gpgpuQuadVertexShader = (target) => {
  const modelViewMatrix = uniform("mat4", "modelViewMatrix", {});
  const projectionMatrix = uniform("mat4", "projectionMatrix");
  const position = input("vec3", "position");
  const vReadUV = output("vec2", "vReadUV");
  return program([
    modelViewMatrix,
    projectionMatrix,
    position,
    vReadUV,
    defMain(() => [
      assign(vReadUV, add($xy(position), 0.5)),
      assign(target.gl_Position, mul(projectionMatrix, mul(modelViewMatrix, vec4(position, 1))))
    ])
  ]);
};
export const gpgpuTriangleVertexShader = (target) => {
  const position = input("vec3", "position");
  const vReadUV = output("vec2", "vReadUV");
  return program([
    position,
    vReadUV,
    defMain(() => [
      assign(vReadUV, mul(0.5, add($xy(position), 1))),
      assign(target.gl_Position, vec4(position, 1))
    ])
  ]);
};
export const gpgpuFragmentBase = (target) => {
  const previous = uniform("sampler2D", "previous");
  const current = uniform("sampler2D", "current");
  const vReadUV = input("vec2", "vReadUV");
  return program([previous, current, vReadUV, defMain(() => [])]);
};
export const gpgpuWriteOperation = (target) => {
  const currentIn = uniform("sampler2D", "inputSource");
  const vReadUV = input("vec2", "vReadUV");
  const current = sym(texture(currentIn, vReadUV));
  return program([
    currentIn,
    vReadUV,
    defMain(() => [current, assign(target.gl_FragColor, current)])
  ]);
};
//# sourceMappingURL=full-screen-read.js.map
