import { S as Stream } from './stream-f3489f1b.js';
import { C as CloseMode, o as optsWithID } from './subscription-3ccab2d1.js';
import { i as isNode } from './is-node-aee4b371.js';

/**
 * Returns a {@link Stream} of monotonically increasing counter values,
 * emitted at given `delay` interval and up to the optionally defined
 * max value (default: ∞), after which the stream is closed.
 *
 * @remarks
 * The stream only starts when the first subscriber becomes available.
 *
 * @param delay -
 * @param opts -
 */
const fromInterval = (delay, opts) => {
    opts = optsWithID("interval", Object.assign({ num: Infinity }, opts));
    return new Stream((stream) => {
        let i = 0;
        let count = opts.num;
        stream.next(i++);
        let id = setInterval(() => {
            stream.next(i++);
            if (--count <= 0) {
                clearInterval(id);
                stream.closeIn !== CloseMode.NEVER && stream.done();
            }
        }, delay);
        return () => clearInterval(id);
    }, opts);
};

/**
 * Yields {@link Stream} of a monotonically increasing counter,
 * triggered by a `requestAnimationFrame()` loop (only available in
 * browser environments).
 *
 * @remarks
 * In NodeJS, this function falls back to {@link fromInterval}, yielding
 * a similar (approx. 60Hz) stream.
 *
 * All subscribers to this stream will be processed during that same
 * loop iteration.
 */
const fromRAF = (opts) => isNode()
    ? fromInterval(16, opts)
    : new Stream((stream) => {
        let i = 0;
        let isActive = true;
        const loop = () => {
            isActive && stream.next(i++);
            isActive && (id = requestAnimationFrame(loop));
        };
        let id = requestAnimationFrame(loop);
        return () => {
            isActive = false;
            cancelAnimationFrame(id);
        };
    }, optsWithID("raf", opts));

export { fromRAF as f };
//# sourceMappingURL=raf-2e2715fc.js.map
