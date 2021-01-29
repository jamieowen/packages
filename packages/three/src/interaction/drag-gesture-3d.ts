import { GestureStream3D } from "./gesture-stream-3d";
import { forceFriction, forceStream, particleStream } from "@jamieowen/motion";
import { add3, set3, sub2, sub3, Vec, Vec3, Vec3Like } from "@thi.ng/vectors";
import { reactive, sync } from "@thi.ng/rstream";
import { map, comp } from "@thi.ng/transducers";

// type DragGesture3D = GestureEvent3D & {
//   translate: Vec;
//   delta: Vec;
//   start: Vec;
// };

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
      //     gesture.type !== 'move' && gesture.type !== 'zoom'
      // ),
      map(({ gesture, particle }) => {
        switch (gesture.type) {
          case "start":
            start = gesture.pos as Vec3Like;
            previous = start;
            translate = [0, 0, 0]; // difference between start and end
            delta = [0, 0, 0]; // difference between frame
            isDragging = true;
            particleStart = [...particle.position];
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
