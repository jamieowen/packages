import {
  BoxBufferGeometry,
  SphereBufferGeometry,
  PlaneBufferGeometry,
  CircleBufferGeometry,
} from "three";
import { GeometryFactory } from "./GeometryFactory";

export function createGeometryFactory() {
  const factory = new GeometryFactory();
  factory.register("box", () => new BoxBufferGeometry());
  factory.register("sphere", () => new SphereBufferGeometry());
  factory.register("plane", () => new PlaneBufferGeometry());
  factory.register("circle", () => new CircleBufferGeometry(1, 30));
  return factory;
}
