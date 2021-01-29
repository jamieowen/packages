import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Camera } from "three";

export const orbitControls = (camera: Camera, container: HTMLElement) => {
  return new OrbitControls(camera, container);
};
