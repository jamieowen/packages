import { step, Transducer, sideEffect } from "@thi.ng/transducers";
import { subscription } from "@thi.ng/rstream";
import { IMotionEvent } from "./api";

interface ArrayIteratorOpts<I, O> {
  xform: Transducer<IMotionEvent<"particle">, IMotionEvent<"particle">>;
}

export const particleIterator = <I, O>(opts: ArrayIteratorOpts<I, O>) => {
  let apply = step(opts.xform);
  let tmp: IMotionEvent<"particle"> = {
    type: "particle",
    data: null,
    clock: null,
  };
  return subscription<
    IMotionEvent<"particle-array">,
    IMotionEvent<"particle-array">
  >(
    {
      next: () => {},
      error: (err) => {
        throw err;
      },
    },
    {
      // Apply given transducer to each particle in array.
      xform: sideEffect((ev) => {
        tmp.clock = ev.clock;
        for (let i = 0; i < ev.data.length; i++) {
          tmp.data = ev.data[i];
          apply(tmp);
        }
      }),
    }
  );
};
