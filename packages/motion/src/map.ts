import { Vec } from "@thi.ng/vectors";
import { map } from "@thi.ng/transducers";
import { IMotionEvent, MotionDataType } from "./api";

/**
 * Simple helper functions to map directly to
 * an underlying data property.
 *
 * @param fn
 * @returns
 */
export const mapPosition = <T extends "transform" | "particle">(
  fn: (time: number, position: Vec) => void
) =>
  map<IMotionEvent<T>, IMotionEvent<T>>(
    (ev) => (fn(ev.clock.time, ev.data.position), ev)
  );
