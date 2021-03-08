import {sketch, gestureStream3d, dragGesture3d} from "../_snowpack/pkg/@jamieowen/three.js";
import {filter} from "../_snowpack/pkg/@thi.ng/transducers.js";
import {dist3, distManhattan3} from "../_snowpack/pkg/@thi.ng/vectors.js";
sketch(({domElement, camera, resize}) => {
  dragGesture3d(gestureStream3d(domElement, camera, resize)).subscribe({
    next: (ev) => {
      domElement.innerText = ev.particle.data.position.toString();
    }
  }).transform(filter(({particle}) => {
    const ev = particle;
    const dis = Math.abs(dist3(ev.data.position, ev.data.previous));
    const man = distManhattan3(ev.data.position, ev.data.previous);
    const changed = dis > 0.1;
    console.log("CHNAGED", changed);
    return changed;
  }));
});
//# sourceMappingURL=motion-gestures.js.map
