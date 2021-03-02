import { trace, subscription, State, reactive } from "@thi.ng/rstream";
import {
  sketch,
  createMeshFactory,
  createDomeSimpleLight,
  createDomeSimpleOpts,
  createInstancedMesh,
  instancedMeshIterator,
} from "@jamieowen/three";
import { createGui } from "./gui";
import {
  mapPosition,
  EaseTypes,
  IMotionEvent,
  motionParticle,
  particleTrails,
  particleIterator,
} from "./lib/motion-streams";

import { trailConeGeometry, trailBoxGeometry } from "./lib/three";

import {
  BufferAttribute,
  BufferGeometry,
  MeshStandardMaterial,
  Line,
  LineBasicMaterial,
  DynamicDrawUsage,
  Mesh,
  Object3D,
  Group,
  Vector3,
  Quaternion,
  ArrowHelper,
} from "three";
import { map, sideEffect } from "@thi.ng/transducers";
import { normalize, set3, sub3, Vec } from "@thi.ng/vectors";
import { memoize1 } from "@thi.ng/memoize";

const TRAIL_GEOMETRIES: Record<string, (x?: any) => BufferGeometry> = {
  cone: memoize1<any, BufferGeometry>(() => {
    return trailConeGeometry();
  }),
  box: memoize1<any, BufferGeometry>(() => {
    return trailBoxGeometry();
  }),
};
const gui = createGui({
  trail: Object.keys(TRAIL_GEOMETRIES),
  scale: [2, 1, 5, 0.01],
  thin: [0.7, 0.2, 2, 0.01],
  // motion: ["sine"],
});

const trailGeometry = reactive<BufferGeometry>(null);

gui.subscribe({
  next: ({ values: { trail } }) => {
    const trailGeom = TRAIL_GEOMETRIES[trail]();
    trailGeometry.next(trailGeom);
  },
});

/**
 * Render Functions.
 */
const meshFactory = createMeshFactory();

const renderTracer = (parent: Object3D) => {
  meshFactory.box();
  meshFactory.lambertMaterial({
    color: "#efefef",
    emissive: "#efefef",
    emissiveIntensity: 0.25,
  });
  const mesh = meshFactory.mesh(parent);
  mesh.castShadow = true;
  mesh.scale.multiplyScalar(0.25);
  return subscription<
    IMotionEvent<"transform" | "particle">,
    IMotionEvent<"transform" | "particle">
  >({
    next: (ev) => {
      mesh.position.fromArray(ev.data.position);
    },
  });
};

/**
 * Set direction took from
 * https://github.com/mrdoob/three.js/blob/master/src/helpers/ArrowHelper.js
 *
 * Couldn't seem to get
 * https://github.com/mrdoob/three.js/blob/master/src/math/Quaternion.js
 * setFromUnitVectors working in a similar way.
 */
const setDirection = (() => {
  const _axis = new Vector3();
  return (dir: Vector3, quaternion: Quaternion) => {
    // dir is assumed to be normalized
    if (dir.y > 0.99999) {
      quaternion.set(0, 0, 0, 1);
    } else if (dir.y < -0.99999) {
      quaternion.set(1, 0, 0, 0);
    } else {
      _axis.set(dir.z, 0, -dir.x).normalize();
      const radians = Math.acos(dir.y);
      quaternion.setFromAxisAngle(_axis, radians);
    }
  };
})();

