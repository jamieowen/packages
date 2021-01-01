import { ISubscribable, sync } from "@thi.ng/rstream";
import { comp, iterator, map, range2d } from "@thi.ng/transducers";
import { ChangeMap } from "./change-map";
import { szudzikPairSigned } from "./pairing-functions";
import { GridCell, GridOpts } from "./grid-types";

export { reactive } from "@thi.ng/rstream";
/**
 *
 * Return an infinite grid iterator given a start position,
 * grid cell and viewport dimensions.
 *
 * @param position
 * @param opts
 */
export const infiniteGridIterator = (
  position: [number, number],
  opts: GridOpts
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

  return iterator(
    comp(
      map(([x, y]) => {
        const wx = x * gw;
        const wy = y * gh;
        const id = szudzikPairSigned(x, y);
        return {
          id,
          cell: [x, y],
          world: [wx, wy],
          local: [wx - px, wy - py],
        } as GridCell;
      })
    ),
    range2d(fromX, toX, fromY, toY)
  );
};

/**
 * Creates a reactive infinite grid with
 * @param position
 * @param opts
 */
export function infiniteGrid<T = any>(
  position: ISubscribable<[number, number]>,
  opts: ISubscribable<GridOpts>,
  handle: {
    add: (cell: GridCell) => T;
    remove: (id: number, handler: T) => void;
    update: (cell: GridCell, handler: T) => void;
  }
) {
  const changeMap = new ChangeMap<number, T>();
  let res: GridCell[] = [];
  return sync({
    src: {
      position,
      opts,
    },
    xform: map(({ opts, position }) => {
      const gridIterator = infiniteGridIterator(position, opts);
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
