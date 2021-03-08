import {
  program,
  defMain,
  uniform,
  assign,
  mul,
  vec4,
  input,
  sym,
  vec2,
  div,
  $x,
  mod,
  $y,
  texture,
  $xyz,
  $w,
  output
} from "../../../../_snowpack/pkg/@thi.ng/shader-ast.js";
export const pointsVertexShader = (target) => {
  const projectionMatrix = uniform("mat4", "projectionMatrix");
  const modelViewMatrix = uniform("mat4", "modelViewMatrix");
  const resolution = uniform("vec2", "resolution");
  const state_1 = uniform("sampler2D", "state_1");
  const point_size = uniform("float", "point_size");
  const position = input("vec3", "position");
  const offset = input("float", "offset");
  const color = input("vec3", "color");
  const vColor = output("vec3", "vColor");
  const uv = sym(div(vec2(div(offset, $x(resolution)), mod(offset, $y(resolution))), resolution));
  const readState = sym(texture(state_1, uv));
  const pos = $xyz(readState);
  const age = $w(readState);
  return program([
    projectionMatrix,
    modelViewMatrix,
    state_1,
    point_size,
    resolution,
    position,
    offset,
    color,
    vColor,
    defMain(() => [
      uv,
      readState,
      assign(target.gl_PointSize, point_size),
      assign(vColor, color),
      assign(target.gl_Position, mul(projectionMatrix, mul(modelViewMatrix, vec4(pos, 1))))
    ])
  ]);
};
export const pointsFragmentShader = (target) => {
  const vColor = input("vec3", "vColor", {prec: "highp"});
  return program([
    vColor,
    defMain(() => [assign(target.gl_FragColor, vec4(vColor, 1))])
  ]);
};
export const particlePointsProgram = () => {
  return {
    vertexShader: pointsVertexShader,
    fragmentShader: pointsFragmentShader
  };
};
//# sourceMappingURL=points-shader.js.map
