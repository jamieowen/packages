import { subscription, Subscription } from "@thi.ng/rstream";
import { set, set3 } from "@thi.ng/vectors";

import { IMotionEvent, ITransform, IParticle } from "./api";
import {
  comp,
  map,
  sideEffect,
  Transducer,
  iterator,
} from "@thi.ng/transducers";
import { createParticle, createTransform } from "./base-streams";

// export class Trails extends Subscription<
//   IMotionEvent<"transform">,
//   IMotionEvent<"transform-array">
// > {
//   trails: ITransform[] = [];
//   emit: boolean = false;

//   constructor(public length: number, public emitWhenFull: boolean = true) {
//     super(undefined, {
//       xform: sideEffect(() => console.log("trail")),
//     });
//     this.trails = [];
//   }

//   next(ev: IMotionEvent<"transform">) {
//     if (this.trails.length < this.length) {
//       this.trails.unshift(createTransform());
//     } else {
//       const last = this.trails.pop();
//       this.trails.unshift(last);
//     }
//     const input = ev.data;
//     const transform = this.trails[0];

//     set3(transform.position, input.position);

//     if (this.emitWhenFull && this.trails.length >= this.length) {
//       this.dispatch({
//         type: "transform-array",
//         data: this.trails,
//         clock: ev.clock,
//       });
//     } else {
//     }
//   }

//   error(err: Error) {
//     console.log("Err", err);
//   }
// }

// export const trails = (length: number) => new Trails(length);

/**
 *
 * Trails 2
 *
 */

const pushHistory = (length: number) => {
  const history: IParticle[] = [];
  return (ev: IMotionEvent<"particle">): IMotionEvent<"particle-array"> => {
    if (history.length < length) {
      history.unshift(createParticle());
    } else {
      const last = history.pop();
      history.unshift(last);
    }
    const input = ev.data;
    const transform = history[0];

    set3(transform.position, input.position);

    return {
      ...ev,
      type: "particle-array",
      data: history,
    };
  };
};

export const particleTrails = <I, O>(length: number) => {
  const xform = map(pushHistory(length));
  return subscription(
    {
      next: () => {},
      error: (err) => {
        throw err;
      },
    },
    { xform }
  );
};
