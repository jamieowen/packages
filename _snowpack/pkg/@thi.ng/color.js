import { a as clamp01 } from '../common/interval-ab795faf.js';
import { v as vop, e as compileG, D as DOT_G, f as compile, g as DOT, h as SARGS_V } from '../common/codegen-5794034c.js';
import { T as TAU, E as EPS } from '../common/api-b6b788f6.js';
import { b as isString, a as illegalArgs, i as isNumber } from '../common/illegal-arguments-07fc2d96.js';
import { a as assert } from '../common/assert-cf4243e4.js';
import { u as unsupported } from '../common/unsupported-608d53c8.js';
import '../common/map-3e2f222d.js';
import '../common/deferror-99934d1f.js';
import '../common/comp-e3b62542.js';
import '../common/range-778b1e8d.js';
import '../common/_node-resolve_empty-7606bff8.js';

const fract = (x) => x - Math.floor(x);

/**
 * Hex digits
 */
const HEX = "0123456789abcdef";
/**
 * Returns 8bit uint as hex string
 *
 * @param x
 */
const U8 = (x) => HEX[(x >>> 4) & 0xf] + HEX[x & 0xf];
/**
 * Returns 16bit uint as hex string
 *
 * @param x
 */
const U16 = (x) => U8(x >>> 8) + U8(x & 0xff);
/**
 * Returns 24bit uint as hex string
 *
 * @param x
 */
const U24$1 = (x) => U8(x >>> 16) + U16(x);

/**
 * Repeats lowest nibble of `x` as 24 bit uint.
 *
 * @param x -
 */
/**
 * Expands 3x4bit value like `0xabc` to 24bits: `0xaabbcc`
 *
 * @param x
 */
const interleave4_12_24 = (x) => ((x & 0xf00) * 0x1100) | ((x & 0xf0) * 0x110) | ((x & 0xf) * 0x11);
/**
 * Expands 4x4bit value like `0xabcd` to 32bits: `0xaabbccdd`
 *
 * @param x
 */
const interleave4_16_32 = (x) => (((x & 0xf000) * 0x11000) |
    ((x & 0xf00) * 0x1100) |
    ((x & 0xf0) * 0x110) |
    ((x & 0xf) * 0x11)) >>>
    0;

/**
 * Extracts 16-bit lane from given 32bit uint and returns as unsigned
 * half word [0x0000 .. 0xffff].
 *
 * - Lane #0: bits 16-31
 * - Lane #1: bits 0-15
 *
 * @param x -
 * @param lane - lane ID enum
 */
/**
 * Swaps bytes lanes 1 & 3 (i.e. bits 16-23 with bits 0-7)
 *
 * @param x
 */
const swapLane13 = (x) => ((x & 0xff) << 16) | ((x >> 16) & 0xff) | (x & 0xff00ff00);

const setC3 = (out, x, y, z) => (!out && (out = []), (out[0] = x), (out[1] = y), (out[2] = z), out);
const setC4 = (out, x, y, z, w) => (!out && (out = []),
    (out[0] = x),
    (out[1] = y),
    (out[2] = z),
    (out[3] = w),
    out);

const $$1 = (dim) => dot.add(dim, compile(dim, DOT, "a,b", undefined, "", "+", "return ", ";"));
const dot = vop();
dot.default(compileG(DOT_G, "a,b", undefined, "s", "let s=0;"));
$$1(2);
const dot3 = $$1(3);
$$1(4);

const $ = (dim) => compile(dim, DOT, `o,a,${SARGS_V}`, "o,a", "", "+", "return ", ";", true);
$(2);
const dotS3 = $(3);
$(4);

function memoizeJ(fn, cache) {
    !cache && (cache = {});
    return (...args) => {
        const key = JSON.stringify(args);
        if (key !== undefined) {
            return key in cache
                ? cache[key]
                : (cache[key] = fn.apply(null, args));
        }
        return fn.apply(null, args);
    };
}

/**
 * Hue names in radial order, e.g. used by {@link namedHueRgb}.
 */
