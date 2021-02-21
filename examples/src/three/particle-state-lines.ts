import {
  BufferAttribute,
  BufferGeometry,
  LineSegments,
  RawShaderMaterial,
  Vector2,
} from "three";
import { particleLinesProgram } from "../webgl/gpgpu-particles";
import { compileProgramAst } from "../webgl/ast-compile-helpers";
import { GPGPUState } from "@jamieowen/three";

const particleStateLinesMaterial = () => {
  const { fragmentSource, vertexSource } = compileProgramAst(
    particleLinesProgram()
  );
  const material = new RawShaderMaterial({
    vertexColors: false, // later
    vertexShader: vertexSource,
    fragmentShader: fragmentSource,
  });
  material.uniforms["state_1"] = { value: null };
  material.uniforms["state_2"] = { value: null };
  material.uniforms["resolution"] = { value: new Vector2() };
  return material;
};

/**
 *
 * Particle State.
 * Lines Geometry.
 *
 * Double up the number of positions, and repeat the offset twice.
 *
 */
const particleStateLinesGeometry = (count: number) => {
  const geometry = new BufferGeometry();
  const position = new BufferAttribute(
    new Float32Array(count * 3 * 2).fill(0),
    3
  );

  const offset = new BufferAttribute(
    new Float32Array(new Array(count * 2).fill(0).map((_v, i) => i % count)),
    1
  );
  geometry.setAttribute("position", position);
  geometry.setAttribute("offset", offset);

  return geometry;
};

/**
 *
 * Particle State.
 * Lines Rendering.
 *
 */
export class ParticleStateLineSegments extends LineSegments {
  state: GPGPUState;
  constructor(count: number, state: GPGPUState) {
    super(particleStateLinesGeometry(count), particleStateLinesMaterial());
    this.state = state;
    if (this.state.states.length < 3) {
      throw new Error(
        "Lines segment renderer needs an additional state[2] to render."
      );
    }
  }
  onBeforeRender = () => {
    const material = this.material as RawShaderMaterial;
    material.uniforms.state_1.value = this.state.preview.texture;
    material.uniforms.state_2.value = this.state.states[2].texture;
    material.uniforms.resolution.value.x = this.state.setup.width;
    material.uniforms.resolution.value.y = this.state.setup.height;
  };
}

export const createParticleStateLineSegments = (
  count: number,
  state: GPGPUState
) => {
  return new ParticleStateLineSegments(count, state);
};
