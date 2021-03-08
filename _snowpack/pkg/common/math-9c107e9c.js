import { a as assert } from './assert-cf4243e4.js';
import { b as isVec, c as isMat, e as isTerm, g as gensym, s as sym, f as float, n as numberWithMatchingType } from './item-bc8a12c1.js';
import { a as illegalArgs, b as isString, i as isNumber } from './illegal-arguments-07fc2d96.js';
import { i as isNode } from './is-node-aee4b371.js';
import { m as map, S as SEMAPHORE, a as implementsFunction, r as reduce, j as reducer } from './map-3e2f222d.js';
import { f as filter } from './filter-44dab916.js';
import { i as isArray } from './is-array-065cc62f.js';

const isMap = (x) => x instanceof Map;

/**
 * Class behavior mixin based on:
 * {@link http://raganwald.com/2015/06/26/decorators-in-es7.html}
 *
 * Additionally only injects/overwrites properties in target, which are
 * NOT marked with `@nomixin` (i.e. haven't set their `configurable`
 * property descriptor flag to `false`)
 *
 * @param behaviour - to mixin
 * @param sharedBehaviour -
 * @returns decorator function
 */
const mixin = (behaviour, sharedBehaviour = {}) => {
    const instanceKeys = Reflect.ownKeys(behaviour);
    const sharedKeys = Reflect.ownKeys(sharedBehaviour);
    const typeTag = Symbol("isa");
    function _mixin(clazz) {
        for (let key of instanceKeys) {
            const existing = Object.getOwnPropertyDescriptor(clazz.prototype, key);
            if (!existing || existing.configurable) {
                Object.defineProperty(clazz.prototype, key, {
                    value: behaviour[key],
                    writable: true,
                });
            }
            else {
                console.log(`not patching: ${clazz.name}.${key.toString()}`);
            }
        }
        Object.defineProperty(clazz.prototype, typeTag, { value: true });
        return clazz;
    }
    for (let key of sharedKeys) {
        Object.defineProperty(_mixin, key, {
            value: sharedBehaviour[key],
            enumerable: sharedBehaviour.propertyIsEnumerable(key),
        });
    }
    Object.defineProperty(_mixin, Symbol.hasInstance, {
        value: (x) => !!x[typeTag],
    });
    return _mixin;
};

const OBJP = Object.getPrototypeOf({});
const FN = "function";
const STR = "string";
const equiv = (a, b) => {
    let proto;
    if (a === b) {
        return true;
    }
    if (a != null) {
        if (typeof a.equiv === FN) {
            return a.equiv(b);
        }
    }
    else {
        return a == b;
    }
    if (b != null) {
        if (typeof b.equiv === FN) {
            return b.equiv(a);
        }
    }
    else {
        return a == b;
    }
    if (typeof a === STR || typeof b === STR) {
        return false;
    }
    if (((proto = Object.getPrototypeOf(a)), proto == null || proto === OBJP) &&
        ((proto = Object.getPrototypeOf(b)), proto == null || proto === OBJP)) {
        return equivObject(a, b);
    }
    if (typeof a !== FN &&
        a.length !== undefined &&
        typeof b !== FN &&
        b.length !== undefined) {
        return equivArrayLike(a, b);
    }
    if (a instanceof Set && b instanceof Set) {
        return equivSet$1(a, b);
    }
    if (a instanceof Map && b instanceof Map) {
        return equivMap$1(a, b);
    }
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() === b.getTime();
    }
    if (a instanceof RegExp && b instanceof RegExp) {
        return a.toString() === b.toString();
    }
    // NaN
    return a !== a && b !== b;
};
const equivArrayLike = (a, b, _equiv = equiv) => {
    let l = a.length;
    if (l === b.length) {
        while (--l >= 0 && _equiv(a[l], b[l]))
            ;
    }
    return l < 0;
};
const equivSet$1 = (a, b, _equiv = equiv) => a.size === b.size && _equiv([...a.keys()].sort(), [...b.keys()].sort());
const equivMap$1 = (a, b, _equiv = equiv) => a.size === b.size && _equiv([...a].sort(), [...b].sort());
const equivObject = (a, b, _equiv = equiv) => {
    if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
    }
    for (let k in a) {
        if (!b.hasOwnProperty(k) || !_equiv(a[k], b[k])) {
            return false;
        }
    }
    return true;
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function dissoc(coll, keys) {
    for (let k of keys) {
        coll.delete(k);
    }
    return coll;
}

