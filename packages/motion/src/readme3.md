/\*\*

- Ideas / Notes.
-
- WIP notes on motion based streams. These are really to
- create some simple compasable streams that can generate some
- varying movement styles.
-
- Some points:
- 1.  How best to define a config? Configs could be quite generic so could be seperate streams that
- can be passed into common stream types.
- 2.  Transform stream. A base stream that all motion streams could use or be passed. similar to the RAF stream.
- Essentially position,scale & rotation can be passed in to all streams?
- ORRR this us likely not needd. a transformStream to map the ouput Vec3 is all thats
- probably needed.
- 3.  Blend Stream Types.
- 4.  Noise and Randomiser Streams.
- 5.  Random Walk, Meander, Bounds based motion.
- 6.  Bayrcentric interpolation between multiple streams.
- 7.  Curve streams, Geometry, Typograhy?
- 8.  History / Buffer
- 9.  Gesture? Throw / Drag / Etc with Inertia
      \*/

FROM OLD...

```
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

```

RADIAL / FIGURE OF 8.

SHould be simple map functions.

```
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

```
