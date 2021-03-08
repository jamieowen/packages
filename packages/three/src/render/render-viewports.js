import {
  Scene,
  OrthographicCamera,
  Vector4,
  MeshBasicMaterial,
  Mesh,
  PlaneBufferGeometry
} from "../../../../_snowpack/pkg/three.js";
import {range2d} from "../../../../_snowpack/pkg/@thi.ng/transducers.js";
const tmp = (() => {
  const viewport = new Vector4();
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const material = new MeshBasicMaterial({
    color: "white"
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
    mesh
  };
})();
export const renderViewportRect = (renderer, rect, render) => {
  renderViewportRects(renderer, [rect], render);
};
export const renderViewportRects = (renderer, rects, render) => {
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
export const renderViewportTexture = (renderer, texture, rect) => {
  tmp.material.map = texture;
  renderViewportRect(renderer, rect, () => {
    renderer.render(tmp.scene, tmp.camera);
  });
};
export const renderTextures = () => {
};
export const renderViewportGrid = (renderer, opts) => {
  const [gx, gy] = opts.grid;
  const {width, height} = renderer.getContext().canvas;
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
//# sourceMappingURL=render-viewports.js.map
