import {subscription, reactive} from "../_snowpack/pkg/@thi.ng/rstream.js";
import {
  sketch,
  createMeshFactory,
  createDomeSimpleLight,
  createDomeSimpleOpts,
  trailConeGeometry,
  trailBoxGeometry
} from "../_snowpack/pkg/@jamieowen/three.js";
import {createGui} from "../packages/gui/src/index.js";
import {
  mapPosition,
  EaseTypes,
  motionParticle,
  particleTrails,
  particleIterator
} from "../_snowpack/pkg/@jamieowen/motion.js";
import {
  BufferAttribute,
  BufferGeometry,
  MeshStandardMaterial,
  Line,
  LineBasicMaterial,
  DynamicDrawUsage,
  Mesh,
  Group,
  Vector3,
  ArrowHelper
} from "../_snowpack/pkg/three.js";
import {sideEffect} from "../_snowpack/pkg/@thi.ng/transducers.js";
import {normalize, set3, sub3} from "../_snowpack/pkg/@thi.ng/vectors.js";
import {memoize1} from "../_snowpack/pkg/@thi.ng/memoize.js";
const TRAIL_GEOMETRIES = {
  cone: memoize1(() => {
    return trailConeGeometry();
  }),
  box: memoize1(() => {
    return trailBoxGeometry();
  })
};
const gui = createGui({
  trail: Object.keys(TRAIL_GEOMETRIES),
  scale: [2, 1, 5, 0.01],
  thin: [0.7, 0.2, 2, 0.01]
});
const trailGeometry = reactive(null);
gui.subscribe({
  next: ({values: {trail}}) => {
    const trailGeom = TRAIL_GEOMETRIES[trail]();
    trailGeometry.next(trailGeom);
  }
});
const meshFactory = createMeshFactory();
const renderTracer = (parent) => {
  meshFactory.box();
  meshFactory.lambertMaterial({
    color: "#efefef",
    emissive: "#efefef",
    emissiveIntensity: 0.25
  });
  const mesh = meshFactory.mesh(parent);
  mesh.castShadow = true;
  mesh.scale.multiplyScalar(0.25);
  return subscription({
    next: (ev) => {
      mesh.position.fromArray(ev.data.position);
    }
  });
};
const setDirection = (() => {
  const _axis = new Vector3();
  return (dir, quaternion) => {
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
const renderTrails = (count, parent) => {
  const mesh = new Mesh(trailGeometry.deref(), new MeshStandardMaterial({
    color: "yellow"
  }));
  mesh.castShadow = true;
  parent.add(mesh);
  const vec1 = new Vector3(1, 0, 0);
  const ah = new ArrowHelper(void 0, void 0, 3);
  parent.add(ah);
  const adir = new Vector3();
  const vel = [];
  return subscription({
    next: (ev) => {
      const targ = ev.data[10];
      const prev = ev.data[4];
      if (targ) {
        const gval = gui.deref().values;
        mesh.visible = true;
        mesh.geometry = trailGeometry.deref();
        mesh.position.fromArray(targ.position);
        mesh.scale.set(gval.thin, gval.scale, gval.thin);
        normalize(null, sub3(vel, targ.position, prev.position));
        vec1.fromArray(vel);
        setDirection(vec1, mesh.quaternion);
        ah.position.fromArray(targ.position);
        adir.fromArray(vel);
        ah.setDirection(adir);
      } else {
        mesh.visible = false;
      }
    }
  });
};
const renderLines = (count, parent) => {
  const positions = new BufferAttribute(new Float32Array(3 * count), 3);
  const geometry = new BufferGeometry();
  positions.usage = DynamicDrawUsage;
  geometry.setAttribute("position", positions);
  const lines = new Line(geometry, new LineBasicMaterial({
    color: "white"
  }));
  parent.add(lines);
  return subscription({
    next: (ev) => {
      const arr = ev.data;
      for (let i = 0; i < arr.length; i++) {
        positions.setXYZ(i, arr[i].position[0], arr[i].position[1], arr[i].position[2]);
      }
      geometry.drawRange.count = arr.length;
      positions.needsUpdate = true;
    },
    error: (err) => {
      throw err;
    }
  });
};
sketch(({render, scene, controls, renderer}) => {
  const dome = createDomeSimpleLight(scene, createDomeSimpleOpts({
    color: "darkblue",
    showHelpers: false
  }));
  renderer.shadowMap.enabled = true;
  dome.floor.position.y = -5;
  controls.object.position.multiplyScalar(3);
  const group = new Group();
  scene.add(group);
  const points$ = Object.entries(EaseTypes).filter(([key]) => key.indexOf("InOut") === -1).filter(([key]) => key.indexOf("In") > -1).slice(0, 1).map(([_key, easeFn], idx) => motionParticle().transform(mapPosition((t, pos) => {
    pos[0] = 0;
    pos[2] = idx * 1 + Math.sin(t * 8) * 2;
    const len = 3;
    const T = t + idx * 0.2;
    const tt = 1 - Math.abs(T % len / len * 2 - 1);
    pos[1] = Math.sin(t * 3 + idx) * 3 + 4 + easeFn(tt) * 3;
  })).subscribe(renderTracer(group)));
  const trailLength = 20;
  points$.map((p$) => p$.subscribe(particleTrails(trailLength)).subscribe(particleIterator({
    xform: sideEffect((ev) => {
      const pos = ev.data.position;
      const prev = ev.data.previous;
      normalize(void 0, sub3(ev.data.velocity, pos, prev));
      set3(prev, pos);
      pos[0] += (Math.sin(ev.clock.time) + 1) * 0.5 + 0.6;
    })
  })).subscribe(renderTrails(trailLength, group)).subscribe(renderLines(trailLength, group)));
  group.position.x = -trailLength / 2;
  group.position.y = -5;
  render(() => {
  });
});
//# sourceMappingURL=motion-trails-example.js.map
