import { WebGLRenderer, Scene, Camera } from "three";
import { range2d, map } from "@thi.ng/transducers";

type RenderGridParams = {
  grid: [number, number];
  render: (i: number, xy: [number, number], wh: [number, number]) => void;
};

type RenderRegion = {
  w: number;
  h: number;
  x: number;
  y: number;
};

type RenderRegionsParams = {
  regions: RenderRegion[] | any[];
  /** Map function for custom region type */
  map?: (a: any) => RenderRegion;
};

/**
 * Prepare the renderer to render viewports using scissor rect.
 *
 */
export const renderViewportGrid = (
  renderer: WebGLRenderer,
  params: RenderGridParams
) => {
  const [gx, gy] = params.grid;
  const { width, height } = renderer.getContext().canvas;
  const pr = renderer.getPixelRatio();

  const vw = width / pr / gx;
  const vh = height / pr / gy;

  renderer.setScissorTest(true);

  [...range2d(gx, gy)].map(([x, y], i) => {
    renderer.setScissor(vw * x, vh * y, vw, vh);
    renderer.setViewport(vw * x, vh * y, vw, vh);
    params.render(i, [x, y], [vw, vh]);
  });

  renderer.setScissorTest(false);
};

export const renderViewportRegions = (
  renderer: WebGLRenderer,
  params: RenderRegionsParams
) => {
  const { width, height } = renderer.getContext().canvas;
  const pr = renderer;
};
