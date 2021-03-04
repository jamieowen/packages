import { Fn } from "@thi.ng/api";
import { PerspectiveCamera, Scene } from "three";
import { rafClockStream } from "../streams/raf-clock-stream";
import { gestureStream3d } from "../interaction";
import { keyboardStream } from "@jamieowen/browser";
import { createRenderer } from "../factory-fn/renderer";
import { orbitControls } from "../factory-fn/controls";

type SketchConfigure = {
  width: number | string;
  height: number | string;
};

type SketchSetup = ReturnType<typeof createRenderer> & {
  scene: Scene;
  camera: PerspectiveCamera;
  render: Fn<FnSketchRender, void>;
  configure: Fn<SketchConfigure, void>;
  clock: ReturnType<typeof rafClockStream>;
  controls: ReturnType<typeof orbitControls>;
  gestures: ReturnType<typeof gestureStream3d>;
  keyboard: ReturnType<typeof keyboardStream>;
};

type SketchRender = {
  delta: number;
  time: number;
  frame: number;
};

type FnSketchSetup = Fn<SketchSetup, void>;
type FnSketchRender = Fn<SketchRender, boolean | void>;

export function createSketch(
  setup: FnSketchSetup,
  container?: HTMLElement
): void {
  const { domElement, renderer, resize } = createRenderer(container);
  renderer.setPixelRatio(2);
  const scene = new Scene();
  const camera = new PerspectiveCamera(45);
  camera.position.set(0, 2, 10);
  camera.lookAt(0, 0, 0);
  resize.subscribe({
    next: ({ width, height }) => {
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    },
  });
  let userRender: FnSketchRender;
  const render: Fn<FnSketchRender, void> = (render: FnSketchRender): void => {
    userRender = render;
  };
  const clock = rafClockStream();
  clock.subscribe({
    next: ({ delta, frame, time }) => {
      if (userRender) {
        const autoRender = userRender({
          delta,
          frame,
          time,
        });

        // Return false to prevent automatically rendering the default scene and camera
        if (autoRender || autoRender === undefined) {
          renderer.render(scene, camera);
        }
      }
    },
  });
  const controls = orbitControls(camera, renderer.domElement);
  controls.enabled = false;
  const gestures = gestureStream3d(renderer.domElement, camera, resize);
  const keyboard = keyboardStream({
    listen: [" "],
  });
  keyboard.subscribe({
    next: ({ isKeyDown, keysDown, keysToggled }) => {
      controls.enabled = isKeyDown;
    },
  });

  const configure = (config: Partial<SketchConfigure>) => {
    // resize observer will trigger a renderer resize
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
    keyboard,
  });
}

export const sketch = createSketch;
