import { bounceOut } from "./bounce-out";

export function bounceIn(t: number) {
  return 1.0 - bounceOut(1.0 - t);
}
