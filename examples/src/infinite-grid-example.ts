import {
  GridCell,
  GridOpts,
  infiniteGrid,
  infiniteSubGrid,
  SubGridCell,
  SubGridOpts,
} from "@jamieowen/layout";
import {
  sketch,
  createGeometryFactory,
  GeometryAlignment,
  gestureStream3d,
  dragGesture3d,
  createDomeSimpleLight,
  createDomeSimpleOpts,
} from "@jamieowen/three";
import {
  MeshStandardMaterial,
  InstancedMesh,
  Color,
  Object3D,
  DynamicDrawUsage,
  Group,
  BoxBufferGeometry,
  Matrix4,
} from "three";
import { createGui } from "./gui";
import { sync, reactive, trace } from "@thi.ng/rstream";
import { Smush32 } from "@thi.ng/random";
import { mulN2, sub3 } from "@thi.ng/vectors";

const boxGeometry = new BoxBufferGeometry(1, 1, 1);
boxGeometry.applyMatrix4(new Matrix4().makeTranslation(0.5, 0.5, 0.5));

const createInstancedMesh = (parent: Object3D, count: number) => {
  const instanced = new InstancedMesh(
    boxGeometry,
    // geometry.create("box", GeometryAlignment.CENTER),
    new MeshStandardMaterial({
      color: "white",
    }),
    count
  );
  parent.add(instanced as Object3D);
  // instanced.instanceColor.
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
  seed: [1, 1, 2, 0.001],
});

/**
 *
 * Create Infinite Grid Sketch.
 *
 */
sketch(
  ({
    configure,
    scene,
    render,
    controls,
    renderer,
    camera,
    resize,
    domElement,
  }) => {
    renderer.shadowMap.enabled = true;
    camera.fov = 50;
    camera.updateProjectionMatrix();

    controls.object.position.set(0, 4.5, 5);
    controls.object.position.multiplyScalar(3.5);
    controls.target.set(0, -1, 0);
    controls.update();

    // PRNG
    const rand = new Smush32(0xff404);
    let seedOffset = 1;
    const seedRandom = (id: number) => rand.seed(id * seedOffset).float();
    // Scene
    const group = new Group();
    scene.add(group);
    // const sphereBox = createSphere(scene);
    // const lights = createLights(scene);
    // const bounds = createBoundsMesh(scene);

    const dome = createDomeSimpleLight(
      scene,
      createDomeSimpleOpts({
        color: "whitesmoke",
        intensity: [0.3, 0.2, 0.3],
        emissive: {
          intensity: [0.2, 0.2],
          offset: [
            [0, 0, 0],
            [0, 0, 0],
          ],
        },
        showHelpers: false,
      })
    );

    // Global Grid Position
    const position = reactive([-183.5, 0.5] as [number, number]);
    const viewport = [10, 6] as [number, number];
    const dimensions = [2, 2] as [number, number];

    // bounds.scale.set(viewport[0], 2, viewport[1]);
    // group.position.set(-viewport[0] / 2, 0, -viewport[1] / 2);

    // Create Instanced Mesh
    const instanced = createInstancedMesh(group, 10000);
    // instanced.castShadow = true;
    // instanced.receiveShadow = true;

    // Grid 1.
    const opts1 = reactive<GridOpts>({
      dimensions,
      viewport,
    });
    const grid1 = infiniteGrid<number>(position, opts1);

    // Subgrid 1
    const opts2 = reactive<SubGridOpts>({
      dimensions,
      viewport,
      maxDepth: 3,
      subdivide: (cell) => seedRandom(cell[0]) > 0.8,
    });
    const grid2 = infiniteSubGrid(position, opts2);

    // GUI Subscribe & Update Opts.
    // + Bounds & Center Offset
    const updateViewport = (
      viewport: number[],
      dimensions: number[],
      subdiv: number = 0.6,
      seed: number = 1
    ) => {
      opts1.next({
        dimensions,
        viewport,
      });

      opts2.next({
        ...opts2.deref(),
        dimensions,
        viewport,
        subdivide: (cell) => seedRandom(cell[0]) > subdiv,
      });

      seedOffset = seed;
      group.position.set(-viewport[0] / 2, 0, -viewport[1] / 2);
    };
    updateViewport(viewport, dimensions);

    gui.subscribe({
      next: ({ values }) => {
        let vp = [values.viewportX, values.viewportY];
        let dims = [values.width * 0.1, values.height * 0.1];

        updateViewport(vp, dims, values.subdivCond, values.seed);
      },
    });

    // Create Render Method & Helpers
    const obj3d = new Object3D();
    const color = new Color();
    const t1 = [];
    const t2 = [];
    const t3 = [];
    const t4 = [];

    sync({
      src: {
        grid1,
        grid2,
      },
    }).subscribe({
      next: ({ grid1, grid2 }: { grid1: GridCell[]; grid2: SubGridCell[] }) => {
        // console.log("GRID UPDATE", items.length);
        let idx = 0;

        const guiopts = gui.deref();
        const dims = opts1.deref().dimensions;
        const yscale = 0;

        const s1 = 1; //0.9;
        const s2 = 1; //0.7;
        // scale
        const d1 = mulN2(t1, dims, s1);
        const d2 = mulN2(t2, dims, s2);
        // offset
        const d3 = mulN2(null, sub3(t3, dims, d1), 0.5);
        const d4 = mulN2(null, sub3(t4, dims, d2), 0.5);

        // Grid 1
        if (guiopts.values.grid) {
          for (let cell of grid1) {
            let r = seedRandom(cell.id);
            obj3d.position.x = cell.local[0]; // + d3[0];
            obj3d.position.y = r * yscale;
            obj3d.position.z = cell.local[1]; // + d3[1];

            obj3d.scale.set(d1[0], 0.1, d1[1]);
            obj3d.updateMatrixWorld();
            instanced.setMatrixAt(idx, obj3d.matrixWorld);

            color.setHSL(0, 0, cell.cell[0] % 2 === 0 ? 0.5 : 1);
            instanced.setColorAt(idx, color);
            idx++;
          }
        }

        // Subgrid 1
        if (guiopts.values.subgrid) {
          for (let cell of grid2) {
            let r = seedRandom(cell.id);
            obj3d.position.x = cell.local[0]; // + d4[0];
            obj3d.position.y = r * yscale + 0.15;
            obj3d.position.z = cell.local[1]; // + d4[1];

            let step = cell.step; // fract part of subdivision.
            // obj3d.scale.set(0.1, 0.1, 0.1);
            obj3d.scale.set(d1[0] * step, 2.2 * r, d1[1] * step);
            // obj3d.scale.set(d2[0] * step, 2.5 * r, d2[1] * step);
            // obj3d.scale.set(d2[0] * step, 1, d2[1] * step);
            obj3d.updateMatrixWorld();
            instanced.setMatrixAt(idx, obj3d.matrixWorld);

            const xodd = cell.cell[0] % 2;
            color.setHSL(
              (cell.world[0] * 0.005) % 1,
              0.85,
              0.65 + r * 0.35 - xodd * 0.3
            );
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
      },
    });

    const gesture$ = gestureStream3d(domElement, camera, resize);

    dragGesture3d(gesture$, {
      friction: 0.05,
      maxSpeed: 10,
      initialPosition: [position.deref()[0], 0, position.deref()[1]],
    }).subscribe({
      next: ({ particle }) => {
        position.next([particle.data.position[0], particle.data.position[2]]);
      },
    });

    render(() => {});
  }
);
