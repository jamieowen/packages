import {
  BufferAttribute,
  BufferGeometry,
  Points,
  RawShaderMaterial,
  Vector2,
} from "three";
import { compileProgramAst, particlePointsProgram } from "@jamieowen/webgl";
import { GPGPUState } from "../gpgpu";

const particleStatePointsMaterial = (addColor: boolean) => {
  const { fragmentSource, vertexSource } = compileProgramAst(
    particlePointsProgram()
  );
  const material = new RawShaderMaterial({
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
const particleStatePointsGeometry = (count: number, color: BufferAttribute) => {
  const geometry = new BufferGeometry();
  const position = new BufferAttribute(new Float32Array(count * 3).fill(0), 3);

  const offset = new BufferAttribute(
    new Float32Array(new Array(count).fill(0).map((_v, i) => i)),
    1
  );
  geometry.setAttribute("position", position);
  geometry.setAttribute("offset", offset);

  if (color) {
    geometry.setAttribute("color", color);
  }

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
  constructor(count: number, state: GPGPUState, color: BufferAttribute) {
    super(
      particleStatePointsGeometry(count, color),
      particleStatePointsMaterial(null)
    );
    this.state = state;
  }
  onBeforeRender = () => {
    const material = this.material as RawShaderMaterial;
    material.uniforms.state_1.value = this.state.preview.texture;
    material.uniforms.resolution.value.x = this.state.setup.width;
    material.uniforms.resolution.value.y = this.state.setup.height;
  };
}

export const createParticleStatePoints = (
  count: number,
  state: GPGPUState,
  color: BufferAttribute
) => {
  return new ParticleStatePoints(count, state, color);
};
