import {map} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
import {DEFAULT_CLOCK} from "./clock.js";
export const createTransform = () => {
  return {
    position: [0, 0, 0]
  };
};
export const createParticle = () => {
  return {
    velocity: [0, 0, 0],
    position: [0, 0, 0],
    acceleration: [0, 0, 0],
    previous: [0, 0, 0]
  };
};
export const motionTransform = (tick = DEFAULT_CLOCK()) => {
  const data = createTransform();
  const type = "transform";
  return tick.transform(map((clock) => ({clock, data, type})));
};
export const motionParticle = (tick = DEFAULT_CLOCK()) => {
  const data = createParticle();
  const type = "particle";
  return tick.transform(map((clock) => ({clock, data, type})));
};
//# sourceMappingURL=base-streams.js.map
