import { sync, ISubscribable, reactive } from "@thi.ng/rstream";
import { motionStream } from "./motion-stream";
import { Transform } from "./particle";
import { RafStream } from "./types";

export type RadialMotionConfig = {
  radius: number;
  speed: number;
};
export function motionRadialOrbit(
  config: ISubscribable<RadialMotionConfig>,
  raf?: RafStream
) {
  const transform = new Transform();

  // https://gamedev.stackexchange.com/questions/43691/how-can-i-move-an-object-in-an-infinity-or-figure-8-trajectory
  return motionStream<RadialMotionConfig, Transform>(
    (t, cfg) => {
      t *= cfg.speed;
      const x = Math.cos(t) * cfg.radius;
      const y = Math.sin(t) * cfg.radius;
      transform.position[0] = x;
      transform.position[2] = y;
      return transform;
    },
    config,
    raf
  );
}

export function motionFigure8Orbit(
  config: ISubscribable<RadialMotionConfig>,
  raf?: RafStream
) {
  const transform = new Transform();

  // https://gamedev.stackexchange.com/questions/43691/how-can-i-move-an-object-in-an-infinity-or-figure-8-trajectory
  return motionStream<RadialMotionConfig, Transform>(
    (t, cfg) => {
      t *= cfg.speed;
      const scale = 2 / (3 - Math.cos(2 * t));
      const x = scale * Math.cos(t);
      const y = (scale * Math.sin(2 * t)) / 2;
      transform.position[0] = x * cfg.radius;
      transform.position[2] = y * cfg.radius;
      return transform;
    },
    config,
    raf
  );
}
