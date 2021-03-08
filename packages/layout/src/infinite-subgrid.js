import {sync} from "../../../_snowpack/pkg/@thi.ng/rstream.js";
import {comp, iterator, map} from "../../../_snowpack/pkg/@thi.ng/transducers.js";
import {ChangeMap} from "./change-map.js";
import {szudzikPairSigned} from "./pairing-functions.js";
import {subdivRange2dIterator, mapSubdivideIf} from "./grid-rfn.js";
export const infiniteSubGridIterator = (position, opts) => {
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
  const {maxDepth = 1, subdivide = () => true} = opts;
  const subdivScale = Math.pow(4, maxDepth);
  const idGen = (x, y) => szudzikPairSigned(x * subdivScale, y * subdivScale);
  const compDivide = [];
  for (let i = 0; i < maxDepth; i++) {
    compDivide.push(mapSubdivideIf(idGen, subdivide));
  }
  return iterator(comp(comp.apply(comp, compDivide), map(([id, x, y, step, depth]) => {
    const wx = x * gw;
    const wy = y * gh;
    return {
      id,
      cell: [x, y],
      world: [wx, wy],
      local: [wx - px, wy - py],
      depth,
      step
    };
  })), subdivRange2dIterator(fromX, toX, fromY, toY, 1, 0, idGen));
};
export function infiniteSubGrid(position, opts, handle) {
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
      const gridIterator = infiniteSubGridIterator(position2, opts2);
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
//# sourceMappingURL=infinite-subgrid.js.map
