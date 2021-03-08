import { c as createParticle } from '../common/particle-79396cbf.js';
export { f as forceFriction, a as forceStream, m as motionParticle, p as particleStream } from '../common/particle-79396cbf.js';
import { m as map } from '../common/map-3e2f222d.js';
import { s as subscription } from '../common/subscription-3ccab2d1.js';
import { s as set3 } from '../common/dist-ee9b3aef.js';
import { s as step, a as sideEffect } from '../common/side-effect-71cca543.js';
import '../common/raf-2e2715fc.js';
import '../common/stream-f3489f1b.js';
import '../common/is-node-aee4b371.js';
import '../common/_node-resolve_empty-7606bff8.js';
import '../common/filter-44dab916.js';
import '../common/deferror-99934d1f.js';
import '../common/logger-b7639346.js';
import '../common/is-plain-object-7a83b681.js';
import '../common/comp-e3b62542.js';
import '../common/codegen-5794034c.js';
import '../common/unsupported-608d53c8.js';
import '../common/range-778b1e8d.js';
import '../common/interval-ab795faf.js';

const mapPosition = (fn) => map((ev) => (fn(ev.clock.time, ev.data.position), ev));

// export class Trails extends Subscription<
//   IMotionEvent<"transform">,
//   IMotionEvent<"transform-array">
// > {
//   trails: ITransform[] = [];
//   emit: boolean = false;
//   constructor(public length: number, public emitWhenFull: boolean = true) {
//     super(undefined, {
//       xform: sideEffect(() => console.log("trail")),
//     });
//     this.trails = [];
//   }
//   next(ev: IMotionEvent<"transform">) {
//     if (this.trails.length < this.length) {
//       this.trails.unshift(createTransform());
//     } else {
//       const last = this.trails.pop();
//       this.trails.unshift(last);
//     }
//     const input = ev.data;
//     const transform = this.trails[0];
//     set3(transform.position, input.position);
//     if (this.emitWhenFull && this.trails.length >= this.length) {
//       this.dispatch({
//         type: "transform-array",
//         data: this.trails,
//         clock: ev.clock,
//       });
//     } else {
//     }
//   }
//   error(err: Error) {
//     console.log("Err", err);
//   }
// }
// export const trails = (length: number) => new Trails(length);
/**
 *
 * Trails 2
 *
 */
const pushHistory = (length) => {
    const history = [];
    return (ev) => {
        if (history.length < length) {
            history.unshift(createParticle());
        }
        else {
            const last = history.pop();
            history.unshift(last);
        }
        const input = ev.data;
        const transform = history[0];
        set3(transform.position, input.position);
        return Object.assign(Object.assign({}, ev), { type: "particle-array", data: history });
    };
};
const particleTrails = (length) => {
    const xform = map(pushHistory(length));
    return subscription({
        next: () => { },
        error: (err) => {
            throw err;
        },
    }, { xform });
};

function backInOut(t) {
    const s = 1.70158 * 1.525;
    if ((t *= 2) < 1)
        return 0.5 * (t * t * ((s + 1) * t - s));
    return 0.5 * ((t -= 2) * t * ((s + 1) * t + s) + 2);
}

function backIn(t) {
    const s = 1.70158;
    return t * t * ((s + 1) * t - s);
}

function backOut(t) {
    const s = 1.70158;
    return --t * t * ((s + 1) * t + s) + 1;
}

function bounceOut(t) {
    const a = 4.0 / 11.0;
    const b = 8.0 / 11.0;
    const c = 9.0 / 10.0;
    const ca = 4356.0 / 361.0;
    const cb = 35442.0 / 1805.0;
    const cc = 16061.0 / 1805.0;
    const t2 = t * t;
    return t < a
        ? 7.5625 * t2
        : t < b
            ? 9.075 * t2 - 9.9 * t + 3.4
            : t < c
                ? ca * t2 - cb * t + cc
                : 10.8 * t * t - 20.52 * t + 10.72;
}

function bounceInOut(t) {
    return t < 0.5
        ? 0.5 * (1.0 - bounceOut(1.0 - t * 2.0))
        : 0.5 * bounceOut(t * 2.0 - 1.0) + 0.5;
}

function bounceIn(t) {
    return 1.0 - bounceOut(1.0 - t);
}

function circInOut(t) {
    if ((t *= 2) < 1)
        return -0.5 * (Math.sqrt(1 - t * t) - 1);
    return 0.5 * (Math.sqrt(1 - (t -= 2) * t) + 1);
}

