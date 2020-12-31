/**
 * https://www.vertexfragment.com/ramblings/cantor-szudzik-pairing-functions
 */

export function cantorPair(x: number, y: number) {
  return 0.5 * (x + y) * (x + y + 1) + y;
}

export function cantorPairSigned(x: number, y: number) {
  const a = x >= 0.0 ? 2.0 * x : -2.0 * x - 1.0;
  const b = y >= 0.0 ? 2.0 * y : -2.0 * y - 1.0;
  return cantorPair(a, b);
}

export function szudzikPair(x: number, y: number) {
  return x >= y ? x * x + x + y : y * y + x;
}

export function szudzikPairSigned(x: number, y: number) {
  const a = x >= 0.0 ? 2.0 * x : -2.0 * x - 1.0;
  const b = y >= 0.0 ? 2.0 * y : -2.0 * y - 1.0;
  return szudzikPair(a, b) * 0.5;
}

export function szudzikPairSignedB(x: number, y: number) {
  const a = x >= 0.0 ? 2.0 * x : -2.0 * x - 1.0;
  const b = y >= 0.0 ? 2.0 * y : -2.0 * y - 1.0;
  const c = szudzikPair(a, b) * 0.5;

  if ((a >= 0.0 && b < 0.0) || (a < 0.0 && b >= 0.0)) {
    return -c - 1;
  }

  return c;
}
