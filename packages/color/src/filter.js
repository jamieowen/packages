import {contrastRatio1, contrastRatio2} from "./calc.js";
export const filterContrastRatio1 = (colors, min, max) => colors.filter(([color1, color2]) => {
  const contrast = contrastRatio1(color1, color2);
  return contrast > min && contrast < max;
});
export const filterContrastRatio2 = (colors, min, max) => colors.filter(([color1, color2]) => {
  const contrast = contrastRatio2(color1, color2);
  return contrast > min && contrast < max;
});
//# sourceMappingURL=filter.js.map
