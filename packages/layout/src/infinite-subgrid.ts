import { ISubscribable, sync } from "@thi.ng/rstream";
import { comp, iterator, map } from "@thi.ng/transducers";
import { ChangeMap } from "./change-map";
import { szudzikPairSigned } from "./pairing-functions";
import { SubGridCell, SubGridOpts } from "./grid-types";
import { subdivRange2dIterator, mapSubdivideIf } from "./grid-rfn";

/**
 *
 * Return an infinite grid iterator given a start position,
 * grid cell and viewport dimensions.
 *
 * @param position
 * @param opts
 */
export const infiniteSubGridIterator = (
  position: [number, number],
  opts: SubGridOpts
) => {
  const [gw, gh] = opts.dimensions;
  const [vw, vh] = opts.viewport;

  const px = position[0];
  const py = position[1];

  // start cell x/y
  const fromX = Math.floor(px / gw);
  const fromY = Math.floor(py / gh);

  // cell row / cols
  const xCount = Math.ceil(vw / gw) + 1;
  const yCount = Math.ceil(vh / gh) + 1;

  const toX = fromX + xCount;
  const toY = fromY + yCount;

  const { maxDepth = 1, subdivide = () => true } = opts;
  const subdivScale = Math.pow(4, maxDepth);
  const idGen = (x: number, y: number) =>
    szudzikPairSigned(x * subdivScale, y * subdivScale);

  // todo: ? unroll loops to a number of depths?
  const compDivide = [];
  for (let i = 0; i < maxDepth; i++) {
    compDivide.push(mapSubdivideIf(idGen, subdivide));
  }

  return iterator(
    comp(
      comp.apply(comp, compDivide),
      map(([id, x, y, step, depth]) => {
        const wx = x * gw;
        const wy = y * gh;
        return {
          id,
          cell: [x, step],
          world: [wx, wy],
          local: [wx - px, wy - py],
          depth,
        } as SubGridCell;
      })
    ),
    subdivRange2dIterator(fromX, toX, fromY, toY, 1, 0, idGen)
  );
};

/**
 * Creates a reactive infinite grid with
 * @param position
 * @param opts
 */
export function infiniteSubGrid<T = any>(
  position: ISubscribable<[number, number]>,
  opts: ISubscribable<SubGridOpts>,
  handle: {
    add: (cell: SubGridCell) => T;
    remove: (id: number, handler: T) => void;
    update: (cell: SubGridCell, handler: T) => void;
  }
) {
  const changeMap = new ChangeMap<number, T>();
  let res = [];
  return sync({
    src: {
      position,
      opts,
    },
    xform: map(({ opts, position }) => {
      const gridIterator = infiniteSubGridIterator(position, opts);
      res.splice(0);
      for (let cell of gridIterator) {
        const handler = changeMap.set(cell.id, () => handle.add(cell));
        handle.update(cell, handler);
        res.push(cell);
      }
      changeMap.next((id, val) => handle.remove(id, val));
      return res;
    }),
  });
}
