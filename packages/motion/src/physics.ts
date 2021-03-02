import { subscription } from "@thi.ng/rstream";
import { iterator, sideEffect, Transducer, step } from "@thi.ng/transducers";
import { set3, sub3, Vec } from "@thi.ng/vectors";
import { IMotionEvent, IParticle } from "./api";

export const calcVelocity = () => {
  let prev: Vec = undefined;
  return sideEffect<IMotionEvent<"particle">>((ev) => {
    if (!prev) {
      prev = [];
      set3(prev, ev.data.position);
    }
    sub3(ev.data.velocity, prev, ev.data.position);
    set3(prev, ev.data.position);
  });
};

// particle System - as array iterator.
// similar to xform that trails is using.

// mapPosition( sine() )
// mapScale( sine() )
// map( ()=> sine(10,20) ) X
// setVelocity()
// subscribe( followPointer() )
// subscribe( trails(10) )

// const sine = (phase: number, scale: number, comp: number) => {
//   return (time: number, target: Vec) => {
//     target[comp] = Math.sin(time + phase) * scale;
//   };
// };
