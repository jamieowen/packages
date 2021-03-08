import {reactive, sync} from "../../../_snowpack/pkg/@thi.ng/rstream.js";
import {add3, set3, sub3} from "../../../_snowpack/pkg/@thi.ng/vectors.js";
import {comp, map, filter} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
import {forceFriction, forceStream, particleStream} from "./particle.js";
export const dragGesture2d = (gesture$, opts = {}) => {
  const {maxSpeed = 100, friction = 0.09, initialPosition = [0, 0, 0]} = opts;
  let translate;
  let delta;
  let start;
  let previous;
  let particleStart;
  let isDragging = false;
  let time = 0;
  let threshold = 5e-3;
  const [force$, setForces] = forceStream([], []);
  const particle$ = particleStream(force$, reactive({maxSpeed, threshold}));
  const frictionF = forceFriction(friction);
  set3(particle$.deref().data.position, initialPosition);
  let lastp = null;
  return sync({
    src: {
      particle: particle$,
      gesture: gesture$
    },
    xform: comp(filter(({gesture, particle}) => {
      const pchanged = particle !== lastp;
      lastp = particle;
      return gesture.type !== "move" && gesture.type !== "zoom" || pchanged;
    }), map(({gesture, particle}) => {
      switch (gesture.type) {
        case "start":
          start = [...gesture.pos, 0];
          previous = start;
          translate = [0, 0, 0];
          delta = [0, 0, 0];
          isDragging = true;
          particleStart = [...particle.data.position];
          time = Date.now();
          break;
        case "end":
          if (isDragging) {
            isDragging = false;
            setForces([frictionF], [() => delta]);
          }
          break;
        case "drag":
          const pos = [...gesture.pos, 0];
          translate = sub3([], pos, start);
          const now = Date.now();
          if (now - time > 25) {
            delta = sub3([], pos, previous);
            previous = pos;
            time = now;
          }
          set3(particle.data.position, add3([], particleStart, translate));
          break;
      }
      return {
        gesture,
        particle
      };
    }))
  });
};
//# sourceMappingURL=drag-gesture.js.map
