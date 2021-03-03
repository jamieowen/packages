import { ISubscribable, reactive, Stream } from "@thi.ng/rstream";
import {
  add3,
  clampN3,
  mulN3,
  set3,
  Vec,
  Vec3Like,
  abs3,
  dist3,
} from "@thi.ng/vectors";

// import { motionStream } from "./motion-stream";
// import { IParticle, ITransform, RafStream } from "./types";
import { motionParticle } from "./base-streams";
import { ITransform, IParticle } from "./api";
import { filter } from "@thi.ng/transducers";

export type IForce = (particle: IParticle) => Vec;

// Move to factory functions
export class Transform implements ITransform {
  position: Vec = [0, 0, 0];
  scale: Vec = [1, 1, 1];
  rotation: Vec = [0, 0, 0];
}

// Move to factory functions
export class Particle extends Transform implements IParticle {
  acceleration: Vec = [0, 0, 0];
  velocity: Vec = [0, 0, 0];
  previous: Vec = [0, 0, 0];
}

export const updateParticle = (particle: IParticle, forces: IForce[]) => {
  const { acceleration, velocity, position } = particle;
  set3(particle.previous, position);
  forces.forEach((f) => add3(null, acceleration, f(particle)));
  add3(null, velocity, acceleration);
  mulN3(null, acceleration, 0);
  add3(null, position, velocity);
  // mulN3(null, velocity, 0.75);
};

export const limitVelocityN = (particle: IParticle, speed: number) => {
  clampN3(null, particle.velocity, -speed, speed);
};

export const forceGravity = (grav: number = 1) => (): IForce => {
  return (_p) => {
    return [0, grav, 0];
  };
};

export const forceFriction = (friction: number = 0.2): IForce => {
  const res: Vec3Like = [0, 0, 0];
  return (p) => {
    set3(res, p.velocity);
    mulN3(null, res, -1);
    // normalize?
    mulN3(null, res, friction);
    return res;
  };
};

export type ForceStream = Stream<{ forces: IForce[]; pulses: IForce[] }>;
export const forceStream = (
  // continous forces
  forces: IForce[],
  // 'one hit' pulses
  pulses?: IForce[]
): [ForceStream, (forces: IForce[], pulses: IForce[]) => void] => {
  const stream = reactive({ forces, pulses });
  const setForces = (forces: IForce[], pulses: IForce[] = []) => {
    stream.next({ forces, pulses });
  };
  return [stream, setForces];
};

export type ParticleMotionConfig = {
  maxSpeed?: number;
  threshold?: number; // prevent emitting if change is below
};

/**
 * A singular particle Stream class for use in simple
 * particle style effects.  Think gestures ( throw, drag, etc ) and
 * simple primary motion elements like mouse follow effects.
 *
 * IS Very WIP.
 */
export const particleStream = (
  force$: ForceStream,
  config?: ISubscribable<ParticleMotionConfig>
  // raf?: RafStream
) => {
  config =
    config == undefined
      ? reactive({
          maxSpeed: 10,
          threshold: 0.05,
        })
      : config;

  let { forces, pulses } = force$.deref();
  force$.subscribe({
    next: (f) => {
      forces = f.forces;
      pulses = f.pulses;
    },
  });

  let first = true;
  return motionParticle()
    .subscribe({
      next: (ev) => {
        updateParticle(ev.data, [...forces, ...pulses]);
        limitVelocityN(ev.data, config.deref().maxSpeed);
        pulses.splice(0);
      },
      error: (err) => {
        throw err;
      },
    })
    .transform(
      filter((ev) => {
        const dis = Math.abs(dist3(ev.data.position, ev.data.previous));
        const changed = dis > config.deref().threshold || first;
        first = false;
        return changed;
      })
    );
};
