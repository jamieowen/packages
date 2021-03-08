import { d as isIterable, f as iterator1, g as compR } from './map-3e2f222d.js';

function filter(pred, src) {
    return isIterable(src)
        ? iterator1(filter(pred), src)
        : (rfn) => {
            const r = rfn[2];
            return compR(rfn, (acc, x) => (pred(x) ? r(acc, x) : acc));
        };
}

export { filter as f };
//# sourceMappingURL=filter-44dab916.js.map
