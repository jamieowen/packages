import {
  sync,
  ISubscribable,
  reactive,
  Stream,
  StreamSync,
} from "@thi.ng/rstream";
import { comp, map } from "@thi.ng/transducers";
import { Vec3Like, mixN3 } from "@thi.ng/vectors";
import { Transform } from "./particle";
import { DEFAULT_RAF_STREAM, RafStream } from "./types";

/**
 * Ideas / Notes.
 *
 * WIP notes on motion based streams. These are really to
 * create some simple compasable streams that can generate some
 * varying movement styles.
 *
 * Some points:
 * 1. How best to define a config? Configs could be quite generic so could be seperate streams that
 * can be passed into common stream types.
 * 2. Transform stream. A base stream that all motion streams could use or be passed. similar to the RAF stream.
 * Essentially position,scale & rotation can be passed in to all streams?
 * ORRR this us likely not needd. a transformStream to map the ouput Vec3 is all thats
 * probably needed.
 * 3. Blend Stream Types.
 * 4. Noise and Randomiser Streams.
 * 5. Random Walk, Meander, Bounds based motion.
 * 6. Bayrcentric interpolation between multiple streams.
 * 7. Curve streams, Geometry, Typograhy?
 * 8. History / Buffer
 * 9. Gesture? Throw / Drag / Etc with Inertia
 */

/**
 * Export reactive helper for wrapping motion config objects.
 */
export const motionConfig = reactive;
export { reactive };

/**
 * Base composable tween like stream emitting some customisable motion style.
 * @param update
 * @param config
 * @param raf
 */
export type MotionStream<T extends Transform = Transform> = StreamSync<any, T>; // types?
export function motionStream<C = any, T extends Transform = Transform>(
  update: (time: number, cfg: C) => T,
  config: ISubscribable<C>,
  raf: RafStream = DEFAULT_RAF_STREAM()
): MotionStream<T> {
  const cfg = config || reactive({} as C);
  const stream = sync({
    src: {
      cfg,
      raf,
    },
    xform: comp(map(({ raf, cfg }) => update(raf, cfg))),
  });

  // Force the raf into 'position 0' to trigger initial update.
  if (raf.deref() === undefined) {
    raf.next(0);
  }
  return stream;
}

// Blend should be a config...
// WIP
export const motionBlend = (blend: number, a: MotionStream, b: MotionStream) =>
  sync({
    src: {
      a,
      b,
    },
    xform: map(({ a, b }) => {
      return mixN3([], a.position, b.position, blend);
    }),
  });
