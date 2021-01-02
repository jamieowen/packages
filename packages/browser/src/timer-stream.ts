import { Stream } from "@thi.ng/rstream";
import { IRandom, SYSTEM } from "@thi.ng/random";

interface TimerEvent {
  time: number;
  delta: number;
  next: number;
  last: boolean;
}

type FrequencyFn = () => number;

interface TimerStreamParams {
  repeat?: number;
  frequency?: number | FrequencyFn;
  autoStart?: boolean;
}

export class TimerStream extends Stream<TimerEvent> {
  getFrequency: FrequencyFn;
  intervalID: number;
  running: boolean = false;
  repeat: number = Infinity;
  count: number = 0;
  currentTime: number;

  constructor(params: TimerStreamParams) {
    super({});
    const { repeat = Infinity, frequency = 100, autoStart = true } = params;
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

  // TODO : Check repeat count, currently a couple more inc;iding start event.
  private tick(delta: number, next: number, last: boolean) {
    this.next({
      time: this.currentTime,
      delta,
      next,
      last,
    });
    if (last) {
      this.stop();
    } else {
      this.intervalID = setTimeout(() => {
        this.count++;
        this.currentTime += next;
        const last = this.count > this.repeat;
        const nextTime = last ? 0 : this.getFrequency();
        this.tick(next, nextTime, last);
      }, next) as any;
    }
  }
}

export const timerStream = (params: TimerStreamParams) =>
  new TimerStream(params);

export const timerStreamRandomFrequency = (
  params: {
    min?: number;
    max?: number;
    step?: number;
    rand?: IRandom;
  } = {}
): FrequencyFn => {
  const { min = 100, max = 300, step = 50, rand = SYSTEM } = params;
  return () => {
    const time = rand.minmax(min, max);
    return Math.round(time / step) * step;
  };
};
