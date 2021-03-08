import {CSS_NAMES, parseCss, rgbHsl, css, hslRgb} from "../../../_snowpack/pkg/@thi.ng/color.js";
import {complement} from "./calc.js";
import {mul4, mulN4, add4, sub4, clamp4, div4} from "../../../_snowpack/pkg/@thi.ng/vectors.js";
export {CSS_NAMES, parseCss};
export const colorAsCSS = (color) => {
  return css(color);
};
export const paletteCssNames = () => Object.keys(CSS_NAMES).map((name) => parseCss(name).deref());
export const paletteComplement = (colors) => colors.map((color) => [color, complement(color)]);
export const paletteForegroundBackground = (color, opts) => {
  const {saturation = [1, 1], invert = false, clamp = [0.1, 0.9]} = opts || {};
  const hsl = rgbHsl([], color);
  const bg = [hsl[0], hsl[1] * saturation[0], clamp[0], hsl[3]];
  const fg = [hsl[0], hsl[1] * saturation[1], clamp[1], hsl[3]];
  const res = [hslRgb(null, bg), hslRgb(null, fg)];
  if (invert) {
    return [res[1], res[0]];
  } else {
    return res;
  }
};
export const paletteContrastRatioDiff = (color, opts) => {
  return null;
};
export const paletteColorRangeHSL = (color, opts = {}) => {
  const {
    steps = 5,
    scale = 1,
    range = 0.5,
    saturation = 1,
    clamp = [0, 1]
  } = opts;
  const hsl1 = rgbHsl([], color);
  const mid = mul4([], hsl1, [1, saturation, scale, 1]);
  const min = clamp4(null, add4([], mid, [0, 0, -range, 0]), [0, 0, clamp[0], 0], [1, 1, clamp[1], 1]);
  const max = clamp4(null, add4([], mid, [0, 0, +range, 0]), [0, 0, clamp[0], 0], [1, 1, clamp[1], 1]);
  const res = [];
  const step = (max[2] - min[2]) / (steps - 1);
  for (let i = 0; i < steps; i++) {
    const l = step * i;
    res.push(hslRgb([], [mid[0], mid[1], l + min[2], mid[3]]));
  }
  return res;
};
export const paletteGradientHSL = (color1, color2, steps) => {
  const hsl1 = rgbHsl([], color1);
  const hsl2 = rgbHsl([], color2);
  const s1 = steps - 1;
  const step = div4([], sub4([], hsl2, hsl1), [s1, s1, s1, s1]);
  const res = [];
  for (let i = 0; i < steps; i++) {
    const out = add4([], hsl1, mulN4([], step, i));
    res.push(hslRgb(null, out));
  }
  return res;
};
export const paletteGradientRGB = (color1, color2, steps) => {
  const s1 = steps - 1;
  const step = div4([], sub4([], color2, color1), [s1, s1, s1, s1]);
  const res = [];
  for (let i = 0; i < steps; i++) {
    const out = add4([], color1, mulN4([], step, i));
    res.push(out);
  }
  return res;
};
//# sourceMappingURL=palettes.js.map
