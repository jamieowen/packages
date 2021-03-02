import { Stream } from "@thi.ng/rstream";
import { map } from "@thi.ng/transducers";

export const mergeOpts = <T>(opts: T) => {
  let last = opts;
  return map<Partial<T>, T>((x) => {
    last = {
      ...last,
      ...x,
    };
    return last;
  });
};

export const reactiveOptsFactory = <T>(defaultOpts: T) => {
  return (opts: T) => {
    return new Stream<T>(($) => {
      $.next({
        ...opts,
      });
    }).subscribe(mergeOpts(defaultOpts));
  };
};

/**
const testOpts = reactiveOptsFactory<{ opt1: number; opt2?: number }>({
  opt1: 10,
  opt2: 20,
});

 */
