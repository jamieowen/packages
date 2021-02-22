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
  const outColor = output("vec4", "outColor");

  // Attributes
  const position = input("vec3", "position");

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
  const vel = mul($xyz(stateDiff), float(4.0)); //
  // const vel = vec3(0.5);
  const pos = $xyz(readState1);
  const modOffset = mod(offset, float(2.0));
  const pos2 = add(pos, float(2.0));
  const pos1 = add(pos, mul(vel, modOffset)); // mod the offset and add the velocity on alternating indices.

  // const line
  const age = $w(readState1);

  return program([
    // Uniforms
    projectionMatrix,
    modelViewMatrix,
    state_1,
    state_2,
    outColor,
    resolution,
    // Attributes
    position,
    offset,
    // Main
    defMain(() => [
      uv,
      readState1,
      readState2,
      stateDiff,
      // assign(outColor, vec4(1.0, modOffset, 1.0, 1.0)),
      assign(outColor, vec4(1.0, 1.0, 1.0, 1.0)),
      assign(target.gl_PointSize, float(16.0)),
      assign(
        target.gl_Position,
        mul(projectionMatrix, mul(modelViewMatrix, vec4(pos1, 1.0)))
      ),
    ]),
  ]);
};

export const linesFragmentShader = (target: GLSLTarget) => {
  let outcolor;
  return program([
    (outcolor = input("vec4", "outColor", { prec: "highp" })),
    defMain(() => [assign(target.gl_FragColor, vec4($xyz(outcolor), 1.0))]),
  ]);
};

export const particleLinesProgram = (): ProgramAst => {
  return {
    vertexShader: linesVertexShader,
    fragmentShader: linesFragmentShader,
  };
};
