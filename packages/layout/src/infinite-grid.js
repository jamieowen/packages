import {sync} from "../../../_snowpack/pkg/@thi.ng/rstream.js";
import {comp, iterator, map, range2d} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
import {ChangeMap} from "./change-map.js";
import {szudzikPairSigned} from "./pairing-functions.js";
export {reactive} from "../../../_snowpack/pkg/@thi.ng/rstream.js";
export const infiniteGridIterator = (position, opts) => {
  const [gw, gh] = opts.dimensions;
  const [vw, vh] = opts.viewport;
  const px = -position[0];
  const py = -position[1];
  const fromX = Math.floor(px / gw);
  const fromY = Math.floor(py / gh);
  const xCount = Math.ceil(vw / gw) + 1;
  const yCount = Math.ceil(vh / gh) + 1;
  const toX = fromX + xCount;
  const toY = fromY + yCount;
  return iterator(comp(map(([x, y]) => {
    const wx = x * gw;
    const wy = y * gh;
    const id = szudzikPairSigned(x, y);
    return {
      id,
      cell: [x, y],
      world: [wx, wy],
      local: [wx - px, wy - py]
    };
  })), range2d(fromX, toX, fromY, toY));
};
export function infiniteGrid(position, opts, handle) {
  const changeMap = new ChangeMap();
  if (!handle) {
    handle = {
      add: () => null,
      remove: () => {
      },
      update: () => {
      }
    };
  }
  let res = [];
  return sync({
    src: {
      position,
      opts
    },
    xform: map(({opts: opts2, position: position2}) => {
      const gridIterator = infiniteGridIterator(position2, opts2);
      res.splice(0);
      for (let cell of gridIterator) {
        const handler = changeMap.set(cell.id, () => handle.add(cell));
        handle.update(cell, handler);
        res.push(cell);
      }
      changeMap.next((id, val) => handle.remove(id, val));
      return res;
    })
  });
}
//# sourceMappingURL=infinite-grid.js.map
