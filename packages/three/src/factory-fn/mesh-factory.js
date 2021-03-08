import {createGeometryFactory} from "./geometries.js";
import {
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Vector3,
  MeshLambertMaterial,
  MeshPhongMaterial
} from "../../../../_snowpack/pkg/three.js";
export class MeshFactory {
  constructor() {
    this.geometryFactory = createGeometryFactory();
    this.scale = new Vector3(1, 1, 1);
    this.setMaterial({
      color: "white"
    }, MeshBasicMaterial);
    this.sphere();
  }
  setGeometry(geometry) {
    this.nextGeometry = geometry;
  }
  plane(align) {
    this.setGeometry(this.geometryFactory.create("plane", align));
  }
  sphere(align) {
    this.setGeometry(this.geometryFactory.create("sphere", align));
  }
  box(align) {
    this.setGeometry(this.geometryFactory.create("box", align));
  }
  setMaterial(params, cls) {
    this.nextMaterialParams = params;
    this.nextMaterialClass = cls;
  }
  basicMaterial(params) {
    this.setMaterial(params, MeshBasicMaterial);
  }
  lambertMaterial(params) {
    this.setMaterial(params, MeshLambertMaterial);
  }
  phongMaterial(params) {
    this.setMaterial(params, MeshPhongMaterial);
  }
  standardMaterial(params) {
    this.setMaterial(params, MeshStandardMaterial);
  }
  mesh(parent) {
    const mesh = new Mesh(this.nextGeometry, new this.nextMaterialClass(this.nextMaterialParams));
    if (parent) {
      parent.add(mesh);
    }
    mesh.scale.copy(this.scale);
    return mesh;
  }
}
export const createMeshFactory = () => {
  return new MeshFactory();
};
//# sourceMappingURL=mesh-factory.js.map