var Hue;
(function (Hue) {
    Hue[Hue["RED"] = 0] = "RED";
    Hue[Hue["ORANGE"] = 1] = "ORANGE";
    Hue[Hue["YELLOW"] = 2] = "YELLOW";
    Hue[Hue["CHARTREUSE"] = 3] = "CHARTREUSE";
    Hue[Hue["GREEN"] = 4] = "GREEN";
    Hue[Hue["SPRING_GREEN"] = 5] = "SPRING_GREEN";
    Hue[Hue["CYAN"] = 6] = "CYAN";
    Hue[Hue["AZURE"] = 7] = "AZURE";
    Hue[Hue["BLUE"] = 8] = "BLUE";
    Hue[Hue["VIOLET"] = 9] = "VIOLET";
    Hue[Hue["MAGENTA"] = 10] = "MAGENTA";
    Hue[Hue["ROSE"] = 11] = "ROSE";
})(Hue || (Hue = {}));
/**
 * Result type returned by {@link parseCss}, a simple wrapper for a raw color
 * array and color mode.
 */
class ParsedColor {
    constructor(mode, value) {
        this.mode = mode;
        this.value = value;
    }
    deref() {
        return this.value;
    }
}

/**
 * @param ch - character
 * @param n - repeat count
 */
const repeat = memoizeJ((ch, n) => ch.repeat(n));

/**
 * Returns a {@link Stringer} which formats given numbers to `radix`, `len` and
 * with optional prefix (not included in `len`).
 *
 * @remarks
 * Only bases 2 - 36 are supported, due to native `Number.toString()`
 * limitations.
 *
 * @param radix -
 * @param len -
 * @param prefix -
 */
const radix = memoizeJ((radix, n, prefix = "") => {
    const buf = repeat("0", n);
    return (x) => {
        x = (x >>> 0).toString(radix);
        return prefix + (x.length < n ? buf.substr(x.length) + x : x);
    };
});
/**
 * 8bit binary conversion preset.
 */
radix(2, 8);
/**
 * 16bit binary conversion preset.
 */
radix(2, 16);
/**
 * 32bit binary conversion preset.
 */
radix(2, 32);
/**
 * 24bit hex conversion preset.
 * Assumes unsigned inputs.
 */
const U24 = U24$1;

/**
 * @param n - target length
 * @param ch - pad character(s)
 */
const padLeft = memoizeJ((n, ch = " ") => {
    const buf = repeat(String(ch), n);
    return (x, len) => {
        if (x == null)
            return buf;
        x = x.toString();
        len = len !== undefined ? len : x.length;
        return len < n ? buf.substr(len) + x : x;
    };
});
/**
 * Zero-padded 2 digit formatter.
 */
padLeft(2, "0");
/**
 * Zero-padded 3 digit formatter.
 */
padLeft(3, "0");
/**
 * Zero-padded 4 digit formatter.
 */
padLeft(4, "0");

/**
 * Returns {@link Stringer} which formats numbers to given precision. If
 * `special` is true, then exceptional handling for:
 *
 * - NaN => "NaN"
 * - Infinity => "+/-∞"
 *
 * @param len - number of fractional digits
 * @param special - true, if special handling for NaN/Infinity values
 */
const float = memoizeJ((prec, special = false) => special
    ? (x) => nanOrInf(x) || x.toFixed(prec)
    : (x) => x.toFixed(prec));
/**
 * Similar to `float`, returns {@link Stringer} which formats numbers to given
 * character width & precision. Uses scientific notation if needed.
 *
 * Default precision: 3 fractional digits
 */
memoizeJ((width, prec = 3) => {
    const l = width - prec - 1;
    const pl = Math.pow(10, l);
    const pln = -Math.pow(10, l - 1);
    const pr = Math.pow(10, -(prec - 1));
    const pad = padLeft(width);
    return (x) => {
        const ax = Math.abs(x);
        return pad(nanOrInf(x) ||
            (x === 0
                ? "0"
                : ax < pr || ax >= pl
                    ? exp(x, width)
                    : x.toFixed(prec - (x < pln ? 1 : 0))));
    };
});
const exp = (x, w) => x.toExponential(Math.max(w -
    4 -
    (Math.log(Math.abs(x)) / Math.LN10 >= 10 ? 2 : 1) -
    (x < 0 ? 1 : 0), 0));
