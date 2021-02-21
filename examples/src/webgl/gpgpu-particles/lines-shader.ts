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
} from "@thi.ng/shader-ast";
import { GLSLTarget } from "@thi.ng/shader-ast-glsl";
import { ProgramAst } from "../ast-compile-helpers";

/**
 *
 * Shader for rendering particles as lines
 * based on the velocity of the particle.
 *
 * Velocity is calculated from the difference between
 * two position states.
 *
 * @param target
 */
export const linesVertexShader = (target: GLSLTarget) => {
  const projectionMatrix = uniform("mat4", "projectionMatrix");
  const modelViewMatrix = uniform("mat4", "modelViewMatrix");
  const resolution = uniform("vec2", "resolution");
  const state_1 = uniform("sampler2D", "state_1");
  const state_2 = uniform("sampler2D", "state_2");

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
    state_2,
    resolution,
    // Attributes
    position,
    offset,
    // Main
    defMain(() => [
      uv,
      readState,
      assign(
        target.gl_Position,
        mul(projectionMatrix, mul(modelViewMatrix, vec4(pos, 1.0)))
      ),
    ]),
  ]);
};

export const linesFragmentShader = (target: GLSLTarget) => {
  return program([
    defMain(() => [assign(target.gl_FragColor, vec4(1.0, 1.0, 1.0, 1.0))]),
  ]);
};

export const particleLinesProgram = (): ProgramAst => {
  return {
    vertexShader: linesVertexShader,
    fragmentShader: linesFragmentShader,
  };
};