function circIn(t) {
    return 1.0 - Math.sqrt(1.0 - t * t);
}

function circOut(t) {
    return Math.sqrt(1 - --t * t);
}

function cubicInOut(t) {
    return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
}

function cubicIn(t) {
    return t * t * t;
}

function cubicOut(t) {
    var f = t - 1.0;
    return f * f * f + 1.0;
}

function elasticInOut(t) {
    return t < 0.5
        ? 0.5 *
            Math.sin(((+13.0 * Math.PI) / 2) * 2.0 * t) *
            Math.pow(2.0, 10.0 * (2.0 * t - 1.0))
        : 0.5 *
            Math.sin(((-13.0 * Math.PI) / 2) * (2.0 * t - 1.0 + 1.0)) *
            Math.pow(2.0, -10.0 * (2.0 * t - 1.0)) +
            1.0;
}

function elasticIn(t) {
    return Math.sin((13.0 * t * Math.PI) / 2) * Math.pow(2.0, 10.0 * (t - 1.0));
}

function elasticOut(t) {
    return (Math.sin((-13.0 * (t + 1.0) * Math.PI) / 2) * Math.pow(2.0, -10.0 * t) + 1.0);
}

function expoInOut(t) {
    return t === 0.0 || t === 1.0
        ? t
        : t < 0.5
            ? +0.5 * Math.pow(2.0, 20.0 * t - 10.0)
            : -0.5 * Math.pow(2.0, 10.0 - t * 20.0) + 1.0;
}

function expoIn(t) {
    return t === 0.0 ? t : Math.pow(2.0, 10.0 * (t - 1.0));
}

function expoOut(t) {
    return t === 1.0 ? t : 1.0 - Math.pow(2.0, -10.0 * t);
}

function linear(t) {
    return t;
}

function quadInOut(t) {
    t /= 0.5;
    if (t < 1)
        return 0.5 * t * t;
    t--;
    return -0.5 * (t * (t - 2) - 1);
}

function quadIn(t) {
    return t * t;
}

function quadOut(t) {
    return -t * (t - 2.0);
}

function quartInOut(t) {
    return t < 0.5
        ? +8.0 * Math.pow(t, 4.0)
        : -8.0 * Math.pow(t - 1.0, 4.0) + 1.0;
}

function quartIn(t) {
    return Math.pow(t, 4.0);
}

function quartOut(t) {
    return Math.pow(t - 1.0, 3.0) * (1.0 - t) + 1.0;
}

function quintInOut(t) {
    if ((t *= 2) < 1)
        return 0.5 * t * t * t * t * t;
    return 0.5 * ((t -= 2) * t * t * t * t + 2);
}

function quintIn(t) {
    return t * t * t * t * t;
}

function quintOut(t) {
    return --t * t * t * t * t + 1;
}

function sineInOut(t) {
    return -0.5 * (Math.cos(Math.PI * t) - 1);
}

function sineIn(t) {
    var v = Math.cos(t * Math.PI * 0.5);
    if (Math.abs(v) < 1e-14)
        return 1;
    else
        return 1 - v;
}

function sineOut(t) {
    return Math.sin((t * Math.PI) / 2);
}

const EaseTypes = {
    backIn,
    backInOut,
    backOut,
    bounceIn,
    bounceInOut,
    bounceOut,
    circIn,
    circInOut,
    circOut,
    cubicIn,
    cubicInOut,
    cubicOut,
    elasticIn,
    elasticInOut,
    elasticOut,
    expoIn,
    expoInOut,
    expoOut,
    linear,
    quadIn,
    quadInOut,
    quadOut,
    quartIn,
    quartInOut,
    quartOut,
    quintIn,
    quintInOut,
    quintOut,
    sineIn,
    sineInOut,
    sineOut,
};

const particleIterator = (opts) => {
    let apply = step(opts.xform);
    let tmp = {
        type: "particle",
        data: null,
        clock: null,
    };
    return subscription({
        next: () => { },
        error: (err) => {
            throw err;
        },
    }, {
        // Apply given transducer to each particle in array.
        xform: sideEffect((ev) => {
            tmp.clock = ev.clock;
            for (let i = 0; i < ev.data.length; i++) {
                tmp.data = ev.data[i];
                apply(tmp);
            }
        }),
    });
};

export { EaseTypes, mapPosition, particleIterator, particleTrails };
//# sourceMappingURL=motion.js.map
