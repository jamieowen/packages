import { sketch } from "@jamieowen/three";
import {
  RawShaderMaterial,
  Points,
  PointsMaterial,
  BufferGeometry,
  BufferAttribute,
  Object3D,
  Group,
} from "three";

const randomisePosition = (arr: Float32Array) => {
  for (let i = 0; i < arr.length; i += 3) {
    arr[i] = Math.random();
    arr[i + 1] = Math.random();
    arr[i + 2] = Math.random();
  }
};

const randomiseColor = (arr: Float32Array) => {
  for (let i = 0; i < arr.length; i += 4) {
    arr[i] = Math.random();
    arr[i + 1] = Math.random();
    arr[i + 2] = Math.random();
    arr[i + 3] = 1;
  }
};

const createPoints = (parent: Object3D, count: number) => {
  const geometry = new BufferGeometry();
  const position = new BufferAttribute(new Float32Array(count * 3), 3);
  const color = new BufferAttribute(new Float32Array(count * 4), 4);
  const size = new BufferAttribute(new Float32Array(count * 3), 3);
  randomisePosition(position.array as any);
  randomiseColor(color.array as any);
  randomisePosition(size.array as any);
  geometry.setAttribute("position", position);
  geometry.setAttribute("color", color);
  geometry.setAttribute("size", size);
  const points = new Points(
    geometry,
    new PointsMaterial({
      vertexColors: true,
      color: "white",
      size: 0.1,
      // sizeAttenuation: true,
    })
  );
  parent.add(points);
  return points;
};

sketch(({ configure, render, scene, renderer }) => {
  configure({
    width: "1024px",
    height: "768px",
  });

  const group = new Group();
  scene.add(group);

  const points = createPoints(group, 10000);
  points.scale.multiplyScalar(5);
  points.position.set(-2.5, -2.5, -2.5);
  render(() => {});
});
