import { N as NULL_LOGGER } from './logger-b7639346.js';
import { S as SEMAPHORE, p as push, i as illegalArity, a as implementsFunction, m as map, u as unreduced, b as isReduced } from './map-3e2f222d.js';
import { i as isPlainObject } from './is-plain-object-7a83b681.js';
import { c as comp } from './comp-e3b62542.js';
import { d as defError } from './deferror-99934d1f.js';

const isFunction = (x) => typeof x === "function";

var State;
(function (State) {
    State[State["IDLE"] = 0] = "IDLE";
    State[State["ACTIVE"] = 1] = "ACTIVE";
    State[State["DONE"] = 2] = "DONE";
    State[State["ERROR"] = 3] = "ERROR";
    State[State["DISABLED"] = 4] = "DISABLED";
})(State || (State = {}));
/**
 * Closing behaviors.
 */
var CloseMode;
(function (CloseMode) {
    /**
     * Never close, even if no more inputs/outputs.
     */
    CloseMode[CloseMode["NEVER"] = 0] = "NEVER";
    /**
     * Close when first input/output is done / removed.
     */
    CloseMode[CloseMode["FIRST"] = 1] = "FIRST";
    /**
     * Close when last input/output is done / removed.
     */
    CloseMode[CloseMode["LAST"] = 2] = "LAST";
})(CloseMode || (CloseMode = {}));
let LOGGER = NULL_LOGGER;

const IllegalStateError = defError(() => "illegal state");
const illegalState = (msg) => {
    throw new IllegalStateError(msg);
};

/**
 * Returns first element of given array or `undefined` if array is empty.
 *
 * @param buf - array
 */
/**
 * Returns last element of given array or `undefined` if array is empty.
 *
 * @param buf - array
 */
const peek = (buf) => buf[buf.length - 1];

let NEXT_ID = 0;
const nextID = () => NEXT_ID++;
const optsWithID = (prefix, opts) => ((!opts || !opts.id ? Object.assign(Object.assign({}, opts), { id: prefix + "-" + nextID() }) : opts));

/**
 * Creates a new {@link Subscription} instance, the fundamental datatype
 * and building block provided by this package.
 *
 * @remarks
 * Most other types in rstream, including {@link Stream}s, are
 * `Subscription`s and all can be:
 *
 * - connected into directed graphs (sync or async & not necessarily
 *   DAGs)
 * - transformed using transducers (incl. support for early termination)
 * - can have any number of subscribers (optionally each w/ their own
 *   transducers)
 * - recursively unsubscribe themselves from parent after their last
 *   subscriber unsubscribed (configurable)
 * - will go into a non-recoverable error state if none of the
 *   subscribers has an error handler itself
 * - implement the {@link @thi.ng/api#IDeref} interface
 *
 * If a transducer is provided (via the `xform` option), all received
 * values will be first processed by the transducer and only its
 * transformed result(s) (if any) will be passed to downstream
 * subscribers. Any uncaught errors *inside* the transducer will cause
 * this subscription's error handler to be called and will stop this
 * subscription from receiving any further values (by default, unless
 * overridden).
 *
 * Subscription behavior can be customized via the additional (optional)
 * options arg. See {@link CommonOpts} and {@link SubscriptionOpts} for
 * further details.
 *
 * @example
 * ```ts
 * // as reactive value mechanism (same as with stream() above)
 * s = subscription();
 * s.subscribe(trace("s1"));
 * s.subscribe(trace("s2"), { xform: tx.filter((x) => x > 25) });
 *
 * // external trigger
 * s.next(23);
 * // s1 23
 * s.next(42);
 * // s1 42
 * // s2 42
 * ```
 *
 * @param sub -
 * @param opts -
 */
