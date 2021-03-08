import {
  gestureStream
} from "../../../../_snowpack/pkg/@thi.ng/rstream-gestures.js";
import {map} from "../../../../_snowpack/pkg/@thi.ng/transducers.js";
import {Raycaster, Plane, Vector3} from "../../../../_snowpack/pkg/three.js";
export const gestureStream3d = (domElement, camera, resize, opts = {}) => {
  const {normal = [0, 1, 0], ..._opts} = opts;
  const raycaster = new Raycaster();
  const position = new Vector3(0, 0, 0);
  const norm = new Vector3();
  norm.fromArray(normal);
  const plane = new Plane(norm);
  const ndc = new Vector3();
  const setPlaneNormal = (x, y, z) => {
    norm.set(x, y, z);
    plane.set(norm, 0);
  };
  return gestureStream(domElement, {
    ..._opts,
    eventOpts: {}
  }).transform(map((event) => {
    const {width, height} = resize.deref();
    const {pos} = event;
    const [x, y] = pos;
    ndc.x = x / width * 2 - 1;
    ndc.y = -(y / height) * 2 + 1;
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
      setPlaneNormal
    };
  }));
};
//# sourceMappingURL=gesture-stream-3d.js.map
