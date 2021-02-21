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
  float,
} from "@thi.ng/shader-ast";
import { GLSLTarget } from "@thi.ng/shader-ast-glsl";
import { ProgramAst } from "../ast-compile-helpers";

export const pointsVertexShader = (target: GLSLTarget) => {
  const projectionMatrix = uniform("mat4", "projectionMatrix");
  const modelViewMatrix = uniform("mat4", "modelViewMatrix");
  const resolution = uniform("vec2", "resolution");
  const state_1 = uniform("sampler2D", "state_1");
  const point_size = uniform("float", "point_size");

  // Attributes
  const position = input("vec3", "position");
  const offset = input("float", "offset");

  // Read Values
  const uv = sym(
    div(
      vec2(div(offset, $x(resolution)), mod(offset, $y(resolution))),
      resolution
    )
  );
  const readState = sym(texture(state_1, uv));
  const pos = $xyz(readState);
  const age = $w(readState);

  return program([
    // Uniforms
    projectionMatrix,
    modelViewMatrix,
    state_1,
    point_size,
    resolution,
    // Attributes
    position,
    offset,
    // Main
    defMain(() => [
      uv,
      readState,
      assign(target.gl_PointSize, point_size),
      assign(
        target.gl_Position,
        mul(projectionMatrix, mul(modelViewMatrix, vec4(pos, 1.0)))
      ),
    ]),
  ]);
};

export const pointsFragmentShader = (target: GLSLTarget) => {
  return program([
    defMain(() => [assign(target.gl_FragColor, vec4(1.0, 1.0, 1.0, 1.0))]),
  ]);
};

export const particlePointsProgram = (): ProgramAst => {
  return {
    vertexShader: pointsVertexShader,
    fragmentShader: pointsFragmentShader,
  };
};
