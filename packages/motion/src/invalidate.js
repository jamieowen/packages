import {set3} from "../../../_snowpack/pkg/@thi.ng/vectors.js";
import {filter} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
export const invalidate = (isInvalid, init) => {
  let last = init;
  return filter((x) => {
    if (isInvalid(last, x) || last === void 0) {
      last = x;
      return false;
    } else {
      last = x;
      return true;
    }
  });
};
export const invalidatePosition = () => {
  let prev = [];
  return filter((x) => {
    const changed = x.data.position[0] !== prev[0] || x.data.position[1] !== prev[1] || x.data.position[2] !== prev[2];
    if (changed) {
      set3(prev, x.data.position);
    }
    return changed;
  });
};
export const invalidatePositionThreshold = (threshold = 0.01) => {
  let prev = [];
  return filter((x) => {
    const curr = x.data.position;
    const changed = curr[0] > prev[0] + threshold && curr[0] < prev[0] - threshold || curr[1] > prev[1] + threshold && curr[1] < prev[1] - threshold || curr[2] > prev[2] + threshold && curr[2] < prev[2] - threshold;
    if (changed) {
      set3(prev, x.data.position);
    }
    return changed;
  });
};
//# sourceMappingURL=invalidate.js.map
