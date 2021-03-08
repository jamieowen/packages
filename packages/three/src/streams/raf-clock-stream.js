import {fromRAF} from "../../../../_snowpack/pkg/@thi.ng/rstream.js";
import {Clock} from "../../../../_snowpack/pkg/three.js";
import {map} from "../../../../_snowpack/pkg/@thi.ng/transducers.js";
export function rafClockStream() {
  const clock = new Clock();
  return fromRAF().transform(map((i) => {
    return {
      clock,
      delta: clock.getDelta(),
      time: clock.getElapsedTime(),
      frame: i
    };
  }));
}
//# sourceMappingURL=raf-clock-stream.js.map
