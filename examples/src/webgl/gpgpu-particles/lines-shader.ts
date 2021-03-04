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
  int,
  vec3,
  output,
  ifThen,
  gt,
  discard,
  step,
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
  const color = input("vec3", "color");
  const vColor = output("vec3", "vColor");

  // Offsets span from 0 to count * 2.
  // From this, the line segment start and end is determined by offset % 2
  // And the offset for reading from the texture is offset / 2
  const offset = input("float", "offset");
  const offset2 = floor(div(offset, 2.0));
  // Read Values
  const uv = sym(
    div(
      vec2(div(offset2, $x(resolution)), mod(offset2, $y(resolution))),
      resolution
    )
  );
  const readState1 = sym(texture(state_1, uv));
  const readState2 = sym(texture(state_2, uv));
  const stateDiff = sym(sub(readState2, readState1));

  // Line/Velocity length
  // Ensure age2 < age1 always. Otherwise lines
  // flicker when resetting age between states.
  const age1 = $w(readState1);
  const age2 = $w(readState2);
  const velCap = step(float(0), sub(age1, age2)); // cap velocity
  const lineLen = mul(float(5.0), velCap); // multiply by line length, unless age2 > age 1
  const vel = mul($xyz(stateDiff), lineLen); // apply

  const pos = $xyz(readState1);
  const modOffset = mod(offset, float(2.0));
  const pos1 = add(pos, mul(vel, modOffset)); // mod the offset and add the velocity on alternating indices.

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
    color,
    vColor,
    // Main
    defMain(() => [
      uv,
      readState1,
      readState2,
      stateDiff,
      assign(vColor, color),
      // assign(vColor, vec3(0.7)),
      assign(
        target.gl_Position,
        mul(projectionMatrix, mul(modelViewMatrix, vec4(pos1, 1.0)))
      ),
    ]),
  ]);
};

export const linesFragmentShader = (target: GLSLTarget) => {
  let vColor;
  return program([
    (vColor = input("vec3", "vColor", { prec: "highp" })),
    defMain(() => [assign(target.gl_FragColor, vec4(vColor, 1.0))]),
  ]);
};

export const particleLinesProgram = (): ProgramAst => {
  return {
    vertexShader: linesVertexShader,
    fragmentShader: linesFragmentShader,
  };
};
