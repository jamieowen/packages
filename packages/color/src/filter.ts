import { contrastRatio1, contrastRatio2 } from "./calc";
import { Color2 } from "./types";

export const filterContrastRatio1 = (
  colors: Color2[],
  min: number,
  max: number
) =>
  colors.filter(([color1, color2]) => {
    const contrast = contrastRatio1(color1, color2);
    return contrast > min && contrast < max;
  });

export const filterContrastRatio2 = (
  colors: Color2[],
  min: number,
  max: number
) =>
  colors.filter(([color1, color2]) => {
    const contrast = contrastRatio2(color1, color2);
    return contrast > min && contrast < max;
  });
