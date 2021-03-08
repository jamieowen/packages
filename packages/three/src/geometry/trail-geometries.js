import {BoxBufferGeometry, ConeBufferGeometry, Matrix4} from "../../../../_snowpack/pkg/three.js";
const FLIP = new Matrix4().makeRotationZ(Math.PI);
export const trailConeGeometry = () => {
  const cone = new ConeBufferGeometry(1, 1, 6, 1);
  cone.applyMatrix4(FLIP);
  return cone;
};
export const trailBoxGeometry = () => {
  const box = new BoxBufferGeometry(1, 1, 1, 1, 1, 1);
  box.applyMatrix4(FLIP);
  return box;
};
//# sourceMappingURL=trail-geometries.js.map
