export function quadInOut(t) {
  t /= 0.5;
  if (t < 1)
    return 0.5 * t * t;
  t--;
  return -0.5 * (t * (t - 2) - 1);
}
//# sourceMappingURL=quad-in-out.js.map
