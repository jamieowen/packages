import { fromRAF, CommonOpts } from "@thi.ng/rstream";
import { map } from "@thi.ng/transducers";

const perf = () => {
  return (typeof performance === "undefined" ? Date : performance).now();
};

export const clock = (opts?: CommonOpts) => {
  let then = perf();
  let start = then;
  const raf = fromRAF(opts).transform(
    map((frame) => {
      const now = perf();
      const delta = (now - then) / 1000;
      const time = (now - start) / 1000;
      then = now;
      return { frame, delta, time };
    })
  );
  raf.next(0); // emit an initial 0, otherwise it waits a frame.
  return raf;
};

export const DEFAULT_CLOCK = (() => {
  let instance: ReturnType<typeof clock> = undefined;
  return () => {
    if (!instance) {
      instance = clock();
    }
    return instance;
  };
})();