const nanOrInf = (x) => isNaN(x)
    ? "NaN"
    : x === Infinity
        ? "+∞"
        : x === -Infinity
            ? "-∞"
            : undefined;

/**
 * Returns {@link Stringer} which formats given fractions as percentage (e.g.
 * `0.1234 => 12.34%`).
 *
 * @param prec - number of fractional digits (default: 0)
 */
const percent = (prec = 0) => (x) => (x * 100).toFixed(prec) + "%";

/**
 * RGB black
 */
Object.freeze([0, 0, 0, 1]);
/**
 * RGB white
 */
Object.freeze([1, 1, 1, 1]);
/**
 * RGB red
 */
Object.freeze([1, 0, 0, 1]);
/**
 * RGB green
 */
Object.freeze([0, 1, 0, 1]);
/**
 * RGB blue
 */
Object.freeze([0, 0, 1, 1]);
/**
 * RGB cyan
 */
Object.freeze([0, 1, 1, 1]);
/**
 * RGB magenta
 */
Object.freeze([1, 0, 1, 1]);
/**
 * RGB yellow
 */
Object.freeze([1, 1, 0, 1]);
/**
 * ITU-R BT.709 RGB luminance coeffs
 *
 * @remarks
 * Reference:
 * https://en.wikipedia.org/wiki/YCbCr#ITU-R_BT.709_conversion
 */
const RGB_LUMINANCE_REC709 = [0.2126, 0.7152, 0.0722];
/**
 * XYZ D50 to sRGB conversion matrix
 *
 * @remarks
 * Reference:
 * http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
 */
const XYZ_RGB_D50 = [
    3.1338561,
    -0.9787684,
    0.0719453,
    -1.6168667,
    1.9161415,
    -0.2289914,
    -0.4906146,
    0.033454,
    1.4052427,
];
/**
 * XYZ D65 to sRGB conversion matrix
 *
 * @remarks
 * Reference:
 * http://www.brucelindbloom.com/index.html?Eqn_RGB_XYZ_Matrix.html
 */
const XYZ_RGB_D65 = [
    3.2404542,
    -0.969266,
    0.0556434,
    -1.5371385,
    1.8760108,
    -0.2040259,
    -0.4985314,
    0.041556,
    1.0572252,
];
/**
 * CIE Standard Illuminant D50
 */
const D50 = [0.96422, 1, 0.82521];
/**
 * CIE Standard Illuminant D65
 *
 * Reference:
 * https://en.wikipedia.org/wiki/Illuminant_D65
 */
const D65 = [0.95047, 1, 1.08883];
/**
 * Float value formatter
 *
 * @internal
 */
let FF = float(3);
/**
 * Percentage value formatter
 *
 * @internal
 */
let PC = percent(3);
const INV8BIT = 1 / 0xff;

