import { f as fromRAF } from './raf-2e2715fc.js';
import { m as map } from './map-3e2f222d.js';
import { s as set3, m as mulN3, d as dist3, a as add3, c as clampN3 } from './dist-ee9b3aef.js';
import { r as reactive } from './stream-f3489f1b.js';
import { f as filter } from './filter-44dab916.js';

const perf = () => {
    return (typeof performance === "undefined" ? Date : performance).now();
};
const clock = (opts) => {
    let then = perf();
    let start = then;
    const raf = fromRAF(opts).transform(map((frame) => {
        const now = perf();
        const delta = (now - then) / 1000;
        const time = (now - start) / 1000;
        then = now;
        return { frame, delta, time };
    }));
    raf.next(0); // emit an initial 0, otherwise it waits a frame.
    return raf;
};
const DEFAULT_CLOCK = (() => {
    let instance = undefined;
    return () => {
        if (!instance) {
            instance = clock();
        }
        return instance;
    };
})();

const createParticle = () => {
    return {
        velocity: [0, 0, 0],
        position: [0, 0, 0],
        acceleration: [0, 0, 0],
        previous: [0, 0, 0],
    };
};
const motionParticle = (tick = DEFAULT_CLOCK()) => {
    const data = createParticle();
    const type = "particle";
    return tick.transform(map((clock) => ({ clock, data, type })));
};

const updateParticle = (particle, forces) => {
    const { acceleration, velocity, position } = particle;
    set3(particle.previous, position);
    forces.forEach((f) => add3(null, acceleration, f(particle)));
    add3(null, velocity, acceleration);
    mulN3(null, acceleration, 0);
    add3(null, position, velocity);
    // mulN3(null, velocity, 0.75);
};
const limitVelocityN = (particle, speed) => {
    clampN3(null, particle.velocity, -speed, speed);
};
const forceFriction = (friction = 0.2) => {
    const res = [0, 0, 0];
    return (p) => {
        set3(res, p.velocity);
        mulN3(null, res, -1);
        // normalize?
        mulN3(null, res, friction);
        return res;
    };
};
const forceStream = (
// continous forces
forces, 
// 'one hit' pulses
pulses) => {
    const stream = reactive({ forces, pulses });
    const setForces = (forces, pulses = []) => {
        stream.next({ forces, pulses });
    };
    return [stream, setForces];
};
/**
 * A singular particle Stream class for use in simple
 * particle style effects.  Think gestures ( throw, drag, etc ) and
 * simple primary motion elements like mouse follow effects.
 *
 * IS Very WIP.
 */
const particleStream = (force$, config
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
        .transform(filter((ev) => {
        const dis = Math.abs(dist3(ev.data.position, ev.data.previous));
        const changed = dis > config.deref().threshold || first;
        first = false;
        return changed;
    }));
};

export { forceStream as a, createParticle as c, forceFriction as f, motionParticle as m, particleStream as p };
//# sourceMappingURL=particle-79396cbf.js.map
