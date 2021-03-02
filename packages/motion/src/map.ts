import { Vec } from "@thi.ng/vectors";
import { map } from "@thi.ng/transducers";
import { IMotionEvent, MotionDataType } from "./api";

export const mapPosition = <T extends MotionDataType = "transform">(
  fn: (time: number, position: Vec) => void
) =>
  map<IMotionEvent<T>, IMotionEvent<T>>(
    (ev) => (fn(ev.clock.time, ev.data.position), ev)
  );
