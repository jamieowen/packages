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
  texture,
} from "@thi.ng/shader-ast";
import { GLSLTarget } from "@thi.ng/shader-ast-glsl";

/**
 *
 * Render a quad style geometry and
 * generate UV for GPGPU texture read.
 *
 * @param target
 */
export const gpgpuQuadVertexShader = (target: GLSLTarget) => {
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
      assign(
        target.gl_Position,
        mul(projectionMatrix, mul(modelViewMatrix, vec4(position, 1.0)))
      ),
    ]),
  ]);
};

/**
 *
 * Render 'big triangle' style geometry and
 * generate UV for GPGPU texture read.
 *
 * @param target
 */
export const gpgpuTriangleVertexShader = (target: GLSLTarget) => {
  const position = input("vec3", "position");
  const vReadUV = output("vec2", "vReadUV");
  return program([
    position,
    vReadUV,
    defMain(() => [
      assign(vReadUV, mul(0.5, add($xy(position), 1.0))),
      assign(target.gl_Position, vec4(position, 1.0)),
    ]),
  ]);
};

/**
 * UNUSED.
 * WIP for base update shader.
 * @param target
 */
export const gpgpuFragmentBase = (target: GLSLTarget) => {
  const previous = uniform("sampler2D", "previous");
  const current = uniform("sampler2D", "current");
  const vReadUV = input("vec2", "vReadUV");
  return program([previous, current, vReadUV, defMain(() => [])]);
};

/**
 *
 * Writes an input texture or data texture
 * directly to the output buffer.
 *
 * @param target
 *
 */
export const gpgpuWriteOperation = (target: GLSLTarget) => {
  const currentIn = uniform("sampler2D", "inputSource");
  const vReadUV = input("vec2", "vReadUV");
  const current = sym(texture(currentIn, vReadUV));
  return program([
    currentIn,
    vReadUV,
    defMain(() => [current, assign(target.gl_FragColor, current)]),
  ]);
};
