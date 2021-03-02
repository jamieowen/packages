import { Vec } from "@thi.ng/vectors";

export interface ITransform {
  position: Vec;
  // add more later
}

export interface IParticle extends ITransform {
  velocity: Vec;
  previous: Vec;
  acceleration: Vec;
}

export interface IClock {
  time: number;
  delta: number;
  frame: number;
}

export type MotionDataType =
  | "transform"
  | "particle"
  | "transform-array"
  | "particle-array";

export interface IMotionEvent<T extends MotionDataType> {
  type: T;
  data: T extends "transform"
    ? ITransform
    : T extends "transform-array"
    ? ITransform[]
    : T extends "particle"
    ? IParticle
    : T extends "particle-array"
    ? IParticle[]
    : null;

  clock: IClock;
}

export default {}; // snowpack does not export without something?
