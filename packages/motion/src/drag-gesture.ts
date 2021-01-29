import { ISubscribable, reactive, Subscription, sync } from "@thi.ng/rstream";
import { add3, set3, sub2, sub3, Vec, Vec3, Vec3Like } from "@thi.ng/vectors";
import { comp, map, filter } from "@thi.ng/transducers";
import { GestureEvent, GestureStream } from "@thi.ng/rstream-gestures";

interface DragGesture2D extends GestureEvent {
  translate: Vec;
  delta: Vec;
  start: Vec;
}

export const dragGesture2d = (gesture$: GestureStream) => {
  let translate: Vec = [0, 0];
  let delta: Vec;
  let start: Vec;

  return gesture$.transform(
    comp(
      filter((ev) => ev.type !== "move" && ev.type !== "zoom"),
      map<GestureEvent, DragGesture2D>((ev) => {
        switch (ev.type) {
          case "start":
            start = ev.pos;
            translate = [0, 0];
            delta = [0, 0];
            break;
          case "end":
          case "drag":
            delta = sub2([], ev.pos, delta);
            translate = sub2([], ev.pos, start);
            break;
        }
        return {
          ...ev,
          translate,
          delta,
          start,
        };
      })
    )
  );
};
