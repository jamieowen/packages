import {
  range2d,
  map,
  mapcat,
  iterator
} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
export const subdivRange2dIterator = (fromX, toX, fromY, toY, step, depth, idGen) => iterator(map(([x, y]) => [
  idGen(x, y),
  x,
  y,
  step,
  depth
]), range2d(fromX, toX, fromY, toY, step, step));
export const mapSubdivide = (idGen) => mapcat(([id, x, y, step, depth]) => {
  const subStep = step * 0.5;
  return subdivRange2dIterator(x, x + step, y, y + step, subStep, depth + 1, idGen);
});
export const mapSubdivideIf = (idGen, cond) => mapcat((item) => {
  if (cond(item)) {
    const [id, x, y, step, depth] = item;
    const subStep = step * 0.5;
    return subdivRange2dIterator(x, x + step, y, y + step, subStep, depth + 1, idGen);
  } else {
    return [item];
  }
});
//# sourceMappingURL=grid-rfn.js.map
