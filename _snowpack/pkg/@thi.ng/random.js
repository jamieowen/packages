const INV_MAX = 1 / 0xffffffff;
class ARandom {
    float(norm = 1) {
        return this.int() * INV_MAX * norm;
    }
    norm(norm = 1) {
        return (this.int() * INV_MAX - 0.5) * 2 * norm;
    }
    minmax(min, max) {
        return this.float() * (max - min) + min;
    }
}

const random = Math.random;
/**
 * A `Math.random()` based {@link IRandom} implementation. Also @see
 * {@link SYSTEM}.
 */
class SystemRandom extends ARandom {
    int() {
        return (random() * 4294967296) /* 2**32 */ >>> 0;
    }
    float(norm = 1) {
        return random() * norm;
    }
    norm(norm = 1) {
        return (random() - 0.5) * 2 * norm;
    }
}
/**
 * Used as default PRNG throughout most other thi.ng projects, though usually is
 * configurable.
 */
const SYSTEM = new SystemRandom();

const DEFAULT_SEED_32 = 0xdecafbad;

/**
 * @remarks
 * References:
 * -
 * - https://github.com/thi-ng/ct-head/blob/master/random.h
 * - https://gist.github.com/voidqk/d112165a26b45244a65298933c0349a4
 */
class Smush32 extends ARandom {
    constructor(seed = DEFAULT_SEED_32) {
        super();
        this.buffer = new Uint32Array([seed, 0]);
    }
    copy() {
        const gen = new Smush32();
        gen.buffer.set(this.buffer);
        return gen;
    }
    seed(s) {
        this.buffer.set([s, 0]);
        return this;
    }
    int() {
        const b = this.buffer;
        const m = 0x5bd1e995;
        const k = (b[1]++ * m) >>> 0;
        const s = (b[0] = ((k ^ (k >> 24) ^ ((b[0] * m) >>> 0)) * m) >>> 0);
        return (s ^ (s >>> 13)) >>> 0;
    }
}

export { SYSTEM, Smush32 };
//# sourceMappingURL=random.js.map
