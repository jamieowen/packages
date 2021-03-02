import {
  backIn,
  backInOut,
  backOut,
  bounceIn,
  bounceInOut,
  bounceOut,
  circIn,
  circInOut,
  circOut,
  cubicIn,
  cubicInOut,
  cubicOut,
  elasticIn,
  elasticInOut,
  elasticOut,
  expoIn,
  expoInOut,
  expoOut,
  linear,
  quadIn,
  quadInOut,
  quadOut,
  quartIn,
  quartInOut,
  quartOut,
  quintIn,
  quintInOut,
  quintOut,
  sineIn,
  sineInOut,
  sineOut,
} from "./easing";

export type EaseFn = (t: number) => number;

export type EaseType =
  | "backIn"
  | "backInOut"
  | "backOut"
  | "bounceIn"
  | "bounceInOut"
  | "bounceOut"
  | "circIn"
  | "circInOut"
  | "circOut"
  | "cubicIn"
  | "cubicInOut"
  | "cubicOut"
  | "elasticIn"
  | "elasticInOut"
  | "elasticOut"
  | "expoIn"
  | "expoInOut"
  | "expoOut"
  | "linear"
  | "quadIn"
  | "quadInOut"
  | "quadOut"
  | "quartIn"
  | "quartInOut"
  | "quartOut"
  | "quintIn"
  | "quintInOut"
  | "quintOut"
  | "sineIn"
  | "sineInOut"
  | "sineOut";

export const EaseTypes: Record<EaseType, EaseFn> = {
  backIn,
  backInOut,
  backOut,
  bounceIn,
  bounceInOut,
  bounceOut,
  circIn,
  circInOut,
  circOut,
  cubicIn,
  cubicInOut,
  cubicOut,
  elasticIn,
  elasticInOut,
  elasticOut,
  expoIn,
  expoInOut,
  expoOut,
  linear,
  quadIn,
  quadInOut,
  quadOut,
  quartIn,
  quartInOut,
  quartOut,
  quintIn,
  quintInOut,
  quintOut,
  sineIn,
  sineInOut,
  sineOut,
};
