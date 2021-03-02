import { map } from "@thi.ng/transducers";
import { DEFAULT_CLOCK } from "./clock";
import { IClock, IMotionEvent, ITransform, IParticle } from "./api";

export const createTransform = (): ITransform => {
  return {
    position: [0, 0, 0],
  };
};

export const createParticle = (): IParticle => {
  return {
    velocity: [0, 0, 0],
    position: [0, 0, 0],
    acceleration: [0, 0, 0],
    previous: [0, 0, 0],
  };
};

export const motionTransform = (tick = DEFAULT_CLOCK()) => {
  const data = createTransform();
  const type = "transform";
  return tick.transform(
    map<IClock, IMotionEvent<"transform">>((clock) => ({ clock, data, type }))
  );
};

export const motionParticle = (tick = DEFAULT_CLOCK()) => {
  const data = createParticle();
  const type = "particle";
  return tick.transform(
    map<IClock, IMotionEvent<"particle">>((clock) => ({ clock, data, type }))
  );
};
