export type GridOpts = {
  // Dimensions of each grid cell
  dimensions: [number, number];
  // Size of viewport
  viewport: [number, number];
};

export type SubdivCond = (item: SubdivItem) => boolean;
export type SubGridOpts = GridOpts & {
  maxDepth: number;
  subdivide: SubdivCond;
};

export type GridIdGen = (x: number, y: number) => number;

// Used when iterating & subdividing
export type SubdivItem = [
  id: number,
  x: number,
  y: number,
  step: number,
  depth: number
];

export type GridCell = {
  id: number;
  world: [number, number];
  cell: [number, number];
  local: [number, number];
};

export type SubGridCell = GridCell & {
  step: number;
  depth: number;
};

export default {};
