import { Subscription } from "@thi.ng/rstream";
import {
  GestureEvent,
  gestureStream,
  GestureStreamOpts,
  GestureType,
  GestureStream,
} from "@thi.ng/rstream-gestures";
import { map } from "@thi.ng/transducers";
import { Raycaster, Plane, Camera, Vector3 } from "three";
import { resizeObserverStream } from "@jamieowen/browser";

// import { ConsoleLogger, LogLevel } from "@thi.ng/api";
// import { setLogger } from "@thi.ng/rstream";

// set package specific logger instance
// setLogger(new ConsoleLogger("rstream", LogLevel.WARN));

export type { GestureType, GestureEvent, GestureStreamOpts, GestureStream };

export interface GestureEvent3D extends GestureEvent {
  raycaster: Raycaster;
  position: Vector3;
  isDown: boolean;
  is3d: boolean;
  plane: Plane;
  ndc: Vector3;
  setPlaneNormal: (x: number, y: number, z: number) => void;
}

export interface GestureStream3DOpts extends GestureStreamOpts {
  normal: [number, number, number];
}

export type GestureStream3D = Subscription<GestureEvent, GestureEvent3D>;

export const gestureStream3d = (
  domElement: HTMLElement,
  camera: Camera,
  resize: ReturnType<typeof resizeObserverStream>,
  opts: Partial<GestureStream3DOpts> = {}
): GestureStream3D => {
  const { normal = [0, 1, 0], ..._opts } = opts;

  const raycaster = new Raycaster();
  const position = new Vector3(0, 0, 0);
  const norm = new Vector3();
  norm.fromArray(normal);
  const plane = new Plane(norm);
  const ndc = new Vector3();
  const setPlaneNormal = (x: number, y: number, z: number) => {
    norm.set(x, y, z);
    plane.set(norm, 0);
  };

  return gestureStream(domElement, {
    ..._opts,
    eventOpts: {},
  }).transform(
    map((event) => {
      const { width, height } = resize.deref();
      const { pos } = event;
      const [x, y] = pos;
      ndc.x = (x / width) * 2.0 - 1.0;
      ndc.y = -(y / height) * 2.0 + 1.0;
      raycaster.setFromCamera(ndc, camera);
      raycaster.ray.intersectPlane(plane, position);

      return {
        ...event,
        ndc,
        isDown: event.active.length > 0,
        plane,
        raycaster,
        is3d: true,
        position,
        pos: position.toArray(),
        setPlaneNormal,
      };
    })
  );
};
