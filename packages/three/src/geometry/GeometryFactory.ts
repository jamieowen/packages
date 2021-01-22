import { Fn0 } from "@thi.ng/api";
import { memoize1 } from "@thi.ng/memoize";
import { BufferGeometry, Matrix4, Vector3 } from "three";

export enum GeometryAlignment {
  CENTER = "center",
  BOTTOM = "bottom",
  TOP = "top",
  LEFT = "left",
  RIGHT = "right",
  FRONT = "front",
  BACK = "back",
}

export type GeometryId = "plane" | "sphere" | "box" | "circle";

type FactoryFn = Fn0<BufferGeometry>;
type Factory = {
  handle: boolean;
  create: FactoryFn;
};

export class GeometryFactory<T = GeometryId> {
  map: Map<T, Factory> = new Map();

  register(id: T, create: FactoryFn) {
    const createForAlignment = memoize1<GeometryAlignment, BufferGeometry>(
      (alignment) => {
        const geom = create();
        return alignGeometry[alignment](geom);
      }
    );
    const alignments = Object.values(GeometryAlignment);
    alignments.forEach((align) => {
      const lookup = this.getID(id, align);
      this.map.set(lookup as any, {
        handle: false,
        create: () => createForAlignment(align),
      });
    });
  }

  private getID(id: T, alignment: GeometryAlignment) {
    return [id, alignment].join("/");
  }

  create(
    id: T,
    alignment: GeometryAlignment = GeometryAlignment.CENTER
  ): BufferGeometry {
    const lookup = this.getID(id, alignment);
    return this.map.get(lookup as any).create();
  }
}

type ApplyGeometryAlignment = (geometry: BufferGeometry) => BufferGeometry;

const boundingBox = (geometry: BufferGeometry) => {
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }
  return geometry.boundingBox;
};

export const alignGeometry: {
  [key in GeometryAlignment]: ApplyGeometryAlignment;
} = {
  [GeometryAlignment.CENTER]: (geometry) => {
    return geometry;
  },
  [GeometryAlignment.BOTTOM]: (geometry) => {
    const bounds = boundingBox(geometry);
    return geometry.applyMatrix4(
      new Matrix4().makeTranslation(0, -bounds.min.y, 0)
    );
  },
  [GeometryAlignment.TOP]: (geometry) => {
    const bounds = boundingBox(geometry);
    return geometry.applyMatrix4(
      new Matrix4().makeTranslation(0, bounds.min.y, 0)
    );
  },
  [GeometryAlignment.LEFT]: (geometry) => {
    const bounds = boundingBox(geometry);
    return geometry.applyMatrix4(
      new Matrix4().makeTranslation(-bounds.min.x, 0, 0)
    );
  },
  [GeometryAlignment.RIGHT]: (geometry) => {
    const bounds = boundingBox(geometry);
    return geometry.applyMatrix4(
      new Matrix4().makeTranslation(bounds.min.x, 0, 0)
    );
  },
  [GeometryAlignment.FRONT]: (geometry) => {
    const bounds = boundingBox(geometry);
    return geometry.applyMatrix4(
      new Matrix4().makeTranslation(0, 0, bounds.min.z)
    );
  },
  [GeometryAlignment.BACK]: (geometry) => {
    const bounds = boundingBox(geometry);
    return geometry.applyMatrix4(
      new Matrix4().makeTranslation(0, 0, -bounds.min.z)
    );
  },
};
