import {
  DataTexture,
  FloatType,
  LuminanceAlphaFormat,
  PixelFormat,
  RGBAFormat,
  RGBFormat,
  UVMapping,
  ClampToEdgeWrapping,
  NearestFilter,
  RedFormat,
} from "three";
import { IRandom, SYSTEM } from "@thi.ng/random";

export const randomFloat32Array3 = (
  count: number,
  minmax: [number, number] = [0, 1],
  rng: IRandom = SYSTEM
) => {
  const array = new Float32Array(count * 3);
  let offset = 0;
  for (let i = 0; i < array.length; i += 3) {
    array[offset] = rng.minmax(minmax[0], minmax[1]);
    array[offset + 1] = 0;
    array[offset + 2] = 0;
    offset += 3;
  }
  return array;
};

export const randomFloat32Array2 = (count: number) => {
  const array = new Float32Array(count * 2);
  let offset = 0;
  for (let i = 0; i < array.length; i += 2) {
    array[offset] = 0;
    array[offset + 1] = 0;
    offset += 2;
  }
  return array;
};

export const randomFloat32Array1 = (
  count: number,
  minmax: [number, number] = [0, 1],
  rng: IRandom = SYSTEM
) => {
  const array = new Float32Array(count);
  for (let i = 0; i < array.length; i++) {
    array[i] = rng.minmax(minmax[0], minmax[1]);
  }
  return array;
};

export const dataTexture = (
  data: Float32Array,
  width: number,
  height: number,
  size: number = 3
) => {
  let format: PixelFormat;
  if (size === 1) {
    format = RedFormat;
  } else if (size === 2) {
    format = LuminanceAlphaFormat;
  } else if (size === 3) {
    format = RGBFormat;
  } else if (size === 4) {
    format = RGBAFormat;
  }
  return new DataTexture(
    data,
    width,
    height,
    format,
    FloatType,
    UVMapping,
    ClampToEdgeWrapping,
    ClampToEdgeWrapping,
    NearestFilter,
    NearestFilter
  );
};

export const encodeFillFloat32Array3 = (
  count: number,
  fill: (array: Float32Array, offset: number) => void
) => {
  const array = new Float32Array(count * 3);
  let offset = 0;
  for (let i = 0; i < array.length; i += 3) {
    fill(array, offset);
    offset += 3;
  }
  return array;
};

export const encodeFillDataTexture3 = (
  width: number,
  height: number,
  fill: (array: Float32Array, offset: number) => void
) => {
  const array = encodeFillFloat32Array3(width * height, fill);
  return dataTexture(array, width, height, 3);
};

export const encodeFillFloat32Array4 = (
  count: number,
  fill: (array: Float32Array, offset: number) => void
) => {
  const array = new Float32Array(count * 4);
  let offset = 0;
  for (let i = 0; i < array.length; i += 4) {
    fill(array, offset);
    offset += 4;
  }
  return array;
};

export const encodeFillDataTexture4 = (
  width: number,
  height: number,
  fill: (array: Float32Array, offset: number) => void
) => {
  const array = encodeFillFloat32Array4(width * height, fill);
  return dataTexture(array, width, height, 4);
};
