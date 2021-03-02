import { Stream, Subscription } from "@thi.ng/rstream";
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

export type ReactiveOpts<T> = Subscription<Partial<T>,T>;
export type ReactiveOptsFactory<T> = (opts:Partial<T>) => ReactiveOpts<T>;

export const reactiveOptsFactory = <T>(defaultOpts: T):ReactiveOptsFactory<T> => {
  return (opts: Partial<T>) => {
    return new Stream<T>(($) => {
      $.next({
        ...opts as T,
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