const CSS_NAMES = {
    aliceblue: "f0f8ff",
    antiquewhite: "faebd7",
    aqua: "0ff",
    aquamarine: "7fffd4",
    azure: "f0ffff",
    beige: "f5f5dc",
    bisque: "ffe4c4",
    black: "000",
    blanchedalmond: "ffebcd",
    blue: "00f",
    blueviolet: "8a2be2",
    brown: "a52a2a",
    burlywood: "deb887",
    cadetblue: "5f9ea0",
    chartreuse: "7fff00",
    chocolate: "d2691e",
    coral: "ff7f50",
    cornflowerblue: "6495ed",
    cornsilk: "fff8dc",
    crimson: "dc143c",
    cyan: "0ff",
    darkblue: "00008b",
    darkcyan: "008b8b",
    darkgoldenrod: "b8860b",
    darkgray: "a9a9a9",
    darkgreen: "006400",
    darkgrey: "a9a9a9",
    darkkhaki: "bdb76b",
    darkmagenta: "8b008b",
    darkolivegreen: "556b2f",
    darkorange: "ff8c00",
    darkorchid: "9932cc",
    darkred: "8b0000",
    darksalmon: "e9967a",
    darkseagreen: "8fbc8f",
    darkslateblue: "483d8b",
    darkslategray: "2f4f4f",
    darkslategrey: "2f4f4f",
    darkturquoise: "00ced1",
    darkviolet: "9400d3",
    deeppink: "ff1493",
    deepskyblue: "00bfff",
    dimgray: "696969",
    dimgrey: "696969",
    dodgerblue: "1e90ff",
    firebrick: "b22222",
    floralwhite: "fffaf0",
    forestgreen: "228b22",
    fuchsia: "f0f",
    gainsboro: "dcdcdc",
    ghostwhite: "f8f8ff",
    gold: "ffd700",
    goldenrod: "daa520",
    gray: "808080",
    grey: "808080",
    green: "008000",
    greenyellow: "adff2f",
    honeydew: "f0fff0",
    hotpink: "ff69b4",
    indianred: "cd5c5c",
    indigo: "4b0082",
    ivory: "fffff0",
    khaki: "f0e68c",
    lavender: "e6e6fa",
    lavenderblush: "fff0f5",
    lawngreen: "7cfc00",
    lemonchiffon: "fffacd",
    lightblue: "add8e6",
    lightcoral: "f08080",
    lightcyan: "e0ffff",
    lightgoldenrodyellow: "fafad2",
    lightgray: "d3d3d3",
    lightgreen: "90ee90",
    lightgrey: "d3d3d3",
    lightpink: "ffb6c1",
    lightsalmon: "ffa07a",
    lightseagreen: "20b2aa",
    lightskyblue: "87cefa",
    lightslategray: "789",
    lightslategrey: "789",
    lightsteelblue: "b0c4de",
    lightyellow: "ffffe0",
    lime: "0f0",
    limegreen: "32cd32",
    linen: "faf0e6",
    magenta: "f0f",
    maroon: "800000",
    mediumaquamarine: "66cdaa",
    mediumblue: "0000cd",
    mediumorchid: "ba55d3",
    mediumpurple: "9370db",
    mediumseagreen: "3cb371",
    mediumslateblue: "7b68ee",
    mediumspringgreen: "00fa9a",
    mediumturquoise: "48d1cc",
    mediumvioletred: "c71585",
    midnightblue: "191970",
    mintcream: "f5fffa",
    mistyrose: "ffe4e1",
    moccasin: "ffe4b5",
    navajowhite: "ffdead",
    navy: "000080",
    oldlace: "fdf5e6",
    olive: "808000",
    olivedrab: "6b8e23",
    orange: "ffa500",
    orangered: "ff4500",
    orchid: "da70d6",
    palegoldenrod: "eee8aa",
    palegreen: "98fb98",
    paleturquoise: "afeeee",
    palevioletred: "db7093",
    papayawhip: "ffefd5",
    peachpuff: "ffdab9",
    peru: "cd853f",
    pink: "ffc0cb",
    plum: "dda0dd",
    powderblue: "b0e0e6",
    purple: "800080",
    red: "f00",
    rosybrown: "bc8f8f",
    royalblue: "4169e1",
    saddlebrown: "8b4513",
    salmon: "fa8072",
    sandybrown: "f4a460",
    seagreen: "2e8b57",
    seashell: "fff5ee",
    sienna: "a0522d",
    silver: "c0c0c0",
    skyblue: "87ceeb",
    slateblue: "6a5acd",
    slategray: "708090",
    slategrey: "708090",
    snow: "fffafa",
    springgreen: "00ff7f",
    steelblue: "4682b4",
    tan: "d2b48c",
    teal: "008080",
    thistle: "d8bfd8",
    tomato: "ff6347",
    turquoise: "40e0d0",
    violet: "ee82ee",
    wheat: "f5deb3",
    white: "fff",
    whitesmoke: "f5f5f5",
    yellow: "ff0",
    yellowgreen: "9acd32",
    // additions
    transparent: "0000",
    rebeccapurple: "639",
};

/**
 * Default CSS system colors used by {@link parseCss}. Use
 * {@link setSystemColors} to provide custom defaults.
 */
