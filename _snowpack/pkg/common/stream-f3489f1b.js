import { S as Subscription, o as optsWithID, C as CloseMode, L as LOGGER, i as isFunction } from './subscription-3ccab2d1.js';

/**
 * Syntax sugar for {@link stream}. Creates new stream which is
 * immediately seeded with initial `val` and configured with optional
 * `opts`.
 *
 * @param val -
 * @param opts -
 */
const reactive = (val, opts) => {
    const res = new Stream(opts);
    res.next(val);
    return res;
};
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

export { Stream as S, reactive as r };
//# sourceMappingURL=stream-f3489f1b.js.map
