import {reactive} from "../../../_snowpack/pkg/@thi.ng/rstream.js";
import {
  add3,
  clampN3,
  mulN3,
  set3,
  dist3
} from "../../../_snowpack/pkg/@thi.ng/vectors.js";
import {motionParticle} from "./base-streams.js";
import {filter} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
export class Transform {
  constructor() {
    this.position = [0, 0, 0];
    this.scale = [1, 1, 1];
    this.rotation = [0, 0, 0];
  }
}
export class Particle extends Transform {
  constructor() {
    super(...arguments);
    this.acceleration = [0, 0, 0];
    this.velocity = [0, 0, 0];
    this.previous = [0, 0, 0];
  }
}
export const updateParticle = (particle, forces) => {
  const {acceleration, velocity, position} = particle;
  set3(particle.previous, position);
  forces.forEach((f) => add3(null, acceleration, f(particle)));
  add3(null, velocity, acceleration);
  mulN3(null, acceleration, 0);
  add3(null, position, velocity);
};
export const limitVelocityN = (particle, speed) => {
  clampN3(null, particle.velocity, -speed, speed);
};
export const forceGravity = (grav = 1) => () => {
  return (_p) => {
    return [0, grav, 0];
  };
};
export const forceFriction = (friction = 0.2) => {
  const res = [0, 0, 0];
  return (p) => {
    set3(res, p.velocity);
    mulN3(null, res, -1);
    mulN3(null, res, friction);
    return res;
  };
};
export const forceStream = (forces, pulses) => {
  const stream = reactive({forces, pulses});
  const setForces = (forces2, pulses2 = []) => {
    stream.next({forces: forces2, pulses: pulses2});
  };
  return [stream, setForces];
};
export const particleStream = (force$, config) => {
  config = config == void 0 ? reactive({
    maxSpeed: 10,
    threshold: 0.05
  }) : config;
  let {forces, pulses} = force$.deref();
  force$.subscribe({
    next: (f) => {
      forces = f.forces;
      pulses = f.pulses;
    }
  });
  let first = true;
  return motionParticle().subscribe({
    next: (ev) => {
      updateParticle(ev.data, [...forces, ...pulses]);
      limitVelocityN(ev.data, config.deref().maxSpeed);
      pulses.splice(0);
    },
    error: (err) => {
      throw err;
    }
  }).transform(filter((ev) => {
    const dis = Math.abs(dist3(ev.data.position, ev.data.previous));
    const changed = dis > config.deref().threshold || first;
    first = false;
    return changed;
  }));
};
//# sourceMappingURL=particle.js.map