let CSS_SYSTEM_COLORS = {
    canvas: "fff",
    canvastext: "000",
    linktext: "001ee4",
    visitedtext: "4e2386",
    activetext: "eb3323",
    buttonface: "ddd",
    buttontext: "000",
    buttonborder: "000",
    field: "fff",
    fieldtext: "000",
    highlight: "bbd5fb",
    highlighttext: "000",
    mark: "000",
    marktext: "fff",
    graytext: "808080",
};

const CONVERSIONS = {};
const convert = (res, src, destMode, srcMode) => {
    const spec = CONVERSIONS[destMode];
    assert(!!spec, `no conversions available for ${destMode}`);
    let $convert = spec[srcMode];
    return $convert
        ? $convert(res, src)
        : CONVERSIONS.rgb[srcMode]
            ? spec.rgb(res, CONVERSIONS.rgb[srcMode]([], src))
            : unsupported(`can't convert: ${srcMode} -> ${destMode}`);
};

const intArgb32Srgb = (out, src) => setC4(out || [], ((src >>> 16) & 0xff) * INV8BIT, ((src >>> 8) & 0xff) * INV8BIT, (src & 0xff) * INV8BIT, (src >>> 24) * INV8BIT);

/**
 * Attempts to parse given CSS color into an interim {@link ParsedColor} type
 * with {@link srgb}, {@link hsl}, {@link labD50} or {@link lch} color modes.
 * Throws an error if any of the validations during parsing failed.
 *
 * @remarks
 * The following syntax versions are supported:
 *
 * - CSS named colors
 * - CSS system colors @see {@link CSS_SYSTEM_COLORS}
 * - hex3/4/6/8
 * - `rgb(r% g% b% / a%?)`
 * - `rgb(r g b / a?)`
 * - `rgb(r,g,b)`
 * - `rgba(r,g,b,a)`
 * - `hsl(h s% l% / a%?)`
 * - `hsl(h,s%,l%)`
 * - `hsla(h,s%,l%,a)`
 * - `lab(l a b / alpha?)`
 * - `lch(l c h / alpha?)`
 *
 * Hue values can be given according to CSS Color L4 spec (raw, deg, rad, grad,
 * turn): https://www.w3.org/TR/css-color-4/#typedef-hue
 *
 * If no alpha channel is given, it will default to 1.0 (fully opaque).
 *
 * Note that any named or system CSS colors, hex colors and any RGB colors will
 * be returned as sRGB instance. In former versions of this library (pre 3.0.0),
 * there was only a single RGB type with undefined behaviour re: linear or
 * gamma-encoded versions. Since v3.0.0, {@link rgb} is only used for _linear_
 * and {@link srgb} for non-linear (gamma encoded) RGB colors (CSS uses sRGB by
 * default).
 *
 * @param src
 */
