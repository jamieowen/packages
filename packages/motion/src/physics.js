import {sideEffect} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
import {set3, sub3} from "../../../_snowpack/pkg/@thi.ng/vectors.js";
export const calcVelocity = () => {
  let prev = void 0;
  return sideEffect((ev) => {
    if (!prev) {
      prev = [];
      set3(prev, ev.data.position);
    }
    sub3(ev.data.velocity, prev, ev.data.position);
    set3(prev, ev.data.position);
  });
};
//# sourceMappingURL=physics.js.map
