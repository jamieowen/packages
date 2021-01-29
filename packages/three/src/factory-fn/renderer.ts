import { WebGLRenderer, WebGLRendererParameters } from "three";
import { resizeObserverStream } from "@jamieowen/browser";

/**
 * Create a WebGLRenderer and add it to the supplied dom element.
 * If no element is supplied, document.body is used.
 *
 * The domElement is watched for resize using a ResizeObserver. This is returned as a resize observer stream.
 *
 * @param domElement
 * @param params
 */
export const createRenderer = (
  mountElement?: HTMLElement,
  params?: WebGLRendererParameters
) => {
  const mount = mountElement || document.body;
  const renderer = new WebGLRenderer({
    antialias: true,
    ...params,
  });
  const domElement = createContainer(renderer.domElement);
  mount.appendChild(domElement);
  const resize = resizeObserverStream(domElement);
  resize.subscribe({
    next: ({ entry, width, height }) => {
      renderer.setSize(width, height);
    },
  });
  return { resize, domElement, renderer };
};

const createContainer = (canvas: HTMLElement) => {
  const element = document.createElement("div");
  element.style.position = "absolute";
  element.style.width = "100%";
  element.style.height = "100%";
  element.appendChild(canvas);
  return element;
};