const parseCss = (src) => {
    src = (isString(src) ? src : src.deref()).toLowerCase();
    const named = CSS_NAMES[src] || CSS_SYSTEM_COLORS[src];
    if (named || src[0] === "#")
        return new ParsedColor("srgb", intArgb32Srgb([], parseHex(named || src)));
    const parts = src.split(/[(),/ ]+/);
    const [mode, a, b, c, d] = parts;
    assert(parts.length === 5 || parts.length === 6, `invalid ${mode} color: ${src}`);
    switch (mode) {
        case "rgb":
        case "rgba":
            return new ParsedColor("srgb", [
                parseNumOrPercent(a),
                parseNumOrPercent(b),
                parseNumOrPercent(c),
                parseAlpha(d),
            ]);
        case "hsl":
        case "hsla":
            return new ParsedColor("hsl", [
                parseHue(a),
                parsePercent(b),
                parsePercent(c),
                parseAlpha(d),
            ]);
        case "lab":
            return new ParsedColor("lab50", [
                parsePercent(a, false),
                parseNumber(b) * 0.01,
                parseNumber(c) * 0.01,
                parseAlpha(d),
            ]);
        case "lch":
            return new ParsedColor("lch", [
                parsePercent(a, false),
                parseNumber(b) * 0.01,
                parseHue(c),
                parseAlpha(d),
            ]);
        default:
            unsupported(`color mode: ${mode}`);
    }
};
const HUE_NORMS = {
    rad: TAU,
    grad: 400,
    turn: 1,
    deg: 360,
    undefined: 360,
};
const parseHue = (x) => {
    const match = /^(-?[0-9.]+)(deg|rad|grad|turn)?$/.exec(x);
    assert(!!match, `expected hue, got: ${x}`);
    return fract(parseFloat(match[1]) / HUE_NORMS[match[2]]);
};
const parseAlpha = (x) => (x ? parseNumOrPercent(x, 1) : 1);
const parsePercent = (x, clamp = true) => {
    assert(/^([0-9.]+)%$/.test(x), `expected percentage, got: ${x}`);
    const res = parseFloat(x) / 100;
    return clamp ? clamp01(res) : res;
};
const parseNumber = (x) => {
    assert(/^-?[0-9.]+$/.test(x), `expected number, got: ${x}`);
    return parseFloat(x);
};
const parseNumOrPercent = (x, norm = 255, clamp = true) => {
    assert(/^-?[0-9.]+%?$/.test(x), `expected number or percentage, got: ${x}`);
    const res = parseFloat(x) / (x.endsWith("%") ? 100 : norm);
    return clamp ? clamp01(res) : res;
};
const parseHex = (src) => {
    const match = /^#?([0-9a-f]{3,8})$/i.exec(src);
    if (match) {
        const hex = match[1];
        switch (hex.length) {
            case 3:
                return ((interleave4_12_24(parseInt(hex, 16)) | 0xff000000) >>> 0);
            case 4:
                return interleave4_16_32(parseInt(hex, 16)) >>> 0;
            case 6:
                return (parseInt(hex, 16) | 0xff000000) >>> 0;
            case 8:
                return parseInt(hex, 16) >>> 0;
        }
    }
    return illegalArgs(`invalid hex color: "${src}"`);
};

const ensureAlpha = (x, def = 1) => x != undefined ? clamp01(x) : def;

/**
 * Maps a single linear RGB channel value to sRGB.
 *
 * {@link https://en.wikipedia.org/wiki/SRGB}
 *
 * @param x - channel value
 */
const linearSrgb = (x) => x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;

/**
 * Converts a normalized hue to RGBA with given optional `alpha`
 * value (default: 1).
 *
 * @param out - result
 * @param hue - normalized hue
 */
const hueRgb = (out, hue, alpha = 1) => {
    hue = fract(hue) * 6;
    return setC4(out || [], clamp01(Math.abs(hue - 3) - 1), clamp01(2 - Math.abs(hue - 2)), clamp01(2 - Math.abs(hue - 4)), alpha);
};

/**
 * Computes RGB luminance, optionally using provided weights (by default:
 * {@link RGB_LUMINANCE_REC709}).
 *
 * @param rgb
 * @param weights
 */
const luminanceRgb = (rgb, weights = RGB_LUMINANCE_REC709) => dot3(rgb, weights);

/**
 * Clamps all color channels to [0,1] interval and calls `ensureAlpha`
 * to ensure alpha channel is defined (if missing sets it to `alpha`,
 * default: 1).
 *
 * @param out - result
 * @param src - source color
 * @param alpha - alpha value
 */
const clamp = (out, src, alpha = 1) => setC4(out || src, clamp01(src[0]), clamp01(src[1]), clamp01(src[2]), ensureAlpha(src[3], alpha));
/**
 * Similar to {@link clamp}, but calls `ensureHue` to fold (instead of
 * clamping) the hue into [0,1] interval.
 *
 * @param out - result
 * @param src - source color
 * @param alpha - alpha value
 */
const clampH = (out, src, alpha = 1) => setC4(out || src, fract(src[0]), clamp01(src[1]), clamp01(src[2]), ensureAlpha(src[3], alpha));

/**
 * Based on:
 * {@link https://github.com/tobspr/GLSL-Color-Spaces/blob/develop/ColorSpaces.inc.glsl#L159}
 *
 * @param out - result
 * @param src - source color
 */
