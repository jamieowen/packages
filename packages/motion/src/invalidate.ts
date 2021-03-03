import { set2, set3, Vec } from "@thi.ng/vectors";
import { filter } from "@thi.ng/transducers";
import { IMotionEvent } from "./api";
/**
 *
 * Invalidate against a single value,
 * Returning a simple true/false.
 *
 * @param isInvalid
 * @param init
 */
export const invalidate = <T>(
  isInvalid: (existing: T, next: T) => boolean,
  init?: T // not sure if an init value is needed?
) => {
  let last = init;
  return filter<T>((x) => {
    if (isInvalid(last, x) || last === undefined) {
      last = x;
      return false;
    } else {
      last = x;
      return true;
    }
  });
};

export const invalidatePosition = () => {
  let prev: Vec = [];
  return filter<IMotionEvent<"particle" | "transform">>((x) => {
    const changed =
      x.data.position[0] !== prev[0] ||
      x.data.position[1] !== prev[1] ||
      x.data.position[2] !== prev[2];

    if (changed) {
      set3(prev, x.data.position);
    }
    return changed;
  });
};

export const invalidatePositionThreshold = (threshold: number = 0.01) => {
  let prev: Vec = [];
  return filter<IMotionEvent<"particle" | "transform">>((x) => {
    const curr = x.data.position;
    const changed =
      (curr[0] > prev[0] + threshold && curr[0] < prev[0] - threshold) ||
      (curr[1] > prev[1] + threshold && curr[1] < prev[1] - threshold) ||
      (curr[2] > prev[2] + threshold && curr[2] < prev[2] - threshold);

    if (changed) {
      set3(prev, x.data.position);
    }
    return changed;
  });
};
