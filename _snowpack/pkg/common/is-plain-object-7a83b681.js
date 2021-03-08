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

export { isPlainObject as i };
//# sourceMappingURL=is-plain-object-7a83b681.js.map
