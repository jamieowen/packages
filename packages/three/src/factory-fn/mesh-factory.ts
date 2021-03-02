import { createGeometryFactory } from "./geometries";
import { GeometryAlignment, GeometryFactory } from "../geometry";
import {
  Mesh,
  BufferGeometry,
  MeshBasicMaterial,
  MeshStandardMaterial,
  MeshBasicMaterialParameters,
  MeshStandardMaterialParameters,
  Object3D,
  Vector3,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshPhongMaterialParameters,
  MeshLambertMaterialParameters,
} from "three";

type MaterialParamType =
  | MeshBasicMaterialParameters
  | MeshStandardMaterialParameters;

type MaterialClass<T> = new (...args: any[]) => T;

type MaterialClassType =
  | MaterialClass<MeshBasicMaterial>
  | MaterialClass<MeshStandardMaterial>;

export class MeshFactory {
  nextMaterialParams: MaterialParamType;
  nextMaterialClass: MaterialClassType;
  nextGeometry: BufferGeometry;
  geometryFactory: GeometryFactory = createGeometryFactory();
  scale: Vector3 = new Vector3(1, 1, 1);

  constructor() {
    this.setMaterial(
      {
        color: "white",
      },
      MeshBasicMaterial
    );
    this.sphere();
  }

  setGeometry(geometry: BufferGeometry) {
    this.nextGeometry = geometry;
  }

  plane(align?: GeometryAlignment) {
    this.setGeometry(this.geometryFactory.create("plane", align));
  }

  sphere(align?: GeometryAlignment) {
    this.setGeometry(this.geometryFactory.create("sphere", align));
  }

  box(align?: GeometryAlignment) {
    this.setGeometry(this.geometryFactory.create("box", align));
  }

  setMaterial(params: MaterialParamType, cls: MaterialClassType) {
    this.nextMaterialParams = params;
    this.nextMaterialClass = cls;
  }

  basicMaterial(params: MeshBasicMaterialParameters) {
    this.setMaterial(params, MeshBasicMaterial);
  }

  lambertMaterial(params: MeshLambertMaterialParameters) {
    this.setMaterial(params, MeshLambertMaterial);
  }

  phongMaterial(params: MeshPhongMaterialParameters) {
    this.setMaterial(params, MeshPhongMaterial);
  }

  standardMaterial(params: MeshStandardMaterialParameters) {
    this.setMaterial(params, MeshStandardMaterial);
  }

  mesh(parent?: Object3D) {
    const mesh = new Mesh(
      this.nextGeometry,
      new this.nextMaterialClass(this.nextMaterialParams)
    );
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
