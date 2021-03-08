import {
  InstancedMesh,
  Object3D
} from "../../../../_snowpack/pkg/three.js";
export const createInstancedMesh = (geometry, material, count) => {
  return new InstancedMesh(geometry, material, count);
};
export const instancedMeshIterator = (mesh) => {
  const tmp = new Object3D();
  return (fn) => {
    for (let i = 0; i < mesh.count; i++) {
      tmp.rotation.set(0, 0, 0);
      tmp.position.set(0, 0, 0);
      tmp.scale.set(1, 1, 1);
      fn(i, tmp.position, tmp.scale, tmp.rotation);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };
};
//# sourceMappingURL=instancing.js.map
