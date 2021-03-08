import {
  BufferAttribute,
  BufferGeometry,
  Points,
  RawShaderMaterial,
  Vector2
} from "../../../../_snowpack/pkg/three.js";
import {compileProgramAst, particlePointsProgram} from "../../../../_snowpack/pkg/@jamieowen/webgl.js";
const particleStatePointsMaterial = (addColor) => {
  const {fragmentSource, vertexSource} = compileProgramAst(particlePointsProgram());
  const material = new RawShaderMaterial({
    vertexShader: vertexSource,
    fragmentShader: fragmentSource
  });
  material.uniforms["state_1"] = {value: null};
  material.uniforms["point_size"] = {value: 5};
  material.uniforms["resolution"] = {value: new Vector2()};
  return material;
};
const particleStatePointsGeometry = (count, color) => {
  const geometry = new BufferGeometry();
  const position = new BufferAttribute(new Float32Array(count * 3).fill(0), 3);
  const offset = new BufferAttribute(new Float32Array(new Array(count).fill(0).map((_v, i) => i)), 1);
  geometry.setAttribute("position", position);
  geometry.setAttribute("offset", offset);
  if (color) {
    geometry.setAttribute("color", color);
  }
  return geometry;
};
export class ParticleStatePoints extends Points {
  constructor(count, state, color) {
    super(particleStatePointsGeometry(count, color), particleStatePointsMaterial(null));
    this.onBeforeRender = () => {
      const material = this.material;
      material.uniforms.state_1.value = this.state.preview.texture;
      material.uniforms.resolution.value.x = this.state.setup.width;
      material.uniforms.resolution.value.y = this.state.setup.height;
    };
    this.state = state;
  }
}
export const createParticleStatePoints = (count, state, color) => {
  return new ParticleStatePoints(count, state, color);
};
//# sourceMappingURL=particle-state-points.js.map
