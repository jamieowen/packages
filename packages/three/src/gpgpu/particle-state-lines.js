import {
  BufferAttribute,
  BufferGeometry,
  LineSegments,
  RawShaderMaterial,
  Vector2
} from "../../../../_snowpack/pkg/three.js";
import {compileProgramAst, particleLinesProgram} from "../../../../_snowpack/pkg/@jamieowen/webgl.js";
const particleStateLinesMaterial = () => {
  const {fragmentSource, vertexSource} = compileProgramAst(particleLinesProgram());
  const material = new RawShaderMaterial({
    vertexShader: vertexSource,
    fragmentShader: fragmentSource,
    linewidth: 2
  });
  material.uniforms["state_1"] = {value: null};
  material.uniforms["state_2"] = {value: null};
  material.uniforms["resolution"] = {value: new Vector2()};
  return material;
};
const particleStateLinesGeometry = (count, color) => {
  const geometry = new BufferGeometry();
  const position = new BufferAttribute(new Float32Array(count * 3 * 2).fill(0), 3);
  const offset = new BufferAttribute(new Float32Array(new Array(count * 2).fill(0).map((_v, i) => i)), 1);
  geometry.setAttribute("position", position);
  geometry.setAttribute("offset", offset);
  if (color) {
    geometry.setAttribute("color", color);
  }
  return geometry;
};
export class ParticleStateLineSegments extends LineSegments {
  constructor(count, state, color) {
    super(particleStateLinesGeometry(count, color), particleStateLinesMaterial());
    this.onBeforeRender = () => {
      const material = this.material;
      material.uniforms.state_1.value = this.state.preview.texture;
      material.uniforms.state_2.value = this.state.states[2].texture;
      material.uniforms.resolution.value.x = this.state.setup.width;
      material.uniforms.resolution.value.y = this.state.setup.height;
    };
    this.state = state;
    if (this.state.states.length < 3) {
      throw new Error("Lines segment renderer needs an additional state[2] to render.");
    }
  }
}
export const createParticleStateLineSegments = (count, state, color) => {
  return new ParticleStateLineSegments(count, state, color);
};
//# sourceMappingURL=particle-state-lines.js.map