const renderTrails = (count: number, parent: Object3D) => {
  const mesh = new Mesh(
    trailGeometry.deref(),
    new MeshStandardMaterial({
      color: "yellow",
    })
  );
  mesh.castShadow = true;
  parent.add(mesh);

  const vec1 = new Vector3(1, 0, 0);
  // const vec2 = new Vector3(0, 0, 1);
  // const quat = new Quaternion();
  const ah = new ArrowHelper(undefined, undefined, 3);
  parent.add(ah);
  const adir = new Vector3();
  // const mat = new Matrix4();
  const vel: Vec = [];

  return subscription<
    IMotionEvent<"particle-array">,
    IMotionEvent<"particle-array">
  >({
    next: (ev) => {
      // pick a single point
      const targ = ev.data[10];
      const prev = ev.data[4];

      if (targ) {
        const gval = gui.deref().values;
        mesh.visible = true;
        mesh.geometry = trailGeometry.deref();
        mesh.position.fromArray(targ.position);
        mesh.scale.set(gval.thin, gval.scale, gval.thin);

        // Velocity to Mesh
        normalize(null, sub3(vel, targ.position, prev.position));
        vec1.fromArray(vel);
        setDirection(vec1, mesh.quaternion);
        // Arrow Helper.
        ah.position.fromArray(targ.position);
        adir.fromArray(vel);
        ah.setDirection(adir);
      } else {
        mesh.visible = false;
      }
    },
  });
};

const renderLines = (count: number, parent: Object3D) => {
  const positions = new BufferAttribute(new Float32Array(3 * count), 3);
  const geometry = new BufferGeometry();
  positions.usage = DynamicDrawUsage;
  geometry.setAttribute("position", positions);
  const lines = new Line(
    geometry,
    new LineBasicMaterial({
      color: "white",
    })
  );
  parent.add(lines);

  return subscription<
    IMotionEvent<"particle-array">,
    IMotionEvent<"particle-array">
  >({
    next: (ev) => {
      const arr = ev.data;
      for (let i = 0; i < arr.length; i++) {
        positions.setXYZ(
          i,
          arr[i].position[0],
          arr[i].position[1],
          arr[i].position[2]
        );
      }
      geometry.drawRange.count = arr.length;
      positions.needsUpdate = true;
    },
    error: (err) => {
      throw err;
    },
  });
};

sketch(({ render, scene, controls, renderer }) => {
  createDomeSimpleLight(
    scene,
    createDomeSimpleOpts({
      color: "darkblue",
    })
  );
  renderer.shadowMap.enabled = true;

  // Trail Types.

  // Parent container to apply center offset;
  const group = new Group();
  scene.add(group);

  const points$ = Object.entries(EaseTypes)
    .filter(([key]) => key.indexOf("InOut") === -1)
    .filter(([key]) => key.indexOf("In") > -1)
    .slice(0, 1)
    .map(([_key, easeFn], idx) =>
      motionParticle()
        .transform(
          mapPosition((t, pos) => {
            // t *= 0.1;
            pos[0] = 0;
            // pos[2] = idx * -1.1 + 1.1 * 13 * 0.5;
            pos[2] = idx * 1.0 + Math.sin(t * 8.0) * 2.0;
            // pos[1] = 1 + Math.sin(t * 3.0);
            const len = 3.0;
            const T = t + idx * 0.2;
            const tt = 1.0 - Math.abs(((T % len) / len) * 2.0 - 1.0); // + Math.sin(idx + t);
            // pos[1] = easeFn(tt) * 3.0 + 1.0;
            pos[1] = Math.sin(t * 3 + idx) * 3 + 4 + easeFn(tt) * 3.0;
          })
          // invalidatePosition()
        )
        .subscribe(renderTracer(group))
    );

  const trailLength = 20;
  points$.map((p$) =>
    p$
      .subscribe(particleTrails(trailLength))
      .subscribe(
        particleIterator({
          xform: sideEffect((ev) => {
            const pos = ev.data.position;
            const prev = ev.data.previous;
            normalize(undefined, sub3(ev.data.velocity, pos, prev));
            set3(prev, pos);

            pos[0] += (Math.sin(ev.clock.time) + 1.0) * 0.5 + 0.6;
            // pos[0] += 2.0;
          }),
        })
      )
      .subscribe(renderTrails(trailLength, group))
      .subscribe(renderLines(trailLength, group))
  );

  // group.position.set((-trailLength * 0.5) / 2, 0, -points$.length / 2);
  group.position.x = -trailLength / 2;
  group.position.y = -5;

  render(() => {});
});
