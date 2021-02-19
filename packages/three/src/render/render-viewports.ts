/**
 *
 * Helper functions for rendering various types
 * to rectangular regions of the viewport.
 *
 */
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  Texture,
  Vector4,
  MeshBasicMaterial,
  Mesh,
  PlaneBufferGeometry,
  DoubleSide,
  FrontSide,
  BackSide,
  BufferAttribute,
} from "three";
import { range2d, map } from "@thi.ng/transducers";

/**
 * Temp helper objects.
 */
const tmp = (() => {
  const viewport = new Vector4();
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new MeshBasicMaterial({
    color: "white",
  });
  const geometry = new PlaneBufferGeometry(2, 2);

  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  return {
    viewport,
    scene,
    camera,
    material,
    mesh,
  };
})();
/**
 * Api
 */
interface RenderViewportRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 *
 * Render to a single viewport rectangle.
 *
 * @param renderer
 * @param rect
 * @param render
 */
export const renderViewportRect = (
  renderer: WebGLRenderer,
  rect: RenderViewportRect,
  render: (renderer: WebGLRenderer, rect: RenderViewportRect) => void
) => {
  renderViewportRects(renderer, [rect], render);
};

/**
 *
 * Render to multiple viewport rectangles.
 *
 * @param renderer
 * @param rects
 * @param render
 */
export const renderViewportRects = (
  renderer: WebGLRenderer,
  rects: RenderViewportRect[],
  render: (renderer: WebGLRenderer, rect: RenderViewportRect) => void
) => {
  renderer.getViewport(tmp.viewport);
  renderer.setScissorTest(true);

  rects.forEach((rect) => {
    renderer.setViewport(rect.x, rect.y, rect.width, rect.height);
    renderer.setScissor(rect.x, rect.y, rect.width, rect.height);
    renderer.clearDepth();
    render(renderer, rect);
  });

  renderer.setViewport(tmp.viewport);
  renderer.setScissorTest(false);
};

/**
 *
 * Render a texture to the given viewport Rect.
 *
 * @param renderer
 * @param opts
 */
export const renderViewportTexture = (
  renderer: WebGLRenderer,
  texture: Texture,
  rect: RenderViewportRect
) => {
  tmp.material.map = texture;
  renderViewportRect(renderer, rect, () => {
    renderer.render(tmp.scene, tmp.camera);
  });
};

export const renderTextures = () => {};

interface RenderGridOpts {
  grid: [number, number];
  render: (i: number, xy: [number, number], wh: [number, number]) => void;
}

/**
 *
 * Render a number of regions in a grid.
 *
 * @param renderer
 * @param opts
 */
export const renderViewportGrid = (
  renderer: WebGLRenderer,
  opts: RenderGridOpts
) => {
  const [gx, gy] = opts.grid;
  const { width, height } = renderer.getContext().canvas;
  const pr = renderer.getPixelRatio();

  const vw = width / pr / gx;
  const vh = height / pr / gy;

  renderer.setScissorTest(true);

  [...range2d(gx, gy)].map(([x, y], i) => {
    renderer.setScissor(vw * x, vh * y, vw, vh);
    renderer.setViewport(vw * x, vh * y, vw, vh);
    opts.render(i, [x, y], [vw, vh]);
  });

  renderer.setScissorTest(false);
};