const rgbHcv = (out, src) => {
    out = clamp(out || src, src);
    const p = out[1] < out[2]
        ? [out[2], out[1], -1, 2 / 3]
        : [out[1], out[2], 0, -1 / 3];
    const q = out[0] < p[0] ? [p[0], p[1], p[3], out[0]] : [out[0], p[1], p[2], p[0]];
    const c = q[0] - Math.min(q[1], q[3]);
    return setC3(out, clamp01(Math.abs((q[3] - q[1]) / (6 * c + EPS) + q[2])), clamp01(c), clamp01(q[0]));
};

const hsvHsl = (out, src) => {
    out = clampH(out || src, src);
    const s = out[1];
    const v = out[2];
    const l = ((2 - s) * v) / 2;
    out[2] = l;
    out[1] = l && l < 1 ? (s * v) / (l < 0.5 ? l * 2 : 2 - l * 2) : s;
    return out;
};

const rgbHsl = (out, src) => {
    out = rgbHcv(out, src);
    out[2] -= out[1] * 0.5;
    out[1] /= 1 + EPS - Math.abs(out[2] * 2 - 1);
    return out;
};

const rgbHsv = (out, src) => {
    out = rgbHcv(out, src);
    out[1] /= out[2] + EPS;
    return out;
};

const hslRgb = (out, src) => {
    const s = clamp01(src[1]);
    const l = clamp01(src[2]);
    out = hueRgb(out || src, src[0], ensureAlpha(src[3]));
    const c = (1 - Math.abs(2 * l - 1)) * s;
    return setC3(out, (out[0] - 0.5) * c + l, (out[1] - 0.5) * c + l, (out[2] - 0.5) * c + l);
};

const hsvRgb = (out, src) => {
    out = clampH(out || src, src);
    const s = out[1];
    const v = out[2];
    hueRgb(out, src[0], out[3]);
    return setC3(out, ((out[0] - 1) * s + 1) * v, ((out[1] - 1) * s + 1) * v, ((out[2] - 1) * s + 1) * v);
};

/**
 * Converts linear RGB to sRGB.
 *
 * @param out - result
 * @param src - source color
 */
const rgbSrgb = (out, src) => setC4(out || src, linearSrgb(src[0]), linearSrgb(src[1]), linearSrgb(src[2]), ensureAlpha(src[3]));

const mulV33 = (out, mat, src, clampOut = false) => {
    const x = dotS3(mat, src, 0, 0, 3);
    const y = dotS3(mat, src, 1, 0, 3);
    const z = dotS3(mat, src, 2, 0, 3);
    const a = ensureAlpha(src[3]);
    return clampOut
        ? setC4(out || src, clamp01(x), clamp01(y), clamp01(z), a)
        : setC4(out || src, x, y, z, a);
};

const transform = (x) => {
    const y = x ** 3;
    return y > 0.008856 ? y : (x - 16 / 116) / 7.787;
};
/**
 * Converts Lab to XYZ using provided white point (default: {@link D50}). Also
 * see {@link labXyzD65}.
 *
 * @param out
 * @param src
 * @param white
 */
const labXyz = (out, src, white = D50) => {
    const y = (src[0] + 0.16) / 1.16;
    return setC4(out || src, transform(src[1] / 5.0 + y) * white[0], transform(y) * white[1], transform(y - src[2] / 2.0) * white[2], ensureAlpha(src[3]));
};
/**
 * Same as {@link labXyz}, but using hardcoded {@link D65} white point.
 *
 * @param out
 * @param src
 */
const labXyzD65 = (out, src) => labXyz(out, src, D65);

const lchLab = (out, src) => {
    let { 1: c, 2: h } = src;
    h *= TAU;
    const a = ensureAlpha(src[3]);
    return c > 0
        ? setC4(out || src, src[0], Math.cos(h) * c, Math.sin(h) * c, a)
        : setC4(out || src, src[0], 0, 0, a);
};

/**
 * Converts CIE XYZ to RGB using provided transformation/whitepoint matrix
 * (default: {@link XYZ_RGB_D50}).
 *
 * {@link https://en.wikipedia.org/wiki/CIE_1931_color_space}
 *
 * @param out - result
 * @param src - source color
 */
const xyzRgb = (out, src, mat = XYZ_RGB_D50) => mulV33(out, mat, src);
/**
 * Same as {@link xyzRgb}, but hard coded to use {@link D65} white point (via
 * {@link XYZ_RGB_D65} matrix).
 *
 * @param out
 * @param src
 */
