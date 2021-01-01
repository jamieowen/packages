import { ISubscribable, reactive, Subscription, sync } from "@thi.ng/rstream";
import {
  GestureEvent,
  GestureStream,
  GestureType,
} from "@thi.ng/rstream-gestures";
import { add3, set3, sub2, sub3, Vec, Vec3, Vec3Like } from "@thi.ng/vectors";
import { comp, map, filter } from "@thi.ng/transducers";
import { GestureEvent3D, GestureStream3D } from "../streams";
import { forceFriction, forceStream, particleStream } from "./particle";

type DragGesture2D = GestureEvent & {
  translate: Vec;
  delta: Vec;
  start: Vec;
};

type DragGesture3D = GestureEvent3D & {
  translate: Vec;
  delta: Vec;
  start: Vec;
};

export const dragGesture2d = (
  gesture$: GestureStream
): ISubscribable<DragGesture2D> => {
  let translate: Vec = [0, 0];
  let delta: Vec;
  let start: Vec;

  return gesture$.transform(
    comp(
      filter(
        (ev) => ev.type !== GestureType.MOVE && ev.type !== GestureType.ZOOM
      ),
      map((ev) => {
        switch (ev.type) {
          case GestureType.START:
            start = ev.pos;
            translate = [0, 0];
            delta = [0, 0];
            break;
          case GestureType.END:
          case GestureType.DRAG:
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

export const dragGesture3d = (
  gesture$: GestureStream3D,
  opts: Partial<{
    maxSpeed: number;
    friction: number;
  }> = {}
) => {
  const { maxSpeed = 0.8, friction = 0.12 } = opts;
  // gesture position
  let translate: Vec;
  let delta: Vec;
  let start: Vec;
  let previous: Vec;
  // particle position
  let particleStart: Vec;
  let isDragging: boolean = false;
  let time: number = 0;

  const [force$, setForces] = forceStream([], []);
  const particle$ = particleStream(force$, reactive({ maxSpeed }));
  const frictionF = forceFriction(friction);

  return sync({
    src: {
      particle: particle$,
      gesture: gesture$,
    },
    xform: comp(
      // filter(
      //   ({ gesture }) =>
      //     gesture.type !== GestureType.MOVE && gesture.type !== GestureType.ZOOM
      // ),
      map(({ gesture, particle }) => {
        switch (gesture.type) {
          case GestureType.START:
            start = gesture.pos as Vec3Like;
            previous = start;
            translate = [0, 0, 0]; // difference between start and end
            delta = [0, 0, 0]; // difference between frame
            isDragging = true;
            particleStart = [...particle.position];
            time = Date.now();
            break;
          case GestureType.END:
            // gesture will remain in stream buffer until removed.
            // so test event end
            if (isDragging) {
              isDragging = false;
              setForces([frictionF], [() => delta as Vec3Like]);
            }
            break;
          case GestureType.DRAG:
            translate = sub3([], gesture.pos, start);

            const now = Date.now();
            // calc delta with time offset since previous pos
            if (now - time > 25) {
              delta = sub3([], gesture.pos, previous);
              previous = gesture.pos;
              time = now;
            }
            set3(particle.position, add3([], particleStart, translate));
            break;
        }
        return {
          gesture,
          particle,
        };
      })
    ),
  });
};