const subscription = (sub, opts) => new Subscription(sub, opts);
class Subscription {
    constructor(sub, opts = {}) {
        this.state = State.IDLE;
        this.parent = opts.parent;
        this.closeIn =
            opts.closeIn !== undefined ? opts.closeIn : CloseMode.LAST;
        this.closeOut =
            opts.closeOut !== undefined ? opts.closeOut : CloseMode.LAST;
        this.cacheLast = opts.cache !== false;
        this.id = opts.id || `sub-${nextID()}`;
        this.last = SEMAPHORE;
        this.subs = [];
        if (sub) {
            this.subs.push(sub);
        }
        if (opts.xform) {
            this.xform = opts.xform(push());
        }
    }
    deref() {
        return this.last !== SEMAPHORE ? this.last : undefined;
    }
    getState() {
        return this.state;
    }
    subscribe(...args) {
        this.ensureState();
        let sub;
        !peek(args) && args.pop();
        const opts = args.length > 1 && isPlainObject(peek(args))
            ? Object.assign({}, args.pop()) : {};
        switch (args.length) {
            case 1:
                if (isFunction(args[0])) {
                    opts.xform = args[0];
                    !opts.id && (opts.id = `xform-${nextID()}`);
                }
                else {
                    sub = args[0];
                }
                break;
            case 2:
                sub = args[0];
                opts.xform = args[1];
                break;
            default:
                illegalArity(args.length);
        }
        if (implementsFunction(sub, "subscribe") && !opts.xform) {
            sub.parent = this;
        }
        else {
            // FIXME inherit options from this sub or defaults?
            sub = subscription(sub, Object.assign({ parent: this }, opts));
        }
        this.last !== SEMAPHORE && sub.next(this.last);
        return this.addWrapped(sub);
    }
    /**
     * Returns array of new child subscriptions for all given
     * subscribers.
     *
     * @param subs -
     */
    subscribeAll(...subs) {
        const wrapped = [];
        for (let s of subs) {
            wrapped.push(this.subscribe(s));
        }
        return wrapped;
    }
    transform(...xf) {
        const n = xf.length - 1;
        return isPlainObject(xf[n])
            ? this.subscribe(comp(...xf.slice(0, n)), xf[n])
            : this.subscribe(comp(...xf));
    }
    /**
     * Syntax sugar for {@link Subscription.transform} when using a
     * single {@link @thi.ng/transducers#map} transducer only. The given
     * function `fn` is used as `map`'s transformation fn.
     *
     * @param fn
     * @param opts
     */
    map(fn, opts) {
        return this.subscribe(map(fn), opts);
    }
    /**
     * If called without arg, removes this subscription from parent (if
     * any), cleans up internal state and goes into DONE state. If
     * called with arg, removes the sub from internal pool and if no
     * other subs are remaining also cleans up itself and goes into DONE
     * state.
     *
     * @param sub -
     */
    unsubscribe(sub) {
        LOGGER.debug(this.id, "unsub start", sub ? sub.id : "self");
        if (!sub) {
            let res = true;
            if (this.parent) {
                res = this.parent.unsubscribe(this);
            }
            this.state = State.DONE;
            this.cleanup();
            return res;
        }
        LOGGER.debug(this.id, "unsub child", sub.id);
        const idx = this.subs.indexOf(sub);
        if (idx >= 0) {
            this.subs.splice(idx, 1);
            if (this.closeOut === CloseMode.FIRST ||
                (!this.subs.length && this.closeOut !== CloseMode.NEVER)) {
                this.unsubscribe();
            }
            return true;
        }
        return false;
    }
    next(x) {
        if (this.state < State.DONE) {
            if (this.xform) {
                let acc;
                try {
                    acc = this.xform[2]([], x);
                }
                catch (e) {
                    this.error(e);
                    return;
                }
                const uacc = unreduced(acc);
                const n = uacc.length;
                for (let i = 0; i < n; i++) {
                    this.dispatch(uacc[i]);
                }
                isReduced(acc) && this.done();
            }
            else {
                this.dispatch(x);
            }
        }
    }
    done() {
        LOGGER.debug(this.id, "entering done()");
        if (this.state < State.DONE) {
            try {
                if (this.xform) {
                    const acc = this.xform[1]([]);
                    const uacc = unreduced(acc);
                    const n = uacc.length;
                    for (let i = 0; i < n; i++) {
                        this.dispatch(uacc[i]);
                    }
                }
            }
            catch (e) {
                this.error(e);
                return;
            }
            this.state = State.DONE;
            for (let s of this.subs.slice()) {
                try {
                    s.done && s.done();
                }
                catch (e) {
                    s.error ? s.error(e) : this.error(e);
                }
            }
            this.unsubscribe();
            LOGGER.debug(this.id, "exiting done()");
        }
    }
    error(e) {
        this.state = State.ERROR;
        const subs = this.subs;
        let notified = false;
        if (subs.length) {
            for (let s of subs.slice()) {
                if (s.error) {
                    s.error(e);
                    notified = true;
                }
            }
        }
        if (!notified) {
            LOGGER.warn(this.id, "unhandled error:", e);
            if (this.parent) {
                LOGGER.debug(this.id, "unsubscribing...");
                this.unsubscribe();
                this.state = State.ERROR;
            }
        }
    }
    addWrapped(wrapped) {
        this.subs.push(wrapped);
        this.state = State.ACTIVE;
        return wrapped;
    }
    dispatch(x) {
        // LOGGER.debug(this.id, "dispatch", x);
        this.cacheLast && (this.last = x);
        const subs = this.subs;
        let n = subs.length;
        let s;
        if (n === 1) {
            s = subs[0];
            try {
                s.next && s.next(x);
            }
            catch (e) {
                s.error ? s.error(e) : this.error(e);
            }
        }
        else {
            for (; --n >= 0;) {
                s = subs[n];
                try {
                    s.next && s.next(x);
                }
                catch (e) {
                    s.error ? s.error(e) : this.error(e);
                }
            }
        }
    }
    ensureState() {
        if (this.state >= State.DONE) {
            illegalState(`operation not allowed in state ${this.state}`);
        }
    }
    cleanup() {
        LOGGER.debug(this.id, "cleanup");
        this.subs.length = 0;
        delete this.parent;
        delete this.xform;
        delete this.last;
    }
}

export { CloseMode as C, LOGGER as L, Subscription as S, State as a, illegalState as b, isFunction as i, optsWithID as o, subscription as s };
//# sourceMappingURL=subscription-3ccab2d1.js.map
