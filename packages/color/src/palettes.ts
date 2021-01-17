import {
  CSS_NAMES,
  parseCss,
  Color,
  rgbaHsla,
  asCSS,
  HSLA,
  hslaRgba,
  ColorMode,
} from "@thi.ng/color";
import { smoothStep } from "@thi.ng/math";
import { complement } from "./calc";
import { Color2 } from "./types";
import {
  mul4,
  mulN4,
  add4,
  sub4,
  clampN4,
  clamp4,
  smoothStep4,
  vec4,
  div4,
  div3,
  add3,
} from "@thi.ng/vectors";
import { isBuffer } from "util";

export { CSS_NAMES, parseCss };
export const colorAsCSS = (color: Color) => {
  return asCSS(color, ColorMode.RGBA);
};

/**
 * Css named colors as rgba. Losing name info.
 */
export const paletteCssNames = (): Color[] =>
  Object.keys(CSS_NAMES).map((name) => parseCss(name));

/**
 * Generate the complementary colors for all colors
 * @param colors
 */
export const paletteComplement = (colors: Color[]): Color2[] =>
  colors.map((color) => [color, complement(color)]);

/**
 * Generate a decent foreground and background base color from a given color.
 * @param color
 */
export const paletteForegroundBackground = (
  color: Color,
  opts?: Partial<{
    // apply a saturation multiplier to the foreground or background
    saturation: [number, number];
    // invert ( lighter bg, darker fg )
    invert: boolean;
    // clamp the lightness ( unless contrast ratio )
    clamp: [number, number];
  }>
) => {
  const { saturation = [1, 1], invert = false, clamp = [0.1, 0.9] } =
    opts || {};

  const hsl = rgbaHsla([], color);
  const bg = [hsl[0], hsl[1] * saturation[0], clamp[0], hsl[3]];
  const fg = [hsl[0], hsl[1] * saturation[1], clamp[1], hsl[3]];

  const res = [hslaRgba(null, bg), hslaRgba(null, fg)];
  if (invert) {
    return [res[1], res[0]];
  } else {
    return res;
  }
};

export const paletteContrastRatioDiff = (color: Color, opts: {}) => {
  return null;
};

/**
 * Generate a range of shadows for the given color.
 * The input color's lightness is scaled by a given amount and then a
 * gradient is generated given + / - the specified range from the scaled lightness.
 *
 * TODO: Modularise / resue the step function and;
 * TODO: Potentially use a different method than scale. Which works for colors closer to the upper/lower lightness threshold
 * TODO: Add some noise factor to introduce variation between gradient or introduce saturation shifts.
 */

/**
 * @param color
 * @param opts
 */
export const paletteColorRangeHSL = (
  color: Color,
  opts: Partial<{
    steps: number;
    scale: number;
    range: number;
    saturation: number;
    clamp: [number, number];
  }> = {}
): Color[] => {
  const {
    steps = 5,
    scale = 1,
    range = 0.5,
    saturation = 1,
    clamp = [0, 1],
  } = opts;
  const hsl1 = rgbaHsla([], color);
  const mid = mul4([], hsl1, [1, saturation, scale, 1]);
  const min = clamp4(
    null,
    add4([], mid, [0, 0, -range, 0]),
    [0, 0, clamp[0], 0],
    [1, 1, clamp[1], 1]
  );
  const max = clamp4(
    null,
    add4([], mid, [0, 0, +range, 0]),
    [0, 0, clamp[0], 0],
    [1, 1, clamp[1], 1]
  );
  const res = [];
  const step = (max[2] - min[2]) / (steps - 1);

  // Take only the lightness component and step.
  for (let i = 0; i < steps; i++) {
    const l = step * i;
    res.push(hslaRgba([], [mid[0], mid[1], l + min[2], mid[3]]));
  }

  return res;
};

/**
 * Create a gradient between two RGB colors, performing steps in HSL space.
 * @param color1
 * @param color2
 * @param steps
 */
export const paletteGradientHSL = (
  color1: Color,
  color2: Color,
  steps: number
): Color[] => {
  const hsl1 = rgbaHsla([], color1);
  const hsl2 = rgbaHsla([], color2);
  const s1 = steps - 1;
  const step = div4([], sub4([], hsl2, hsl1), [s1, s1, s1, s1]);

  const res = [];
  for (let i = 0; i < steps; i++) {
    const out = add4([], hsl1, mulN4([], step, i));
    res.push(hslaRgba(null, out));
  }
  return res;
};

/**
 * Create a gradient between two RGB colors, performing steps in HSL space.
 * @param color1
 * @param color2
 * @param steps
 */
export const paletteGradientRGB = (
  color1: Color,
  color2: Color,
  steps: number
): Color[] => {
  const s1 = steps - 1;
  const step = div4([], sub4([], color2, color1), [s1, s1, s1, s1]);

  const res = [];
  for (let i = 0; i < steps; i++) {
    const out = add4([], color1, mulN4([], step, i));
    res.push(out);
  }
  return res;
};
