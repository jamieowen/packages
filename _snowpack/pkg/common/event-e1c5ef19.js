const isFunction = (x) => typeof x === "function";

const implementsFunction = (x, fn) => x != null && typeof x[fn] === "function";

const isIterable = (x) => x != null && typeof x[Symbol.iterator] === "function";

const OBJP = Object.getPrototypeOf;
/**
 * Similar to {@link isObject}, but also checks if prototype is that of
 * `Object` (or `null`).
 *
 * @param x -
 */
const isPlainObject = (x) => {
    let p;
    return (x != null &&
        typeof x === "object" &&
        ((p = OBJP(x)) === null || OBJP(p) === null));
};

var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["FINE"] = 0] = "FINE";
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["SEVERE"] = 4] = "SEVERE";
    LogLevel[LogLevel["NONE"] = 5] = "NONE";
})(LogLevel || (LogLevel = {}));

/**
 * Internal use only. **Do NOT use in user land code!**
 *
 * @internal
 */
const SEMAPHORE = Symbol();
/**
 * No-effect placeholder function.
 */
const NO_OP = () => { };

const NULL_LOGGER = Object.freeze({
    level: LogLevel.NONE,
    fine() { },
    debug() { },
    info() { },
    warn() { },
    severe() { },
});

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

const ensureTransducer = (x) => implementsFunction(x, "xform")
    ? x.xform()
    : x;

class Reduced {
    constructor(val) {
        this.value = val;
    }
    deref() {
        return this.value;
    }
}
const isReduced = (x) => x instanceof Reduced;
const unreduced = (x) => (x instanceof Reduced ? x.deref() : x);

const defError = (prefix, suffix = (msg) => (msg !== undefined ? ": " + msg : "")) => class extends Error {
    constructor(msg) {
        super(prefix(msg) + suffix(msg));
    }
};

const IllegalArityError = defError(() => "illegal arity");
const illegalArity = (n) => {
    throw new IllegalArityError(n);
};

const IllegalStateError = defError(() => "illegal state");
const illegalState = (msg) => {
    throw new IllegalStateError(msg);
};

/**
 * Convenience helper for building a full {@link Reducer} using the identity
 * function (i.e. `(x) => x`) as completion step (true for 90% of all
 * bundled transducers).
 *
 * @param init - init step of reducer
 * @param rfn - reduction step of reducer
 */
const reducer = (init, rfn) => [init, (acc) => acc, rfn];

function push(xs) {
    return xs
        ? [...xs]
        : reducer(() => [], (acc, x) => (acc.push(x), acc));
}

/**
 * Optimized version of {@link iterator} for transducers which are
 * guaranteed to:
 *
 * 1) Only produce none or a single result per input
 * 2) Do not require a `completion` reduction step
 *
 * @param xform -
 * @param xs -
 */
function* iterator1(xform, xs) {
    const reduce = (ensureTransducer(xform)([NO_OP, NO_OP, (_, x) => x]))[2];
    for (let x of xs) {
        let y = reduce(SEMAPHORE, x);
        if (isReduced(y)) {
            y = unreduced(y.deref());
            if (y !== SEMAPHORE) {
                yield y;
            }
            return;
        }
        if (y !== SEMAPHORE) {
            yield y;
        }
    }
}

/**
 * Reducer composition helper, internally used by various transducers
 * during initialization. Takes existing reducer `rfn` (a 3-tuple) and a
 * reducing function `fn`. Returns a new reducer tuple.
 *
 * @remarks
 * `rfn[2]` reduces values of type `B` into an accumulator of type `A`.
 * `fn` accepts values of type `C` and produces interim results of type
 * `B`, which are then (possibly) passed to the "inner" `rfn[2]`
 * function. Therefore the resulting reducer takes inputs of `C` and an
 * accumulator of type `A`.
 *
 * It is assumed that `fn` internally calls `rfn[2]` to pass its own
 * results for further processing by the nested reducer `rfn`.
 *
 * @example
 * ```ts
 * compR(rfn, fn)
 * // [rfn[0], rfn[1], fn]
 * ```
 *
 * @param rfn -
 * @param fn -
 */
const compR = (rfn, fn) => [rfn[0], rfn[1], fn];

function map(fn, src) {
    return isIterable(src)
        ? iterator1(map(fn), src)
        : (rfn) => {
            const r = rfn[2];
            return compR(rfn, (acc, x) => r(acc, fn(x)));
        };
}

function comp(...fns) {
    let [a, b, c, d, e, f, g, h, i, j] = fns;
    switch (fns.length) {
        case 0:
            illegalArity(0);
        case 1:
            return a;
        case 2:
            return (...xs) => a(b(...xs));
        case 3:
            return (...xs) => a(b(c(...xs)));
        case 4:
            return (...xs) => a(b(c(d(...xs))));
        case 5:
            return (...xs) => a(b(c(d(e(...xs)))));
        case 6:
            return (...xs) => a(b(c(d(e(f(...xs))))));
        case 7:
            return (...xs) => a(b(c(d(e(f(g(...xs)))))));
        case 8:
            return (...xs) => a(b(c(d(e(f(g(h(...xs))))))));
        case 9:
            return (...xs) => a(b(c(d(e(f(g(h(i(...xs)))))))));
        case 10:
        default:
            const fn = (...xs) => a(b(c(d(e(f(g(h(i(j(...xs))))))))));
            return fns.length === 10 ? fn : comp(fn, ...fns.slice(10));
    }
}

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

function comp$1(...fns) {
    fns = fns.map(ensureTransducer);
    return comp.apply(null, fns);
}

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
            ? this.subscribe(comp$1(...xf.slice(0, n)), xf[n])
            : this.subscribe(comp$1(...xf));
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

/**
 * Returns true if mode is FIRST, or if mode is LAST *and* `num = 0`.
 *
 * @internal
 */
const isFirstOrLastInput = (mode, num) => mode === CloseMode.FIRST || (mode === CloseMode.LAST && !num);

class Stream extends Subscription {
    // prettier-ignore
    constructor(src, opts) {
        const [_src, _opts] = isFunction(src) ? [src, opts] : [undefined, src];
        super(undefined, optsWithID("stream", _opts));
        this.src = _src;
        this._inited = false;
    }
    subscribe(...args) {
        const wrapped = super.subscribe.apply(this, args);
        if (!this._inited) {
            this._cancel = (this.src && this.src(this)) || (() => void 0);
            this._inited = true;
        }
        return wrapped;
    }
    unsubscribe(sub) {
        const res = super.unsubscribe(sub);
        if (res &&
            (!sub ||
                ((!this.subs || !this.subs.length) &&
                    this.closeOut !== CloseMode.NEVER))) {
            this.cancel();
        }
        return res;
    }
    done() {
        this.cancel();
        super.done();
        delete this.src;
        delete this._cancel;
    }
    error(e) {
        super.error(e);
        this.cancel();
    }
    cancel() {
        if (this._cancel) {
            LOGGER.debug(this.id, "cancel");
            const f = this._cancel;
            delete this._cancel;
            f();
        }
    }
}

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

export { Stream as S, map as a, fromDOMEvent as f, merge as m };
