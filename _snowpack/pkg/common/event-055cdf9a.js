import { S as Subscription, o as optsWithID, a as State } from './subscription-3ccab2d1.js';
import { i as isFirstOrLastInput } from './checks-bec761b0.js';
import { S as Stream } from './stream-f3489f1b.js';

/**
 * Returns a new {@link StreamMerge} subscription, consuming values from
 * multiple inputs and passing received values on to any subscribers.
 *
 * @remarks
 * Input streams can be added and removed dynamically. By default,
 * `StreamMerge` calls {@link ISubscriber.done} when the last active
 * input is done, but this behavior can be overridden via the provided
 * {@link StreamMergeOpts | options}.
 *
 * @example
 * ```ts
 * merge({
 *     // input streams w/ different frequencies
 *     src: [
 *         fromIterable([1, 2, 3], { delay: 10 }),
 *         fromIterable([10, 20, 30], { delay: 21 }),
 *         fromIterable([100, 200, 300], { delay: 7 })
 *     ]
 * }).subscribe(trace());
 * // 100
 * // 1
 * // 200
 * // 10
 * // 2
 * // 300
 * // 3
 * // 20
 * // 30
 * ```
 *
 * @example
 * Use the {@link @thi.ng/transducers#(labeled:1)} transducer for each
 * input to create a stream of labeled values and track their provenance:
 *
 * @example
 * ```ts
 * merge({
 *     src: [
 *         fromIterable([1, 2, 3]).transform(tx.labeled("a")),
 *         fromIterable([10, 20, 30]).transform(tx.labeled("b")),
 *     ]
 * }).subscribe(trace());
 * // ["a", 1]
 * // ["b", 10]
 * // ["a", 2]
 * // ["b", 20]
 * // ["a", 3]
 * // ["b", 30]
 * ```
 *
 * @param opts -
 */
const merge = (opts) => new StreamMerge(opts);
class StreamMerge extends Subscription {
    constructor(opts) {
        opts = opts || {};
        super(undefined, optsWithID("streammerge", opts));
        this.sources = new Map();
        opts.src && this.addAll(opts.src);
    }
    add(src) {
        this.ensureState();
        this.sources.set(src, src.subscribe({
            next: (x) => x instanceof Subscription ? this.add(x) : this.next(x),
            done: () => this.markDone(src),
            __owner: this,
        }, { id: `in-${src.id}` }));
    }
    addAll(src) {
        for (let s of src) {
            this.add(s);
        }
    }
    remove(src) {
        const sub = this.sources.get(src);
        if (sub) {
            this.sources.delete(src);
            sub.unsubscribe();
            return true;
        }
        return false;
    }
    removeID(id) {
        for (let s of this.sources) {
            if (s[0].id === id) {
                return this.remove(s[0]);
            }
        }
        return false;
    }
    removeAll(src) {
        let ok = true;
        for (let s of src) {
            ok = this.remove(s) && ok;
        }
        return ok;
    }
    removeAllIDs(ids) {
        let ok = true;
        for (let id of ids) {
            ok = this.removeID(id) && ok;
        }
        return ok;
    }
    unsubscribe(sub) {
        if (!sub) {
            for (let s of this.sources.values()) {
                s.unsubscribe();
            }
            this.state = State.DONE;
            this.sources.clear();
        }
        return super.unsubscribe(sub);
    }
    markDone(src) {
        this.remove(src);
        isFirstOrLastInput(this.closeIn, this.sources.size) && this.done();
    }
}

/**
 * Creates a {@link Stream} of events attached to given element / event
 * target and using given event listener options (same as supported by
 * `addEventListener()`, default: false).
 *
 * @param src - event target
 * @param name - event name
 * @param listenerOpts - listener opts
 * @param streamOpts - stream opts
 */
const fromEvent = (src, name, listenerOpts = false, streamOpts) => new Stream((stream) => {
    let listener = (e) => stream.next(e);
    src.addEventListener(name, listener, listenerOpts);
    return () => src.removeEventListener(name, listener, listenerOpts);
}, optsWithID(`event-${name}`, streamOpts));
/**
 * Same as {@link fromEvent}, however only supports well-known DOM event
 * names. Returned stream instance will use corresponding concrete event
 * type in its type signature, whereas {@link fromEvent} will only use the
 * generic `Event`.
 *
 * @example
 * ```ts
 * fromDOMEvent(document.body, "mousemove"); // Stream<MouseEvent>
 * fromEvent(document.body, "mousemove"); // Stream<Event>
 * ```
 *
 * Also see: {@link fromEvent}
 *
 * @param src -
 * @param name -
 * @param listenerOpts -
 * @param streamOpts -
 */
const fromDOMEvent = (src, name, listenerOpts = false, streamOpts) => fromEvent(src, name, listenerOpts, streamOpts);

export { fromDOMEvent as f, merge as m };
//# sourceMappingURL=event-055cdf9a.js.map
