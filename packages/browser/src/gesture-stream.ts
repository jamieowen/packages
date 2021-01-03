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
import { resizeObserverStream } from "./resize-observer-stream";

// import { ConsoleLogger, LogLevel } from "@thi.ng/api";
// import { setLogger } from "@thi.ng/rstream";

// set package specific logger instance
// setLogger(new ConsoleLogger("rstream", LogLevel.WARN));

export const gestureStream2d = gestureStream;

export type { GestureType, GestureEvent, GestureStreamOpts, GestureStream };

export type GestureEvent3D = {
  raycaster: Raycaster;
  position: Vector3;
  isDown: boolean;
  is3d: boolean;
  plane: Plane;
  ndc: Vector3;
  setPlaneNormal: (x: number, y: number, z: number) => void;
} & GestureEvent;

export type GestureStream3D = Subscription<GestureEvent, GestureEvent3D>;

export const gestureStream3d = (
  domElement: HTMLElement,
  camera: Camera,
  resize: ReturnType<typeof resizeObserverStream>,
  opts?: GestureStreamOpts
): GestureStream3D => {
  const raycaster = new Raycaster();
  const position = new Vector3(0, 0, 0);
  const normal = new Vector3(0, 1, 0);
  const plane = new Plane(normal);
  const ndc = new Vector3();
  const setPlaneNormal = (x: number, y: number, z: number) => {
    normal.set(x, y, z);
    plane.set(normal, 0);
  };

  return gestureStream2d(domElement, {
    ...opts,
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
