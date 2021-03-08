import {bounceOut} from "./bounce-out.js";
export function bounceInOut(t) {
  return t < 0.5 ? 0.5 * (1 - bounceOut(1 - t * 2)) : 0.5 * bounceOut(t * 2 - 1) + 0.5;
}
//# sourceMappingURL=bounce-in-out.js.map
