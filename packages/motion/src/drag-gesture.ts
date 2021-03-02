import { ISubscribable, reactive, Subscription, sync } from "@thi.ng/rstream";
import { add3, set3, sub2, sub3, Vec, Vec3, Vec3Like } from "@thi.ng/vectors";
import { comp, map, filter } from "@thi.ng/transducers";
import { GestureEvent, GestureStream } from "@thi.ng/rstream-gestures";
import { forceFriction, forceStream, particleStream } from "./particle";

interface DragGesture2D extends GestureEvent {
  translate: Vec;
  delta: Vec;
  start: Vec;
}

export const dragGesture2d = (
  gesture$: GestureStream,
  opts: Partial<{
    maxSpeed: number;
    friction: number;
  }> = {}
) => {
  const { maxSpeed = 100, friction = 0.09 } = opts;

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
      //     gesture.type !== 'move' && gesture.type !== 'zoom'
      // ),
      map(({ gesture, particle }) => {
        switch (gesture.type) {
          case "start":
            start = [...gesture.pos, 0]; // adapt to 3d particle
            previous = start;
            translate = [0, 0, 0]; // difference between start and end
            delta = [0, 0, 0]; // difference between frame
            isDragging = true;
            particleStart = [...particle.position]; // vec3 particle
            time = Date.now();
            break;
          case "end":
            // gesture will remain in stream buffer until removed.
            // so test event end
            if (isDragging) {
              isDragging = false;
              setForces([frictionF], [() => delta as Vec3Like]);
            }
            break;
          case "drag":
            const pos = [...gesture.pos, 0];
            translate = sub3([], pos, start);
            const now = Date.now();
            // calc delta with time offset since previous pos
            if (now - time > 25) {
              delta = sub3([], pos, previous);
              previous = pos;
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
