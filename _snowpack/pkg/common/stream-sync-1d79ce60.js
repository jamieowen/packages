import { i as isFunction, b as illegalState, S as Subscription, o as optsWithID, L as LOGGER, a as State } from './subscription-3ccab2d1.js';
import { i as isFirstOrLastInput } from './checks-bec761b0.js';
import { d as isIterable, f as iterator1, m as map, $ as $iter, c as iterator, b as isReduced } from './map-3e2f222d.js';
import { i as isArray } from './is-array-065cc62f.js';
import { c as comp } from './comp-e3b62542.js';

const identity = (x) => x;

function labeled(id, src) {
    return isIterable(src)
        ? iterator1(labeled(id), src)
        : map(isFunction(id) ? (x) => [id(x), x] : (x) => [id, x]);
}

function mapVals(...args) {
    const iter = $iter(mapVals, args);
    if (iter) {
        return iter;
    }
    const fn = args[0];
    const copy = args[1] !== false;
    return map((x) => {
        const res = copy ? {} : x;
        for (let k in x) {
            res[k] = fn(x[k]);
        }
        return res;
    });
}

function partitionSync(...args) {
    const iter = $iter(partitionSync, args, iterator);
    if (iter)
        return iter;
    const { key, mergeOnly, reset, all, backPressure } = Object.assign({ key: identity, mergeOnly: false, reset: true, all: true, backPressure: 0 }, args[1]);
    const requiredKeys = isArray(args[0])
        ? new Set(args[0])
        : args[0];
    const currKeys = new Set();
    const cache = new Map();
    let curr = {};
    const xform = ([init, complete, reduce]) => {
        let first = true;
        if (mergeOnly || backPressure < 1) {
            return [
                init,
                (acc) => {
                    if ((reset && all && currKeys.size > 0) ||
                        (!reset && first)) {
                        acc = reduce(acc, curr);
                        curr = {};
                        currKeys.clear();
                        first = false;
                    }
                    return complete(acc);
                },
                (acc, x) => {
                    const k = key(x);
                    if (requiredKeys.has(k)) {
                        curr[k] = x;
                        currKeys.add(k);
                        if (mergeOnly ||
                            requiredInputs(requiredKeys, currKeys)) {
                            acc = reduce(acc, curr);
                            first = false;
                            if (reset) {
                                curr = {};
                                currKeys.clear();
                            }
                            else {
                                curr = Object.assign({}, curr);
                            }
                        }
                    }
                    return acc;
                },
            ];
        }
        else {
            // with backpressure / caching...
            return [
                init,
                (acc) => {
                    if (all && currKeys.size > 0) {
                        acc = reduce(acc, collect(cache, currKeys));
                        cache.clear();
                        currKeys.clear();
                    }
                    return complete(acc);
                },
                (acc, x) => {
                    const k = key(x);
                    if (requiredKeys.has(k)) {
                        let slot = cache.get(k);
                        !slot && cache.set(k, (slot = []));
                        slot.length >= backPressure &&
                            illegalState(`max back pressure (${backPressure}) exceeded for input: ${String(k)}`);
                        slot.push(x);
                        currKeys.add(k);
                        while (requiredInputs(requiredKeys, currKeys)) {
                            acc = reduce(acc, collect(cache, currKeys));
                            first = false;
                            if (isReduced(acc))
                                break;
                        }
                    }
                    return acc;
                },
            ];
        }
    };
    xform.keys = () => requiredKeys;
    xform.clear = () => {
        cache.clear();
        requiredKeys.clear();
        currKeys.clear();
        curr = {};
    };
    xform.add = (id) => {
        requiredKeys.add(id);
    };
    xform.delete = (id, clean = true) => {
        cache.delete(id);
        requiredKeys.delete(id);
        if (clean) {
            currKeys.delete(id);
            delete curr[id];
        }
    };
    return xform;
}
const requiredInputs = (required, curr) => {
    if (curr.size < required.size)
        return false;
    for (let id of required) {
        if (!curr.has(id))
            return false;
    }
    return true;
};
const collect = (cache, currKeys) => {
    const curr = {};
    for (let id of currKeys) {
        const slot = cache.get(id);
        curr[id] = slot.shift();
        !slot.length && currKeys.delete(id);
    }
    return curr;
};

