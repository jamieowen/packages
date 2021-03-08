import {PerspectiveCamera, Scene} from "../../../../_snowpack/pkg/three.js";
import {rafClockStream} from "../streams/raf-clock-stream.js";
import {gestureStream3d} from "../interaction/index.js";
import {keyboardStream} from "../../../../_snowpack/pkg/@jamieowen/browser.js";
import {createRenderer} from "../factory-fn/renderer.js";
import {orbitControls} from "../factory-fn/controls.js";
export function createSketch(setup, container) {
  const {domElement, renderer, resize} = createRenderer(container);
  renderer.setPixelRatio(2);
  const scene = new Scene();
  const camera = new PerspectiveCamera(45);
  camera.position.set(0, 2, 10);
  camera.lookAt(0, 0, 0);
  resize.subscribe({
    next: ({width, height}) => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  });
  let userRender;
  const render = (render2) => {
    userRender = render2;
  };
  const clock = rafClockStream();
  clock.subscribe({
    next: ({delta, frame, time}) => {
      if (userRender) {
        const autoRender = userRender({
          delta,
          frame,
          time
        });
        if (autoRender || autoRender === void 0) {
          renderer.render(scene, camera);
        }
      }
    }
  });
  const controls = orbitControls(camera, renderer.domElement);
  controls.enabled = false;
  const gestures = gestureStream3d(renderer.domElement, camera, resize);
  const keyboard = keyboardStream({
    listen: [" "]
  });
  keyboard.subscribe({
    next: ({isKeyDown, keysDown, keysToggled}) => {
      controls.enabled = isKeyDown;
    }
  });
  const configure = (config) => {
    domElement.style.width = config.width.toString();
    domElement.style.height = config.height.toString();
  };
  domElement.style.touchAction = "none";
  setup({
    domElement,
    renderer,
    scene,
    camera,
    resize,
    render,
    clock,
    configure,
    controls,
    gestures,
    keyboard
  });
}
export const sketch = createSketch;
//# sourceMappingURL=sketch.js.map