const xyzRgbD65 = (out, src) => xyzRgb(out, src, XYZ_RGB_D65);

/**
 * Converts Lab to linear RGB (via XYZ) using {@link D50} white point.
 *
 * @param out
 * @param src
 */
const labRgb = (out, src) => xyzRgb(null, labXyz(out, src));
/**
 * Same as {@link labRgb}, but using {@link D65} white point.
 *
 * @param out
 * @param src
 */
const labRgbD65 = (out, src) => xyzRgbD65(null, labXyzD65(out, src));

const hslCss = (src) => {
    const h = FF(fract(src[0]) * 360);
    const s = PC(clamp01(src[1]));
    const l = PC(clamp01(src[2]));
    const a = ensureAlpha(src[3]);
    // TODO update to new syntax once CSS Color L4 is more widely supported
    // https://www.w3.org/TR/css-color-4/#serializing-lab-lch
    // https://test.csswg.org/harness/results/css-color-4_dev/grouped/ (test reports)
    // return `hsl(${h} ${s} ${l}` + (a < 1 ? `/${FF(a)})` : ")");
    return a < 1 ? `hsla(${h},${s},${l},${FF(a)})` : `hsl(${h},${s},${l})`;
};

const hsvCss = (src) => hslCss(hsvHsl([], src));

const intArgb32Css = (src) => {
    const a = src >>> 24;
    return a < 255
        ? `rgba(${(src >> 16) & 0xff},${(src >> 8) & 0xff},${src & 0xff},${FF(a * INV8BIT)})`
        : `#${U24(src & 0xffffff)}`;
};

/**
 * Alias for {@link intArgbAbgr}.
 */
const intAbgr32Argb32 = swapLane13;

const srgbCss = (src) => {
    const r = (clamp01(src[0]) * 0xff + 0.5) | 0;
    const g = (clamp01(src[1]) * 0xff + 0.5) | 0;
    const b = (clamp01(src[2]) * 0xff + 0.5) | 0;
    const a = ensureAlpha(src[3]);
    // TODO update to `rgb(${r} ${g} ${b}/${FF(a)})` (CSS L4 syntax)
    return a < 1
        ? `rgba(${r},${g},${b},${FF(a)})`
        : `#${U24((r << 16) | (g << 8) | b)}`;
};

const rgbCss = (src) => srgbCss(rgbSrgb([], src));

/** @internal */
const CSS_CONVERSIONS = {
    abgr32: (x) => intArgb32Css(intAbgr32Argb32(x[0])),
    argb32: (x) => intArgb32Css(x[0]),
    hsl: hslCss,
    hsv: hsvCss,
    // TODO temporarily disabled until CSS L4 is officially supported in browsers
    // currently serializing as sRGB CSS
    // lab50: labCss,
    // lab65: (x) => labCss(labLabD65_50([], x)),
    // lch: lchCss,
    lab50: (src) => srgbCss(rgbSrgb(null, labRgb([], src))),
    lab65: (src) => srgbCss(rgbSrgb(null, labRgbD65([], src))),
    lch: (src) => srgbCss(rgbSrgb(null, labRgb(null, lchLab([], src)))),
    rgb: rgbCss,
    srgb: srgbCss,
};
/**
 * Takes a color in one of the following formats and tries to convert it
 * to a CSS string:
 *
 * - any {@link TypedColor} instance
 * - raw sRGB(A) vector
 * - number (packed 0xaarrggbb int, MUST provide alpha channel)
 * - string (passthrough)
 *
 * @param col - source color
 */
const css = (src) => {
    let asCss;
    return isString(src)
        ? src
        : isNumber(src)
            ? intArgb32Css(src)
            : src.mode
                ? (asCss = CSS_CONVERSIONS[src.mode])
                    ? asCss(src)
                    : CSS_CONVERSIONS.rgb(convert([], src, "rgb", src.mode))
                : srgbCss(src);
};

export { CSS_NAMES, css, hslRgb, hsvRgb, luminanceRgb, parseCss, rgbHsl, rgbHsv };
//# sourceMappingURL=color.js.map