const equivMap = (a, b) => {
    if (a === b) {
        return true;
    }
    if (!(b instanceof Map) || a.size !== b.size) {
        return false;
    }
    for (let p of a.entries()) {
        if (!equiv(b.get(p[0]), p[1])) {
            return false;
        }
    }
    return true;
};
const equivSet = (a, b) => {
    if (a === b) {
        return true;
    }
    if (!(b instanceof Set) || a.size !== b.size) {
        return false;
    }
    for (let k of a.keys()) {
        if (!b.has(k)) {
            return false;
        }
    }
    return true;
};

const inspect = isNode() ? require("util").inspect : null;
const inspectSet = (coll, opts) => [...map((x) => inspect(x, opts), coll)].join(", ");
const inspectMap = (coll, opts) => [
    ...map(([k, v]) => `${inspect(k, opts)} => ${inspect(v, opts)}`, coll),
].join(", ");
/**
 * NodeJS inspection mixin
 *
 * @remarks
 * Reference:
 * https://nodejs.org/api/util.html#util_custom_inspection_functions_on_objects
 *
 * @internal
 */
const inspectable = mixin({
    [Symbol.for("nodejs.util.inspect.custom")](depth, opts) {
        const name = this[Symbol.toStringTag];
        const childOpts = Object.assign(Object.assign({}, opts), { depth: opts.depth === null ? null : opts.depth - 1 });
        return depth >= 0
            ? [
                `${name}(${this.size || 0}) {`,
                inspect
                    ? this instanceof Set
                        ? inspectSet(this, childOpts)
                        : this instanceof Map
                            ? inspectMap(this, childOpts)
                            : ""
                    : "",
                "}",
            ].join(" ")
            : opts.stylize(`[${name}]`, "special");
    },
});

function into(dest, src) {
    if (isMap(dest)) {
        for (let x of src) {
            dest.set(x[0], x[1]);
        }
    }
    else {
        for (let x of src) {
            dest.add(x);
        }
    }
    return dest;
}

var ArraySet_1;
const __private$1 = new WeakMap();
const __vals = (inst) => __private$1.get(inst).vals;
/**
 * An alternative set implementation to the native ES6 Set type. Uses
 * customizable equality/equivalence predicate and so is more useful
 * when dealing with structured data. Implements full API of native Set
 * and by the default uses {@link @thi.ng/equiv#equiv} for equivalence
 * checking.
 *
 * Additionally, the type also implements the {@link @thi.ng/api#ICopy},
 * {@link @thi.ng/api#IEmpty} and {@link @thi.ng/api#IEquiv} interfaces
 * itself.
 */
