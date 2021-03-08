import {
  BoxBufferGeometry,
  SphereBufferGeometry,
  PlaneBufferGeometry,
  CircleBufferGeometry
} from "../../../../_snowpack/pkg/three.js";
import {GeometryFactory} from "../geometry/GeometryFactory.js";
export function createGeometryFactory() {
  const factory = new GeometryFactory();
  factory.register("box", () => new BoxBufferGeometry());
  factory.register("sphere", () => new SphereBufferGeometry());
  factory.register("plane", () => new PlaneBufferGeometry());
  factory.register("circle", () => new CircleBufferGeometry(1, 30));
  return factory;
}
export const DEFAULT_GEOMETRY_FACTORY = createGeometryFactory();
//# sourceMappingURL=geometries.js.map
