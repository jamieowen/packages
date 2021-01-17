import { Color, hsvaRgba, luminanceRGB, rgbaHsva } from "@thi.ng/color";

/**
 * Calculate the complementary color using RGB space ( rather than RYB )
 * @param out
 * @param rgba
 */
export const complement = (rgba: Color) => {
  const hsva = rgbaHsva([], rgba);
  hsva[0] = hsva[0] + (0.5 % 1);
  return hsvaRgba([], hsva);
};

/**
 * Calculate the contrast ratio between colors.
 * version 1 with default @thi.ng luminance coefficients.
 * @param col1
 * @param col2
 * @param colorMode
 */
export const contrastRatio1 = (col1: Color, col2: Color) => {
  const lum1 = luminanceRGB(col1);
  const lum2 = luminanceRGB(col2);
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
};

// https://openaccess.thecvf.com/content_cvpr_2017/papers/Nguyen_Why_You_Should_CVPR_2017_paper.pdf
// https://www.accessibility-developer-guide.com/knowledge/colours-and-contrast/how-to-calculate/
// Using different luminance coefficients
// Except seems to adjust for gamma correction
// As : https://contrast-ratio.com

const RGB_LUMINANCE_2 = [0.2126, 0.7152, 0.0722];

/**
 * Calculate the contrast ratio between colors.
 * version 2 with alternative coefficients ( 0.2126, 0.7152, 0.0722 )
 * @param col1
 * @param col2
 * @param colorMode
 */
export const contrastRatio2 = (col1: Color, col2: Color) => {
  const lum1 = luminanceRGB(col1, RGB_LUMINANCE_2);
  const lum2 = luminanceRGB(col2, RGB_LUMINANCE_2);
  return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
};

/**
 * Attempt to find the closest colors to the supplied min and max ranges.
 * @param min
 * @param max
 * @param color
 */
// export const findLuminanceRange = (
//   min: number,
//   max: number,
//   color: Color
// ) => {};

/**
 * Return the nearest color with the given luminance to the supplied color.
 * @param targetLum
 * @param color
 */
// export const findNearestColorLuminance = (
//   targetLum: number,
//   color: Color
// ): Color => {
//   // supplied color t V ( hsva ) & luminance

//   // THIS KIND OF WORKS -
//   const hsv = rgbaHsva([], color);
//   const lumC = luminanceRGB(color, RGB_LUMINANCE_2);
//   const ratio = targetLum / lumC;
//   return hsvaRgba([], [hsv[0], hsv[1], hsv[2] * ratio, hsv[3]]);
//   // return
//   // const resLum = luminanceRGB(res, RGB_LUMINANCE_2);

//   // console.log("NEAREST LUM :RES ", res, resLum, targetLum);
// };

// const near = (val: number, min: number, max: number) => {
//   if (val > min && val < max) {
//     return true;
//   } else {
//     return false;
//   }
// };

// take a color.
// create a complement rotation... with an optional min max offset.

// Luminance balance.
// Normalise/Limit 2 colours ( or number of colours? ) to an overall sum luminance

// Can the same be done to reduce or increase a contrast ratio?

// distribution. create a numner of additional colours as tints/adjustments of provided base colours.
// supply a 'percentage split' i.e. 60, 30,10 rule
