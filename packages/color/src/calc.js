import {hsvRgb, luminanceRgb, rgbHsv} from "../../../_snowpack/pkg/@thi.ng/color.js";
export const complement = (rgba) => {
  const hsva = rgbHsv([], rgba);
  hsva[0] = hsva[0] + 0.5 % 1;
  return hsvRgb([], hsva);
};
export const contrastRatio1 = (col1, col2) => {
  const lum1 = luminanceRgb(col1);
  const lum2 = luminanceRgb(col2);
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
};
const RGB_LUMINANCE_2 = [0.2126, 0.7152, 0.0722];
export const contrastRatio2 = (col1, col2) => {
  const lum1 = luminanceRgb(col1, RGB_LUMINANCE_2);
  const lum2 = luminanceRgb(col2, RGB_LUMINANCE_2);
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
};
//# sourceMappingURL=calc.js.map
