import { fromRAF, Stream } from "@thi.ng/rstream";
import { Vec3Like } from "@thi.ng/vectors";

export type RafStream = Stream<number>;

export interface IParticle extends ITransform {
  acceleration: Vec3Like;
  velocity: Vec3Like;
}

export interface ITransform {
  position: Vec3Like;
  scale: Vec3Like;
  rotation: Vec3Like;
}

export type IForce = (particle: IParticle) => Vec3Like;

let defaultRaf: RafStream;
/** A default RAF stream used by motion packages when no custom raf is provided. */
export const DEFAULT_RAF_STREAM = (): RafStream => {
  if (!defaultRaf) {
    defaultRaf = fromRAF();
  }
  return defaultRaf;
};