/**
 * Similar to {@link StreamMerge}, but with extra synchronization of inputs.
 * Before emitting any new values, {@link StreamSync} collects values until at
 * least one has been received from *all* inputs. Once that's the case, the
 * collected values are sent as labeled tuple object to downstream subscribers.
 *
 * @remarks
 * Each value in the emitted tuple objects is stored under their input stream's
 * ID. Only the last value received from each input is passed on. After the
 * initial tuple has been emitted, you can choose from two possible behaviors:
 *
 * 1) Any future change in any input will produce a new result tuple. These
 *    tuples will retain the most recently read values from other inputs. This
 *    behavior is the default and illustrated in the above schematic.
 * 2) If the `reset` option is `true`, every input will have to provide at least
 *    one new value again until another result tuple is produced.
 *
 * Any done inputs are automatically removed. By default, `StreamSync` calls
 * {@link ISubscriber.done} when the last active input is done, but this
 * behavior can be overridden via the provided options.
 *
 * Input streams can be added and removed dynamically and the emitted tuple size
 * adjusts to the current number of inputs (the next time a value is received
 * from any input). After an input is removed (or done) its last received value
 * can also be removed from the result tuple. This behavior can be configured
 * via the `clean` option given to `sync()` (disabled by default).
 *
 * If the `reset` option is enabled, the last emitted tuple is allowed to be
 * incomplete, by default. To only allow complete tuples, also set the `all`
 * option to `false`.
 *
 * The synchronization is done via the
 * {@link @thi.ng/transducers#(partitionSync:1)} transducer from the
 * {@link @thi.ng/transducers# | @thi.ng/transducers} package. See this
 * function's docs for further details.
 *
 * @example
 * ```ts
 * const a = stream();
 * const b = stream();
 * s = sync({ src: { a, b } }).subscribe(trace("result: "));
 * a.next(1);
 * b.next(2);
 * // result: { a: 1, b: 2 }
 * ```
 *
 * Also see: {@link StreamSyncOpts}
 *
 * @param opts -
 */
const sync = (opts) => new StreamSync(opts);
class StreamSync extends Subscription {
    constructor(opts) {
        const psync = partitionSync(new Set(), {
            key: (x) => x[0],
            mergeOnly: opts.mergeOnly === true,
            reset: opts.reset === true,
            all: opts.all !== false,
            backPressure: opts.backPressure || 0,
        });
        const mapv = mapVals((x) => x[1]);
        super(undefined, optsWithID("streamsync", Object.assign(Object.assign({}, opts), { xform: opts.xform
                ? comp(psync, mapv, opts.xform)
                : comp(psync, mapv) })));
        this.sources = new Map();
        this.realSourceIDs = new Map();
        this.invRealSourceIDs = new Map();
        this.idSources = new Map();
        this.psync = psync;
        this.clean = !!opts.clean;
        opts.src && this.addAll(opts.src);
    }
    add(src, id) {
        id || (id = src.id);
        this.ensureState();
        this.psync.add(id);
        this.realSourceIDs.set(id, src.id);
        this.invRealSourceIDs.set(src.id, id);
        this.idSources.set(src.id, src);
        this.sources.set(src, src.subscribe({
            next: (x) => 
            // if received value is sub, add it as source
            x[1] instanceof Subscription
                ? this.add(x[1])
                : this.next(x),
            done: () => this.markDone(src),
            __owner: this,
        }, labeled(id), { id: `in-${id}` }));
    }
    addAll(src) {
        // pre-add all source ids for partitionSync
        for (let id in src) {
            this.psync.add(id);
        }
        for (let id in src) {
            this.add(src[id], id);
        }
    }
    remove(src) {
        const sub = this.sources.get(src);
        if (sub) {
            const id = this.invRealSourceIDs.get(src.id);
            LOGGER.info(`removing src: ${src.id} (${id})`);
            this.psync.delete(id, this.clean);
            this.realSourceIDs.delete(id);
            this.invRealSourceIDs.delete(src.id);
            this.idSources.delete(src.id);
            this.sources.delete(src);
            sub.unsubscribe();
            return true;
        }
        return false;
    }
    removeID(id) {
        const src = this.getSourceForID(id);
        return src ? this.remove(src) : false;
    }
    removeAll(src) {
        // pre-remove all source ids for partitionSync
        for (let s of src) {
            this.psync.delete(this.invRealSourceIDs.get(s.id));
        }
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
    getSourceForID(id) {
        return this.idSources.get(this.realSourceIDs.get(id));
    }
    getSources() {
        const res = {};
        for (let [id, src] of this.idSources) {
            res[this.invRealSourceIDs.get(id)] = src;
        }
        return res;
    }
    unsubscribe(sub) {
        if (!sub) {
            for (let s of this.sources.values()) {
                s.unsubscribe();
            }
            this.state = State.DONE;
            this.sources.clear();
            this.psync.clear();
            this.realSourceIDs.clear();
            this.invRealSourceIDs.clear();
            this.idSources.clear();
        }
        return super.unsubscribe(sub);
    }
    markDone(src) {
        this.remove(src);
        isFirstOrLastInput(this.closeIn, this.sources.size) && this.done();
    }
}

export { sync as s };
//# sourceMappingURL=stream-sync-1d79ce60.js.map
