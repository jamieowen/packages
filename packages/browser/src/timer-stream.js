import {Stream} from "../../../_snowpack/pkg/@thi.ng/rstream.js";
import {SYSTEM} from "../../../_snowpack/pkg/@thi.ng/random.js";
export class TimerStream extends Stream {
  constructor(params) {
    super({});
    this.running = false;
    this.repeat = Infinity;
    this.count = 0;
    const {repeat = Infinity, frequency = 100, autoStart = true} = params;
    this.repeat = repeat;
    if (typeof frequency === "function") {
      this.getFrequency = frequency;
    } else {
      this.getFrequency = () => frequency;
    }
    if (autoStart) {
      this.start();
    }
  }
  start() {
    if (!this.running) {
      this.running = true;
      this.count = 0;
      this.currentTime = 0;
      this.tick(0, this.getFrequency(), false);
    }
  }
  stop() {
    if (this.running) {
      clearTimeout(this.intervalID);
      this.running = false;
    }
  }
  tick(delta, next, last) {
    this.next({
      time: this.currentTime,
      delta,
      next,
      last
    });
    if (last) {
      this.stop();
    } else {
      this.intervalID = setTimeout(() => {
        this.count++;
        this.currentTime += next;
        const last2 = this.count > this.repeat;
        const nextTime = last2 ? 0 : this.getFrequency();
        this.tick(next, nextTime, last2);
      }, next);
    }
  }
}
export const timerStream = (params) => new TimerStream(params);
export const timerStreamRandomFrequency = (params = {}) => {
  const {min = 100, max = 300, step = 50, rand = SYSTEM} = params;
  return () => {
    const time = rand.minmax(min, max);
    return Math.round(time / step) * step;
  };
};
//# sourceMappingURL=timer-stream.js.map
