import {fromRAF} from "../../../_snowpack/pkg/@thi.ng/rstream.js";
import {map} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
const perf = () => {
  return (typeof performance === "undefined" ? Date : performance).now();
};
export const clock = (opts) => {
  let then = perf();
  let start = then;
  const raf = fromRAF(opts).transform(map((frame) => {
    const now = perf();
    const delta = (now - then) / 1e3;
    const time = (now - start) / 1e3;
    then = now;
    return {frame, delta, time};
  }));
  raf.next(0);
  return raf;
};
export const DEFAULT_CLOCK = (() => {
  let instance = void 0;
  return () => {
    if (!instance) {
      instance = clock();
    }
    return instance;
  };
})();
//# sourceMappingURL=clock.js.map
