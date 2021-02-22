import {
  BufferAttribute,
  BufferGeometry,
  Points,
  RawShaderMaterial,
  Vector2,
} from "three";
import { particlePointsProgram } from "../webgl/gpgpu-particles/points-shader";
import { compileProgramAst } from "../webgl/ast-compile-helpers";
import { GPGPUState } from "@jamieowen/three";

const particleStatePointsMaterial = () => {
  const { fragmentSource, vertexSource } = compileProgramAst(
    particlePointsProgram()
  );
  const material = new RawShaderMaterial({
    vertexColors: false, // later
    vertexShader: vertexSource,
    fragmentShader: fragmentSource,
  });
  material.uniforms["state_1"] = { value: null };
  material.uniforms["point_size"] = { value: 5.0 };
  material.uniforms["resolution"] = { value: new Vector2() };
  return material;
};

/**
 *
 * Particle State.
 * Points Geometry.
 *
 */
const particleStatePointsGeometry = (count: number) => {
  const geometry = new BufferGeometry();
  const position = new BufferAttribute(new Float32Array(count * 3).fill(0), 3);

  const offset = new BufferAttribute(
    new Float32Array(new Array(count).fill(0).map((_v, i) => i)),
    1
  );
  geometry.setAttribute("position", position);
  geometry.setAttribute("offset", offset);

  return geometry;
};

/**
 *
 * Particle State.
 * Points Rendering.
 *
 */
export class ParticleStatePoints extends Points {
  state: GPGPUState;
  constructor(count: number, state: GPGPUState) {
    super(particleStatePointsGeometry(count), particleStatePointsMaterial());
    this.state = state;
  }
  onBeforeRender = () => {
    const material = this.material as RawShaderMaterial;
    material.uniforms.state_1.value = this.state.preview.texture;
    material.uniforms.resolution.value.x = this.state.setup.width;
    material.uniforms.resolution.value.y = this.state.setup.height;
  };
}

export const createParticleStatePoints = (count: number, state: GPGPUState) => {
  return new ParticleStatePoints(count, state);
};