let ArraySet = ArraySet_1 = class ArraySet extends Set {
    constructor(vals, opts = {}) {
        super();
        __private$1.set(this, { equiv: opts.equiv || equiv, vals: [] });
        vals && this.into(vals);
    }
    *[Symbol.iterator]() {
        yield* __vals(this);
    }
    get [Symbol.species]() {
        return ArraySet_1;
    }
    get [Symbol.toStringTag]() {
        return "ArraySet";
    }
    get size() {
        return __vals(this).length;
    }
    copy() {
        const $this = __private$1.get(this);
        const s = new ArraySet_1(null, { equiv: $this.equiv });
        __private$1.get(s).vals = $this.vals.slice();
        return s;
    }
    empty() {
        return new ArraySet_1(null, this.opts());
    }
    clear() {
        __vals(this).length = 0;
    }
    first() {
        if (this.size) {
            return __vals(this)[0];
        }
    }
    add(key) {
        !this.has(key) && __vals(this).push(key);
        return this;
    }
    into(keys) {
        return into(this, keys);
    }
    has(key) {
        return this.get(key, SEMAPHORE) !== SEMAPHORE;
    }
    /**
     * Returns the canonical value for `x`, if present. If the set
     * contains no equivalent for `x`, returns `notFound`.
     *
     * @param key - search key
     * @param notFound - default value
     */
    get(key, notFound) {
        const $this = __private$1.get(this);
        const eq = $this.equiv;
        const vals = $this.vals;
        for (let i = vals.length; --i >= 0;) {
            if (eq(vals[i], key)) {
                return vals[i];
            }
        }
        return notFound;
    }
    delete(key) {
        const $this = __private$1.get(this);
        const eq = $this.equiv;
        const vals = $this.vals;
        for (let i = vals.length; --i >= 0;) {
            if (eq(vals[i], key)) {
                vals.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    disj(keys) {
        return dissoc(this, keys);
    }
    equiv(o) {
        return equivSet(this, o);
    }
    /**
     * The value args given to the callback `fn` MUST be treated as
     * readonly/immutable. This could be enforced via TS, but would
     * break ES6 Set interface contract.
     *
     * @param fn
     * @param thisArg
     */
    forEach(fn, thisArg) {
        const vals = __vals(this);
        for (let i = vals.length; --i >= 0;) {
            const v = vals[i];
            fn.call(thisArg, v, v, this);
        }
    }
    *entries() {
        for (let v of __vals(this)) {
            yield [v, v];
        }
    }
    *keys() {
        yield* __vals(this);
    }
    *values() {
        yield* __vals(this);
    }
    opts() {
        return { equiv: __private$1.get(this).equiv };
    }
};
ArraySet = ArraySet_1 = __decorate([
    inspectable
], ArraySet);

const copy = (x, ctor) => implementsFunction(x, "copy")
    ? x.copy()
    : new (x[Symbol.species] || ctor)(x);

var EquivMap_1;
const __private = new WeakMap();
const __map = (map) => __private.get(map).map;
let EquivMap = EquivMap_1 = class EquivMap extends Map {
    /**
     * Creates a new instance with optional initial key-value pairs and
     * provided options. If no `opts` are given, uses `ArraySet` for
     * storing canonical keys and {@link @thi.ng/equiv#equiv} for
     * checking key equivalence.
     *
     * @param pairs - key-value pairs
     * @param opts - config options
     */
    constructor(pairs, opts) {
        super();
        const _opts = Object.assign({ equiv, keys: ArraySet }, opts);
        __private.set(this, {
            keys: new _opts.keys(null, { equiv: _opts.equiv }),
            map: new Map(),
            opts: _opts,
        });
        if (pairs) {
            this.into(pairs);
        }
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    get [Symbol.species]() {
        return EquivMap_1;
    }
    get [Symbol.toStringTag]() {
        return "EquivMap";
    }
    get size() {
        return __private.get(this).keys.size;
    }
    clear() {
        const $this = __private.get(this);
        $this.keys.clear();
        $this.map.clear();
    }
    empty() {
        return new EquivMap_1(null, __private.get(this).opts);
    }
    copy() {
        const $this = __private.get(this);
        const m = new EquivMap_1();
        __private.set(m, {
            keys: $this.keys.copy(),
            map: new Map($this.map),
            opts: $this.opts,
        });
        return m;
    }
    equiv(o) {
        return equivMap(this, o);
    }
    delete(key) {
        const $this = __private.get(this);
        key = $this.keys.get(key, SEMAPHORE);
        if (key !== SEMAPHORE) {
            $this.map.delete(key);
            $this.keys.delete(key);
            return true;
        }
        return false;
    }
    dissoc(keys) {
        return dissoc(this, keys);
    }
    /**
     * The key & value args given the callback `fn` MUST be treated as
     * readonly/immutable. This could be enforced via TS, but would
     * break ES6 Map interface contract.
     *
     * @param fn
     * @param thisArg
     */
    forEach(fn, thisArg) {
        for (let pair of __map(this)) {
            fn.call(thisArg, pair[1], pair[0], this);
        }
    }
    get(key, notFound) {
        const $this = __private.get(this);
        key = $this.keys.get(key, SEMAPHORE);
        if (key !== SEMAPHORE) {
            return $this.map.get(key);
        }
        return notFound;
    }
    has(key) {
        return __private.get(this).keys.has(key);
    }
    set(key, value) {
        const $this = __private.get(this);
        const k = $this.keys.get(key, SEMAPHORE);
        if (k !== SEMAPHORE) {
            $this.map.set(k, value);
        }
        else {
            $this.keys.add(key);
            $this.map.set(key, value);
        }
        return this;
    }
    into(pairs) {
        return into(this, pairs);
    }
    entries() {
        return __map(this).entries();
    }
    keys() {
        return __map(this).keys();
    }
    values() {
        return __map(this).values();
    }
    opts() {
        return __private.get(this).opts;
    }
};
EquivMap = EquivMap_1 = __decorate([
    inspectable
], EquivMap);

/**
 * Computes union of sets `a` and `b` and writes results to new set or
 * optionally given set `out` (assumed to be empty for correct results).
 *
 * @param a - first set
 * @param b - other set
 * @param out - result set
 */
const union = (a, b, out) => {
    if (a.size < b.size) {
        const t = a;
        a = b;
        b = t;
    }
    out = out ? into(out, a) : copy(a, Set);
    return a === b ? out : into(out, b);
};

const assign = (l, r) => {
    assert(l.tag !== "swizzle" || l.val.tag === "sym", "can't assign to non-symbol swizzle");
    return {
        tag: "assign",
        type: l.type,
        l,
        r,
    };
};

class DGraph {
    constructor(edges) {
        this.dependencies = new EquivMap();
        this.dependents = new EquivMap();
        if (edges) {
            for (let [a, b] of edges) {
                b != null ? this.addDependency(a, b) : this.addNode(a);
            }
        }
    }
    *[Symbol.iterator]() {
        yield* this.sort();
    }
    get [Symbol.species]() {
        return DGraph;
    }
    copy() {
        const g = new DGraph();
        for (let e of this.dependencies) {
            g.dependencies.set(e[0], e[1].copy());
        }
        for (let e of this.dependents) {
            g.dependents.set(e[0], e[1].copy());
        }
        return g;
    }
    addNode(node) {
        !this.dependencies.has(node) &&
            this.dependencies.set(node, new ArraySet());
        return this;
    }
    addDependency(node, dep) {
        if (equiv(node, dep) || this.depends(dep, node)) {
            illegalArgs(`Circular dependency between: ${node} & ${dep}`);
        }
        let deps = this.dependencies.get(node);
        this.dependencies.set(node, deps ? deps.add(dep) : new ArraySet([dep]));
        deps = this.dependents.get(dep);
        this.dependents.set(dep, deps ? deps.add(node) : new ArraySet([node]));
        return this;
    }
    addDependencies(node, deps) {
        for (let d of deps) {
            this.addDependency(node, d);
        }
    }
    removeEdge(node, dep) {
        let deps = this.dependencies.get(node);
        if (deps) {
            deps.delete(dep);
        }
        deps = this.dependents.get(dep);
        if (deps) {
            deps.delete(node);
        }
        return this;
    }
    removeNode(x) {
        this.dependencies.delete(x);
        return this;
    }
    depends(x, y) {
        return this.transitiveDependencies(x).has(y);
    }
    dependent(x, y) {
        return this.transitiveDependents(x).has(y);
    }
    immediateDependencies(x) {
        return this.dependencies.get(x) || new ArraySet();
    }
    immediateDependents(x) {
        return this.dependents.get(x) || new ArraySet();
    }
    isLeaf(x) {
        return this.immediateDependents(x).size === 0;
    }
    isRoot(x) {
        return this.immediateDependencies(x).size === 0;
    }
    nodes() {
        return union(new ArraySet(this.dependencies.keys()), new ArraySet(this.dependents.keys()));
    }
    leaves() {
        return filter((node) => this.isLeaf(node), this.nodes());
    }
    roots() {
        return filter((node) => this.isRoot(node), this.nodes());
    }
    transitiveDependencies(x) {
        return transitive(this.dependencies, x);
    }
    transitiveDependents(x) {
        return transitive(this.dependents, x);
    }
    sort() {
        const sorted = [];
        const g = this.copy();
        let queue = new ArraySet(g.leaves());
        while (true) {
            if (!queue.size) {
                return sorted.reverse();
            }
            const node = queue.first();
            queue.delete(node);
            for (let d of [...g.immediateDependencies(node)]) {
                g.removeEdge(node, d);
                if (g.isLeaf(d)) {
                    queue.add(d);
                }
            }
            sorted.push(node);
            g.removeNode(node);
        }
    }
}
const transitive = (nodes, x) => {
    const deps = nodes.get(x);
    if (deps) {
        return reduce(reducer(null, (acc, k) => union(acc, transitive(nodes, k))), deps, deps);
    }
    return new ArraySet();
};

/**
 * Helper function for {@link walk}. Returns child nodes for any control
 * flow nodes containing a child scope.
 *
 * {@link allChildren}
 */
const scopedChildren = (t) => t.tag === "fn" || t.tag === "for" || t.tag == "while"
    ? t.scope.body
    : t.tag === "if"
        ? t.f
            ? t.t.body.concat(t.f.body)
            : t.t.body
        : undefined;
/**
 * Helper function for {@link walk}. Returns an array of all child nodes for
 * a given term (if any).
 *
 * {@link scopedChildren}
 */
const allChildren = (t) => scopedChildren(t) ||
    (t.tag === "scope"
        ? t.body
        : t.tag === "ternary"
            ? [t.t, t.f]
            : t.tag === "ret"
                ? [t.val]
                : t.tag === "call" || t.tag === "call_i"
                    ? t.args
                    : t.tag === "sym" && t.init
                        ? [t.init]
                        : t.tag === "decl"
                            ? [t.id]
                            : t.tag === "op1" || t.tag === "swizzle"
                                ? [t.val]
                                : t.tag === "op2"
                                    ? [t.l, t.r]
                                    : t.tag === "assign"
                                        ? [t.r]
                                        : isVec(t) || isMat(t)
                                            ? t.val
                                            : isTerm(t.val)
                                                ? t.val
                                                : undefined);
/**
 * Traverses given AST in depth-first order and applies `visit` and
 * `children` fns to each node. Descends only further if `children`
 * returns an array of child nodes. The `visit` function must accept 2
 * args: the accumulator (`acc`) given to {@link walk} and a tree node. The
 * return value of `visit` becomes the new `acc` value, much like in a
 * reduce operation. {@link walk} itself returns the final `acc`.
 *
 * If `pre` is true (default), the `visit` function will be called prior
 * to visiting a node's children. If false, the visitor is called on the
 * way back up.
 *
 * @param visit -
 * @param children -
 * @param acc -
 * @param tree -
 * @param pre -
 */
const walk = (visit, children, acc, tree, pre = true) => {
    if (isArray(tree)) {
        tree.forEach((x) => (acc = walk(visit, children, acc, x, pre)));
    }
    else {
        pre && (acc = visit(acc, tree));
        const c = children(tree);
        c && (acc = walk(visit, children, acc, c, pre));
        !pre && (acc = visit(acc, tree));
    }
    return acc;
};
/**
 * Builds dependency graph of given function, by recursively adding all
 * function dependencies. Returns graph.
 *
 * @param fn -
 * @param graph -
 */
const buildCallGraph = (fn, graph = new DGraph()) => fn.deps && fn.deps.length
    ? fn.deps.reduce((graph, d) => buildCallGraph(d, graph.addDependency(fn, d)), graph)
    : graph.addNode(fn);
const decl = (id) => ({
    tag: "decl",
    type: id.type,
    id,
});
/**
 * Wraps the given AST node array in `scope` node, optionally as global
 * scope (default false). The interpretation of the global flag is
 * dependent on the target code gen. I.e. for GLSL / JS, the flag
 * disables wrapping the scope's body in `{}`, but else has no
 * difference. In general this node type only serves as internal
 * mechanism for various control flow AST nodes and should not need to
 * be used directly from user land code (though might be useful to
 * create custom / higher level control flow nodes).
 *
 * @param body -
 * @param global -
 */
const scope = (body, global = false) => ({
    tag: "scope",
    type: "void",
    body: (body
        .filter((x) => x != null)
        .map((x) => (x.tag === "sym" ? decl(x) : x))),
    global,
});
/**
 * Takes an array of global sym/var definitions ({@link input},
 * {@link output}, {@link uniform}) and functions defined via
 * {@link (defn:1)}. Constructs the call graph of all transitively used
 * functions and bundles everything in topological order within a global
 * scope object, which is then returned to the user and can be passed to
 * a target codegen for full program output.
 *
 * - {@link scope}
 * - {@link input}
 * - {@link output}
 * - {@link uniform}
 *
 * @param body -
 */
const program = (body) => {
    const syms = body.filter((x) => x.tag !== "fn");
    const g = body.reduce((acc, x) => (x.tag === "fn" ? buildCallGraph(x, acc) : acc), new DGraph());
    return scope(syms.concat(g.sort()), true);
};

const defArg = (a) => {
    const [type, id, opts] = isString(a) ? [a] : a;
    return {
        tag: "arg",
        type,
        id: id || gensym(),
        opts: Object.assign({ q: "in" }, opts),
    };
};
// prettier-ignore
function defn(type, id, _args, _body) {
    id = id || gensym();
    const args = _args.map(defArg);
    const body = (_body(...args.map((x) => sym(x.type, x.id, x.opts))).filter((x) => x != null));
    // count & check returns
    const returns = walk((n, t) => {
        if (t.tag === "ret") {
            assert(t.type === type, `wrong return type for function '${id}', expected ${type}, got ${t.type}`);
            n++;
        }
        return n;
    }, scopedChildren, 0, body);
    if (type !== "void" && !returns) {
        throw new Error(`function '${id}' must return a value of type ${type}`);
    }
    // verify all non-builtin functions called are also
    // provided as deps to ensure complete call graph later
    const deps = walk((acc, t) => {
        if (t.tag === "call" && t.fn) {
            acc.push(t.fn);
        }
        return acc;
    }, allChildren, [], body);
    const $ = (...xs) => funcall($, ...xs);
    return Object.assign($, {
        tag: "fn",
        type,
        id,
        args,
        deps,
        scope: scope(body)
    });
}
/**
 * Syntax sugar for defining `void main()` functions.
 *
 * @param body -
 */
const defMain = (body) => defn("void", "main", [], body);
function ret(val) {
    return {
        tag: "ret",
        type: val ? val.type : "void",
        val,
    };
}
// prettier-ignore
function funcall(fn, ...args) {
    return isString(fn)
        ? {
            tag: "call",
            type: args[0],
            id: fn,
            args: args.slice(1)
        }
        : {
            tag: "call",
            type: fn.type,
            id: fn.id,
            args,
            fn
        };
}
const builtinCall = (id, type, ...args) => ({
    tag: "call_i",
    type,
    id,
    args,
});

const op1 = (op, val, post = false) => ({
    tag: "op1",
    type: val.type,
    op,
    val,
    post,
});
const OP_INFO = {
    mave: "mv",
    vema: "vm",
    vefl: "vn",
    mafl: "vn",
    flve: "nv",
    flma: "nv",
    ivin: "vn",
    iniv: "nv",
    uvui: "vn",
    uiuv: "nv",
};
const op2 = (op, _l, _r, rtype, info) => {
    const nl = isNumber(_l);
    const nr = isNumber(_r);
    let type;
    let l;
    let r;
    if (nl) {
        if (nr) {
            // (number, number)
            l = float(_l);
            r = float(_r);
            type = "float";
        }
        else {
            // (number, term)
            r = _r;
            l = numberWithMatchingType(r, _l);
            type = r.type;
        }
    }
    else if (nr) {
        // (term, number)
        l = _l;
        r = numberWithMatchingType(l, _r);
        type = l.type;
    }
    else {
        // (term, term)
        l = _l;
        r = _r;
        type =
            rtype ||
                (isVec(l)
                    ? l.type
                    : isVec(r)
                        ? r.type
                        : isMat(r)
                            ? r.type
                            : l.type);
    }
    return {
        tag: "op2",
        type: rtype || type,
        info: info || OP_INFO[l.type.substr(0, 2) + r.type.substr(0, 2)],
        op,
        l: l,
        r: r,
    };
};
// prettier-ignore
function add(l, r) {
    return op2("+", l, r);
}
function sub(l, r) {
    return op2("-", l, r);
}
function mul(l, r) {
    return op2("*", l, r, !isNumber(l) && !isNumber(r) && isMat(l) && isVec(r)
        ? r.type
        : undefined);
}
function div(l, r) {
    return op2("/", l, r);
}
const neg = (val) => op1("-", val);
const cmp = (op) => (a, b) => op2(op, a, b, "bool");
const lte = cmp("<=");
const gt = cmp(">");

function $(val, id) {
    const type = val.type[0];
    const rtype = (a, b) => id.length === 1 ? a : (b + id.length);
    return {
        tag: "swizzle",
        type: type === "i"
            ? rtype("int", "ivec")
            : type === "u"
                ? rtype("uint", "uvec")
                : type === "b"
                    ? rtype("bool", "bvec")
                    : rtype("float", "vec"),
        val,
        id,
    };
}
const $x = (val) => $(val, "x");
const $y = (val) => $(val, "y");
const $z = (val) => $(val, "z");
const $w = (val) => $(val, "w");
function $xy(val) {
    return $(val, "xy");
}
function $xyz(val) {
    return $(val, "xyz");
}

const primOp1 = (name) => (a) => builtinCall(name, a.type, a);
const primOp2 = (name) => (a, b) => builtinCall(name, a.type, a, b);
/**
 * Returns length / magnitude of given vector.
 *
 * @param v -
 */
const length = (v) => builtinCall("length", "float", v);
/**
 * Returns dot product of given vectors.
 *
 * @param a -
 * @param b -
 */
const dot = (a, b) => builtinCall("dot", "float", a, b);
const min = primOp2("min");
const max = primOp2("max");
const step = primOp2("step");
const abs = primOp1("abs");
const floor = primOp1("floor");
function mod(a, b) {
    const f = builtinCall("mod", a.type, a, b);
    b.type === "float" && (f.info = "n");
    return f;
}

export { $xy as $, length as A, lte as B, assign as a, add as b, div as c, defMain as d, mod as e, floor as f, $y as g, $x as h, $w as i, step as j, $xyz as k, builtinCall as l, mul as m, gt as n, $z as o, program as p, scope as q, defn as r, sub as s, ret as t, dot as u, $ as v, min as w, max as x, abs as y, neg as z };
//# sourceMappingURL=math-9c107e9c.js.map
