import { sketch, gestureStream3d, dragGesture3d } from "@jamieowen/three";
import { filter } from "@thi.ng/transducers";
import { dist3, distManhattan3 } from "@thi.ng/vectors";

sketch(({ domElement, camera, resize }) => {
  dragGesture3d(gestureStream3d(domElement, camera, resize))
    .subscribe({
      next: (ev) => {
        // console.log("RENDER", ev.particle.data.position);
        domElement.innerText = ev.particle.data.position.toString();
      },
    })
    .transform(
      filter(({ particle }) => {
        const ev = particle;
        // let changed = false;
        const dis = Math.abs(dist3(ev.data.position, ev.data.previous));
        const man = distManhattan3(ev.data.position, ev.data.previous);
        const changed = dis > 0.1;
        console.log("CHNAGED", changed);
        return changed;
      })
    ); // emit only within threshold
});
