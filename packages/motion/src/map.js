import {map} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
export const mapPosition = (fn) => map((ev) => (fn(ev.clock.time, ev.data.position), ev));
//# sourceMappingURL=map.js.map
