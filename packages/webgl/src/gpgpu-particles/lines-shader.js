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
  sub,
  add,
  floor,
  float,
  output,
  step
} from "../../../../_snowpack/pkg/@thi.ng/shader-ast.js";
export const linesVertexShader = (target) => {
  const projectionMatrix = uniform("mat4", "projectionMatrix");
  const modelViewMatrix = uniform("mat4", "modelViewMatrix");
  const resolution = uniform("vec2", "resolution");
  const state_1 = uniform("sampler2D", "state_1");
  const state_2 = uniform("sampler2D", "state_2");
  const position = input("vec3", "position");
  const color = input("vec3", "color");
  const vColor = output("vec3", "vColor");
  const offset = input("float", "offset");
  const offset2 = floor(div(offset, 2));
  const uv = sym(div(vec2(div(offset2, $x(resolution)), mod(offset2, $y(resolution))), resolution));
  const readState1 = sym(texture(state_1, uv));
  const readState2 = sym(texture(state_2, uv));
  const stateDiff = sym(sub(readState2, readState1));
  const age1 = $w(readState1);
  const age2 = $w(readState2);
  const velCap = step(float(0), sub(age1, age2));
  const lineLen = mul(float(5), velCap);
  const vel = mul($xyz(stateDiff), lineLen);
  const pos = $xyz(readState1);
  const modOffset = mod(offset, float(2));
  const pos1 = add(pos, mul(vel, modOffset));
  return program([
    projectionMatrix,
    modelViewMatrix,
    state_1,
    state_2,
    resolution,
    position,
    offset,
    color,
    vColor,
    defMain(() => [
      uv,
      readState1,
      readState2,
      stateDiff,
      assign(vColor, color),
      assign(target.gl_Position, mul(projectionMatrix, mul(modelViewMatrix, vec4(pos1, 1))))
    ])
  ]);
};
export const linesFragmentShader = (target) => {
  let vColor;
  return program([
    vColor = input("vec3", "vColor", {prec: "highp"}),
    defMain(() => [assign(target.gl_FragColor, vec4(vColor, 1))])
  ]);
};
export const particleLinesProgram = () => {
  return {
    vertexShader: linesVertexShader,
    fragmentShader: linesFragmentShader
  };
};
//# sourceMappingURL=lines-shader.js.map
