import { S as Stream } from './stream-f3489f1b.js';
import { m as map } from './map-3e2f222d.js';

const mergeOpts = (opts) => {
    let last = opts;
    return map((x) => {
        last = Object.assign(Object.assign({}, last), x);
        return last;
    });
};
const reactiveOptsFactory = (defaultOpts) => {
    return (opts) => {
        return new Stream(($) => {
            $.next(Object.assign({}, opts));
        }).subscribe(mergeOpts(defaultOpts));
    };
};
/**
const testOpts = reactiveOptsFactory<{ opt1: number; opt2?: number }>({
  opt1: 10,
  opt2: 20,
});

 */

export { reactiveOptsFactory as r };
//# sourceMappingURL=reactive-opts-77bb1e5d.js.map
