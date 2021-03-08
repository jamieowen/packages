import {subscription} from "../../../_snowpack/pkg/@thi.ng/rstream.js";
import {set3} from "../../../_snowpack/pkg/@thi.ng/vectors.js";
import {
  map
} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
import {createParticle} from "./base-streams.js";
const pushHistory = (length) => {
  const history = [];
  return (ev) => {
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
      data: history
    };
  };
};
export const particleTrails = (length) => {
  const xform = map(pushHistory(length));
  return subscription({
    next: () => {
    },
    error: (err) => {
      throw err;
    }
  }, {xform});
};
//# sourceMappingURL=trails.js.map
