import {
  infiniteGrid,
  infiniteSubGrid
} from "../_snowpack/pkg/@jamieowen/layout.js";
import {
  sketch,
  gestureStream3d,
  dragGesture3d,
  createDomeSimpleLight,
  createDomeSimpleOpts
} from "../_snowpack/pkg/@jamieowen/three.js";
import {
  MeshStandardMaterial,
  InstancedMesh,
  Color,
  Object3D,
  DynamicDrawUsage,
  Group,
  BoxBufferGeometry,
  Matrix4
} from "../_snowpack/pkg/three.js";
import {createGui} from "../_snowpack/pkg/@jamieowen/gui.js";
import {sync, reactive} from "../_snowpack/pkg/@thi.ng/rstream.js";
import {Smush32} from "../_snowpack/pkg/@thi.ng/random.js";
import {mulN2} from "../_snowpack/pkg/@thi.ng/vectors.js";
const boxGeometry = new BoxBufferGeometry(1, 1, 1);
boxGeometry.applyMatrix4(new Matrix4().makeTranslation(0.5, 0.5, 0.5));
const createInstancedMesh = (parent, count) => {
  const instanced = new InstancedMesh(boxGeometry, new MeshStandardMaterial({
    color: "white"
  }), count);
  parent.add(instanced);
  instanced.instanceMatrix.setUsage(DynamicDrawUsage);
  return instanced;
};
const gui = createGui({
  grid: true,
  subgrid: true,
  width: [20, 10, 50, 1],
  height: [20, 10, 50, 1],
  viewportX: [15, 5, 20, 1],
  viewportY: [10, 5, 20, 1],
  subdivCond: [0.6, 0.2, 1, 0.01],
  seed: [1, 1, 2, 1e-3]
});
sketch(({
  configure,
  scene,
  render,
  controls,
  renderer,
  camera,
  resize,
  domElement
}) => {
  renderer.shadowMap.enabled = true;
  camera.fov = 50;
  camera.updateProjectionMatrix();
  controls.object.position.set(0, 4.5, 5);
  controls.object.position.multiplyScalar(3);
  controls.target.set(0, -1, 0);
  controls.update();
  const rand = new Smush32(1045508);
  let seedOffset = 1;
  const seedRandom = (id) => rand.seed(id * seedOffset).float();
  const group = new Group();
  scene.add(group);
  const dome = createDomeSimpleLight(scene, createDomeSimpleOpts({
    color: "whitesmoke",
    intensity: [0.3, 0.2, 0.3],
    emissive: {
      intensity: [0.2, 0.2],
      offset: [
        [0, 0, 0],
        [0, 0, 0]
      ]
    },
    showHelpers: false
  }));
  const position = reactive([-183.5, 0.5]);
  const viewport = [10, 6];
  const dimensions = [2, 2];
  const instanced = createInstancedMesh(group, 1e4);
  const opts1 = reactive({
    dimensions,
    viewport
  });
  const grid1 = infiniteGrid(position, opts1);
  const opts2 = reactive({
    dimensions,
    viewport,
    maxDepth: 3,
    subdivide: (cell) => seedRandom(cell[0]) > 0.8
  });
  const grid2 = infiniteSubGrid(position, opts2);
  const updateViewport = (viewport2, dimensions2, subdiv = 0.6, seed = 1) => {
    opts1.next({
      dimensions: dimensions2,
      viewport: viewport2
    });
    opts2.next({
      ...opts2.deref(),
      dimensions: dimensions2,
      viewport: viewport2,
      subdivide: (cell) => seedRandom(cell[0]) > subdiv
    });
    seedOffset = seed;
    group.position.set(-viewport2[0] / 2, 0, -viewport2[1] / 2);
  };
  updateViewport(viewport, dimensions);
  gui.subscribe({
    next: ({values}) => {
      let vp = [values.viewportX, values.viewportY];
      let dims = [values.width * 0.1, values.height * 0.1];
      updateViewport(vp, dims, values.subdivCond, values.seed);
    }
  });
  const obj3d = new Object3D();
  const color = new Color();
  const t1 = [];
  sync({
    src: {
      grid1,
      grid2
    }
  }).subscribe({
    next: ({grid1: grid12, grid2: grid22}) => {
      let idx = 0;
      const guiopts = gui.deref();
      const dims = opts1.deref().dimensions;
      const yscale = 0;
      const s1 = 1;
      const d1 = mulN2(t1, dims, s1);
      if (guiopts.values.grid) {
        for (let cell of grid12) {
          let r = seedRandom(cell.id);
          obj3d.position.x = cell.local[0];
          obj3d.position.y = r * yscale;
          obj3d.position.z = cell.local[1];
          obj3d.scale.set(d1[0], 0.1, d1[1]);
          obj3d.updateMatrixWorld();
          instanced.setMatrixAt(idx, obj3d.matrixWorld);
          color.setHSL(0, 0, cell.cell[0] % 2 === 0 ? 0.5 : 1);
          instanced.setColorAt(idx, color);
          idx++;
        }
      }
      if (guiopts.values.subgrid) {
        for (let cell of grid22) {
          let r = seedRandom(cell.id);
          obj3d.position.x = cell.local[0];
          obj3d.position.y = r * yscale + 0.15;
          obj3d.position.z = cell.local[1];
          let step = cell.step;
          obj3d.scale.set(d1[0] * step, 2.2 * r, d1[1] * step);
          obj3d.updateMatrixWorld();
          instanced.setMatrixAt(idx, obj3d.matrixWorld);
          const xodd = cell.cell[0] % 2;
          color.setHSL(cell.world[0] * 5e-3 % 1, 0.85, 0.65 + r * 0.35 - xodd * 0.3);
          instanced.setColorAt(idx, color);
          idx++;
        }
      }
      instanced.count = idx;
      instanced.instanceMatrix.needsUpdate = true;
      instanced.instanceColor.needsUpdate = true;
    },
    error: (err) => {
      throw err;
    }
  });
  const gesture$ = gestureStream3d(domElement, camera, resize);
  dragGesture3d(gesture$, {
    friction: 0.05,
    maxSpeed: 10,
    initialPosition: [position.deref()[0], 0, position.deref()[1]]
  }).subscribe({
    next: ({particle}) => {
      position.next([particle.data.position[0], particle.data.position[2]]);
    }
  });
  render(() => {
  });
});
//# sourceMappingURL=infinite-grid-example.js.map
