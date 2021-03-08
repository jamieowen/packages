import { s as sync } from '../common/stream-sync-1d79ce60.js';
import { m as map, c as iterator } from '../common/map-3e2f222d.js';
import { r as range2d, m as mapcat } from '../common/mapcat-f74e1642.js';
import { c as comp } from '../common/comp-e3b62542.js';
import '../common/subscription-3ccab2d1.js';
import '../common/logger-b7639346.js';
import '../common/is-plain-object-7a83b681.js';
import '../common/deferror-99934d1f.js';
import '../common/checks-bec761b0.js';
import '../common/is-array-065cc62f.js';
import '../common/range-778b1e8d.js';

class ChangeMap {
    constructor() {
        this.previous = new Map();
        this.current = new Map();
    }
    set(key, add) {
        let value = this.previous.get(key);
        if (!value) {
            value = add(key);
        }
        this.previous.delete(key);
        this.current.set(key, value);
        return value;
    }
    next(removed) {
        for (let [key, handler] of this.previous.entries()) {
            removed(key, handler);
        }
        this.previous.clear();
        const swap = this.previous;
        this.previous = this.current;
        this.current = swap;
    }
}

/**
 * https://www.vertexfragment.com/ramblings/cantor-szudzik-pairing-functions
 */
function szudzikPair(x, y) {
    return x >= y ? x * x + x + y : y * y + x;
}
function szudzikPairSigned(x, y) {
    const a = x >= 0.0 ? 2.0 * x : -2.0 * x - 1.0;
    const b = y >= 0.0 ? 2.0 * y : -2.0 * y - 1.0;
    return szudzikPair(a, b) * 0.5;
}

/**
 *
 * Return an infinite grid iterator given a start position,
 * grid cell and viewport dimensions.
 *
 * @param position
 * @param opts
 */
const infiniteGridIterator = (position, opts) => {
    const [gw, gh] = opts.dimensions;
    const [vw, vh] = opts.viewport;
    const px = -position[0];
    const py = -position[1];
    // start cell x/y
    const fromX = Math.floor(px / gw);
    const fromY = Math.floor(py / gh);
    // cell row / cols
    const xCount = Math.ceil(vw / gw) + 1;
    const yCount = Math.ceil(vh / gh) + 1;
    const toX = fromX + xCount;
    const toY = fromY + yCount;
    return iterator(comp(map(([x, y]) => {
        const wx = x * gw;
        const wy = y * gh;
        const id = szudzikPairSigned(x, y);
        return {
            id,
            cell: [x, y],
            world: [wx, wy],
            local: [wx - px, wy - py],
        };
    })), range2d(fromX, toX, fromY, toY));
};
/**
 * Creates a reactive infinite grid with
 * @param position
 * @param opts
 */
function infiniteGrid(position, opts, handle) {
    const changeMap = new ChangeMap();
    if (!handle) {
        handle = {
            add: () => null,
            remove: () => { },
            update: () => { },
        };
    }
    let res = [];
    return sync({
        src: {
            position,
            opts,
        },
        xform: map(({ opts, position }) => {
            const gridIterator = infiniteGridIterator(position, opts);
            res.splice(0);
            for (let cell of gridIterator) {
                const handler = changeMap.set(cell.id, () => handle.add(cell));
                handle.update(cell, handler);
                res.push(cell);
            }
            changeMap.next((id, val) => handle.remove(id, val));
            return res;
        }),
    });
}

const subdivRange2dIterator = (fromX, toX, fromY, toY, step, depth, idGen) => iterator(map(([x, y]) => [
    idGen(x, y),
    x,
    y,
    step,
    depth,
]), range2d(fromX, toX, fromY, toY, step, step));
const mapSubdivideIf = (idGen, cond) => mapcat((item) => {
    if (cond(item)) {
        const [id, x, y, step, depth] = item;
        const subStep = step * 0.5;
        return subdivRange2dIterator(x, x + step, y, y + step, subStep, depth + 1, idGen);
    }
    else {
        return [item];
    }
});

/**
 *
 * Return an infinite grid iterator given a start position,
 * grid cell and viewport dimensions.
 *
 * @param position
 * @param opts
 */
const infiniteSubGridIterator = (position, opts) => {
    const [gw, gh] = opts.dimensions;
    const [vw, vh] = opts.viewport;
    const px = -position[0];
    const py = -position[1];
    // start cell x/y
    const fromX = Math.floor(px / gw);
    const fromY = Math.floor(py / gh);
    // cell row / cols
    const xCount = Math.ceil(vw / gw) + 1;
    const yCount = Math.ceil(vh / gh) + 1;
    const toX = fromX + xCount;
    const toY = fromY + yCount;
    const { maxDepth = 1, subdivide = () => true } = opts;
    const subdivScale = Math.pow(4, maxDepth);
    const idGen = (x, y) => szudzikPairSigned(x * subdivScale, y * subdivScale);
    // todo: ? unroll loops to a number of depths?
    const compDivide = [];
    for (let i = 0; i < maxDepth; i++) {
        compDivide.push(mapSubdivideIf(idGen, subdivide));
    }
    return iterator(comp(comp.apply(comp, compDivide), map(([id, x, y, step, depth]) => {
        const wx = x * gw;
        const wy = y * gh;
        return {
            id,
            cell: [x, y],
            world: [wx, wy],
            local: [wx - px, wy - py],
            depth,
            step,
        };
    })), subdivRange2dIterator(fromX, toX, fromY, toY, 1, 0, idGen));
};
/**
 * Creates a reactive infinite grid with
 * @param position
 * @param opts
 */
function infiniteSubGrid(position, opts, handle) {
    const changeMap = new ChangeMap();
    if (!handle) {
        handle = {
            add: () => null,
            remove: () => { },
            update: () => { },
        };
    }
    let res = [];
    return sync({
        src: {
            position,
            opts,
        },
        xform: map(({ opts, position }) => {
            const gridIterator = infiniteSubGridIterator(position, opts);
            res.splice(0);
            for (let cell of gridIterator) {
                const handler = changeMap.set(cell.id, () => handle.add(cell));
                handle.update(cell, handler);
                res.push(cell);
            }
            changeMap.next((id, val) => handle.remove(id, val));
            return res;
        }),
    });
}

export { infiniteGrid, infiniteSubGrid };
//# sourceMappingURL=layout.js.map
