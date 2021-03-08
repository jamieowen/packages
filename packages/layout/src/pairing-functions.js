export function cantorPair(x, y) {
  return 0.5 * (x + y) * (x + y + 1) + y;
}
export function cantorPairSigned(x, y) {
  const a = x >= 0 ? 2 * x : -2 * x - 1;
  const b = y >= 0 ? 2 * y : -2 * y - 1;
  return cantorPair(a, b);
}
export function szudzikPair(x, y) {
  return x >= y ? x * x + x + y : y * y + x;
}
export function szudzikPairSigned(x, y) {
  const a = x >= 0 ? 2 * x : -2 * x - 1;
  const b = y >= 0 ? 2 * y : -2 * y - 1;
  return szudzikPair(a, b) * 0.5;
}
export function szudzikPairSignedB(x, y) {
  const a = x >= 0 ? 2 * x : -2 * x - 1;
  const b = y >= 0 ? 2 * y : -2 * y - 1;
  const c = szudzikPair(a, b) * 0.5;
  if (a >= 0 && b < 0 || a < 0 && b >= 0) {
    return -c - 1;
  }
  return c;
}
//# sourceMappingURL=pairing-functions.js.map
