import {
  BufferGeometry,
  Euler,
  InstancedMesh,
  Material,
  Object3D,
  Vector3,
} from "three";

export const createInstancedMesh = (
  geometry: BufferGeometry,
  material: Material,
  count: number
) => {
  return new InstancedMesh(geometry, material, count);
};

export const instancedMeshIterator = (mesh: InstancedMesh) => {
  const tmp = new Object3D();
  return (
    fn: (
      idx: number,
      position: Vector3,
      scale: Vector3,
      rotation: Euler
    ) => void
  ) => {
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
