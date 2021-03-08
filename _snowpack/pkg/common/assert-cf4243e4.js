import { p as process } from './_node-resolve_empty-7606bff8.js';
import { N as NO_OP } from './map-3e2f222d.js';

/**
 * Takes a `test` result or predicate function without args and throws
 * error with given `msg` if test failed (i.e. is falsy).
 *
 * @remarks
 * The function is only enabled if `"production" != "production"`
 * or if the `UMBRELLA_ASSERTS` env var is set to 1.
 */
const assert = (() => {
    try {
        return ("production" !== "production" ||
            process.env.UMBRELLA_ASSERTS === "1");
    }
    catch (e) { }
    return false;
})()
    ? (test, msg = "assertion failed") => {
        if ((typeof test === "function" && !test()) || !test) {
            throw new Error(typeof msg === "function" ? msg() : msg);
        }
    }
    : NO_OP;

export { assert as a };
//# sourceMappingURL=assert-cf4243e4.js.map
