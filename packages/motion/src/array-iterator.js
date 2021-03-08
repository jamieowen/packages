import {step, sideEffect} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
import {subscription} from "../../../_snowpack/pkg/@thi.ng/rstream.js";
export const particleIterator = (opts) => {
  let apply = step(opts.xform);
  let tmp = {
    type: "particle",
    data: null,
    clock: null
  };
  return subscription({
    next: () => {
    },
    error: (err) => {
      throw err;
    }
  }, {
    xform: sideEffect((ev) => {
      tmp.clock = ev.clock;
      for (let i = 0; i < ev.data.length; i++) {
        tmp.data = ev.data[i];
        apply(tmp);
      }
    })
  });
};
//# sourceMappingURL=array-iterator.js.map
