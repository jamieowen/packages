import {Stream} from "../../../_snowpack/pkg/@thi.ng/rstream.js";
import {map} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
export const mergeOpts = (opts) => {
  let last = opts;
  return map((x) => {
    last = {
      ...last,
      ...x
    };
    return last;
  });
};
export const reactiveOptsFactory = (defaultOpts) => {
  return (opts) => {
    return new Stream(($) => {
      $.next({
        ...opts
      });
    }).subscribe(mergeOpts(defaultOpts));
  };
};
//# sourceMappingURL=reactive-opts.js.map
