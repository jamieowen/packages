import {WebGLRenderer} from "../../../../_snowpack/pkg/three.js";
import {resizeObserverStream} from "../../../../_snowpack/pkg/@jamieowen/browser.js";
export const createRenderer = (mountElement, params) => {
  const mount = mountElement || document.body;
  const renderer = new WebGLRenderer({
    antialias: true,
    ...params
  });
  const domElement = createContainer(renderer.domElement);
  mount.appendChild(domElement);
  const resize = resizeObserverStream(domElement);
  resize.subscribe({
    next: ({entry, width, height}) => {
      renderer.setSize(width, height);
    }
  });
  return {resize, domElement, renderer};
};
const createContainer = (canvas) => {
  const element = document.createElement("div");
  element.style.position = "absolute";
  element.style.width = "100%";
  element.style.height = "100%";
  element.appendChild(canvas);
  return element;
};
//# sourceMappingURL=renderer.js.map
