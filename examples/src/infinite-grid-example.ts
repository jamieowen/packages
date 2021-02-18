import {
  GridOpts,
  infiniteGrid,
  infiniteSubGrid,
  SubGridOpts,
} from "@jamieowen/layout";
import { reactive } from "@jamieowen/motion";
import {
  sketch,
  createGeometryFactory,
  GeometryAlignment,
  gestureStream3d,
  dragGesture3d,
} from "@jamieowen/three";
import {
  MeshBasicMaterial,
  MeshStandardMaterial,
  Mesh,
  InstancedMesh,
  Color,
  Object3D,
  DynamicDrawUsage,
  Group,
  AmbientLight,
  PointLight,
  BoxBufferGeometry,
  SphereBufferGeometry,
  Matrix4,
} from "three";
import { createGui } from "./gui";
import { sync, Stream } from "@thi.ng/rstream";
import { Smush32 } from "@thi.ng/random";
import { mulN2 } from "@thi.ng/vectors";

const geometry = createGeometryFactory();

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

const createBoundsMesh = (parent: Object3D) => {
  const mesh = new Mesh(
    geometry.create("box", GeometryAlignment.BOTTOM),
    new MeshBasicMaterial({
      color: "blue",
      wireframe: true,
    })
  );
  parent.add(mesh);
  return mesh;
};

const createSphere = (parent: Object3D, color: string = "#212121") => {
  const sphere = geometry.create("sphere");
  const mesh = new Mesh(
    new SphereBufferGeometry(1, 30, 1),
    new MeshBasicMaterial({
      color,
    })
  );
  parent.add(mesh);
  return mesh;
};

const createLights = (parent: Object3D) => {
  const amb = new AmbientLight(0xffffff, 0.7);
  parent.add(amb);
  const point = new PointLight(0xffffff, 0.4, 30);
  point.position.set(0, 5, 5);
  parent.add(point);
  return {
    amb,
    point,
  };
};

const gui = createGui({
  grid: true,
  subgrid: true,
  width: [20, 10, 50, 1],
  height: [20, 10, 50, 1],
  viewportX: [10, 5, 20, 1],
  viewportY: [10, 5, 20, 1],
  subdivCond: [0.6, 0.2, 1, 0.01],
  seed: [1, 1, 2, 0.001],
});

const colors1 = {
  cursor: "#000000",
  background: "#212121",
  grid: "#5F7C5A",
  subgrid: "#ADB08D",
};

const colors2 = {
  cursor: "#212121",
  background: "#44464E",
  grid: "#A2665B",
  subgrid: "#FEFEFC",
};

const colors3 = {
  cursor: "#fb743e",
  background: "#c5d7bd",
  subgrid: "#9fb8ad",
  grid: "#383e56",
};

const colors = colors2;
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
    // Setup Size
    configure({
      width: "1024px",
      height: "768px",
    });

    renderer.setClearColor(colors.background);
    camera.fov = 60;
    camera.updateProjectionMatrix();

    controls.object.position.set(0, 7, 5);
    controls.object.position.multiplyScalar(2);
    controls.target.set(0, -3, 0);
    controls.update();

    // PRNG
    const rand = new Smush32(0xff404);
    let seedOffset = 1;
    const seedRandom = (id: number) => rand.seed(id * seedOffset).float();
    // Scene
    const group = new Group();
    scene.add(group);
    // const sphereBox = createSphere(scene);
    const lights = createLights(scene);
    const bounds = createBoundsMesh(scene);

    // Cursor
    const cursor = createSphere(scene, colors.cursor);
    cursor.scale.multiplyScalar(3);
    cursor.scale.y = 0;

    // Global Grid Position
    const position = reactive([0, 0] as [number, number]);
    const viewport = [10, 6];
    const dimensions = [2, 2];

    // bounds.scale.set(viewport[0], 2, viewport[1]);
    // group.position.set(-viewport[0] / 2, 0, -viewport[1] / 2);

    // Create Instanced Mesh
    const instanced = createInstancedMesh(group, 10000);

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
      bounds.scale.set(viewport[0], 2, viewport[1]);
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

    sync({
      src: {
        grid1,
        grid2,
      },
    }).subscribe({
      next: ({ grid1, grid2 }) => {
        // console.log("GRID UPDATE", items.length);
        let idx = 0;

        const guiopts = gui.deref();
        const yscale = 0;
        const d1 = mulN2([], opts1.deref().dimensions, 0.9);
        const d2 = mulN2([], opts2.deref().dimensions, 0.7);

        // Grid 1
        if (guiopts.values.grid) {
          for (let cell of grid1) {
            let r = seedRandom(cell.id);
            obj3d.position.x = cell.local[0];
            obj3d.position.y = r * yscale;
            obj3d.position.z = cell.local[1];

            obj3d.scale.set(d1[0], 0.1, d1[1]);
            obj3d.updateMatrixWorld();
            instanced.setMatrixAt(idx, obj3d.matrixWorld);

            color.set(colors.grid);
            color.offsetHSL(0, r * 0.05, r * 0.2);
            instanced.setColorAt(idx, color);
            idx++;
          }
        }

        // Subgrid 1
        if (guiopts.values.subgrid) {
          for (let cell of grid2) {
            let r = seedRandom(cell.id);
            obj3d.position.x = cell.local[0];
            obj3d.position.y = r * yscale + 0.4;
            obj3d.position.z = cell.local[1];
            let step = cell.step; // fract part of subdivision.
            obj3d.scale.set(d2[0] * step, 2.5 * r, d2[1] * step);
            obj3d.updateMatrixWorld();
            instanced.setMatrixAt(idx, obj3d.matrixWorld);

            color.set(colors.subgrid);
            color.offsetHSL(0, r * 0.1, r * 0.13);
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

    grid2.subscribe({
      next: (items) => {},
    });

    const gesture$ = gestureStream3d(domElement, camera, resize).subscribe({
      next: (ev) => {
        // console.log(ev.pos);
        cursor.position.x = ev.pos[0];
        cursor.position.z = ev.pos[2];
      },
    });
    dragGesture3d(gesture$, {
      friction: 0.05,
      maxSpeed: 10,
    }).subscribe({
      next: ({ particle }) => {
        position.next([particle.position[0], particle.position[2]]);
        // position.next([particle.position[0], 0]);
      },
    });

    render(() => {});
  }
);
