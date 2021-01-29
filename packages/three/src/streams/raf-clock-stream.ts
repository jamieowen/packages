import { fromRAF } from "@thi.ng/rstream";
import { Clock } from "three";
import { map } from "@thi.ng/transducers";

export function rafClockStream() {
  const clock = new Clock();
  return fromRAF().transform(
    map((i: number) => {
      return {
        clock,
        delta: clock.getDelta(),
        time: clock.getElapsedTime(),
        frame: i,
      };
    })
  );
}
