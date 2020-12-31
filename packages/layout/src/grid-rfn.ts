import {
  range2d,
  map,
  mapcat,
  comp,
  filter,
  iterator,
} from "@thi.ng/transducers";
import { GridIdGen, SubdivItem } from "./grid-types";

export const subdivRange2dIterator = (
  fromX: number,
  toX: number,
  fromY: number,
  toY: number,
  step: number,
  depth: number,
  idGen: GridIdGen
) =>
  iterator(
    map<[number, number], SubdivItem>(([x, y]) => [
      idGen(x, y),
      x,
      y,
      step,
      depth,
    ]),
    range2d(fromX, toX, fromY, toY, step, step)
  );

export const mapSubdivide = (idGen: GridIdGen) =>
  mapcat<SubdivItem, SubdivItem>(([id, x, y, step, depth]) => {
    const subStep = step * 0.5;
    return subdivRange2dIterator(
      x,
      x + step,
      y,
      y + step,
      subStep,
      depth + 1,
      idGen
    );
  });

export const mapSubdivideIf = (
  idGen: GridIdGen,
  cond: (v: SubdivItem) => boolean
) =>
  mapcat<SubdivItem, SubdivItem>((item) => {
    if (cond(item)) {
      const [id, x, y, step, depth] = item;
      const subStep = step * 0.5;
      return subdivRange2dIterator(
        x,
        x + step,
        y,
        y + step,
        subStep,
        depth + 1,
        idGen
      );
    } else {
      return [item];
    }
  });
