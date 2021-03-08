import {memoize1} from "../../../../_snowpack/pkg/@thi.ng/memoize.js";
import {Matrix4} from "../../../../_snowpack/pkg/three.js";
export var GeometryAlignment;
(function(GeometryAlignment2) {
  GeometryAlignment2["CENTER"] = "center";
  GeometryAlignment2["BOTTOM"] = "bottom";
  GeometryAlignment2["TOP"] = "top";
  GeometryAlignment2["LEFT"] = "left";
  GeometryAlignment2["RIGHT"] = "right";
  GeometryAlignment2["FRONT"] = "front";
  GeometryAlignment2["BACK"] = "back";
})(GeometryAlignment || (GeometryAlignment = {}));
export class GeometryFactory {
  constructor() {
    this.map = new Map();
  }
  register(id, create) {
    const createForAlignment = memoize1((alignment) => {
      const geom = create();
      return alignGeometry[alignment](geom);
    });
    const alignments = Object.values(GeometryAlignment);
    alignments.forEach((align) => {
      const lookup = this.getID(id, align);
      this.map.set(lookup, {
        handle: false,
        create: () => createForAlignment(align)
      });
    });
  }
  getID(id, alignment) {
    return [id, alignment].join("/");
  }
  create(id, alignment = GeometryAlignment.CENTER) {
    const lookup = this.getID(id, alignment);
    return this.map.get(lookup).create();
  }
}
const boundingBox = (geometry) => {
  if (!geometry.boundingBox) {
    geometry.computeBoundingBox();
  }
  return geometry.boundingBox;
};
export const alignGeometry = {
  [GeometryAlignment.CENTER]: (geometry) => {
    return geometry;
  },
  [GeometryAlignment.BOTTOM]: (geometry) => {
    const bounds = boundingBox(geometry);
    return geometry.applyMatrix4(new Matrix4().makeTranslation(0, -bounds.min.y, 0));
  },
  [GeometryAlignment.TOP]: (geometry) => {
    const bounds = boundingBox(geometry);
    return geometry.applyMatrix4(new Matrix4().makeTranslation(0, bounds.min.y, 0));
  },
  [GeometryAlignment.LEFT]: (geometry) => {
    const bounds = boundingBox(geometry);
    return geometry.applyMatrix4(new Matrix4().makeTranslation(-bounds.min.x, 0, 0));
  },
  [GeometryAlignment.RIGHT]: (geometry) => {
    const bounds = boundingBox(geometry);
    return geometry.applyMatrix4(new Matrix4().makeTranslation(bounds.min.x, 0, 0));
  },
  [GeometryAlignment.FRONT]: (geometry) => {
    const bounds = boundingBox(geometry);
    return geometry.applyMatrix4(new Matrix4().makeTranslation(0, 0, bounds.min.z));
  },
  [GeometryAlignment.BACK]: (geometry) => {
    const bounds = boundingBox(geometry);
    return geometry.applyMatrix4(new Matrix4().makeTranslation(0, 0, -bounds.min.z));
  }
};
//# sourceMappingURL=GeometryFactory.js.map
