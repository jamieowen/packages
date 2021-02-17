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
  BackSide,
  BoxBufferGeometry,
  Matrix4,
  Plane,
  Vector3,
} from "three";
import { createGui } from "./gui";
import { sync, Stream } from "@thi.ng/rstream";
import { Smush32 } from "@thi.ng/random";
import {} from "@thi.ng/color";
import { mulN2 } from "@thi.ng/vectors";

const geometry = createGeometryFactory();

const boxGeometry = new BoxBufferGeometry(1, 1, 1);
boxGeometry.applyMatrix4(new Matrix4().makeTranslation(0.5, 0.5, 0.5));

const createInstancedMesh = (
  parent: Object3D,
  count: number,
  clipPlanes: Plane[]
) => {
  const instanced = new InstancedMesh(
    boxGeometry,
    // geometry.create("box", GeometryAlignment.CENTER),
    new MeshStandardMaterial({
      // vertexColors: true,
      color: "white",
      clippingPlanes: clipPlanes,
      clipIntersection: false,
    }),
    count
  );
  parent.add(instanced as Object3D);
  instanced.instanceMatrix.setUsage(DynamicDrawUsage);
  // instanced.instanceColor.setUsage(DynamicDrawUsage);
  console.log(instanced);
  return instanced;
};

const createMesh = (parent: Object3D) => {
  const mesh = new Mesh(
    boxGeometry,
    new MeshBasicMaterial({
      color: "blue",
    })
  );
  parent.add(mesh);
  return mesh;
};

const createBoundsMesh = (parent: Object3D) => {
  const mesh = new Mesh(
    geometry.create("box"),
    new MeshBasicMaterial({
      color: "blue",
      wireframe: true,
    })
  );
  parent.add(mesh);
  return mesh;
};

const createSphere = (parent: Object3D) => {
  const sphere = geometry.create("sphere");
  const mesh = new Mesh(
    geometry.create("sphere"),
    new MeshStandardMaterial({
      side: BackSide,
    })
  );
  mesh.scale.multiplyScalar(60);
  parent.add(mesh);
  return mesh;
};

const createLights = (parent: Object3D) => {
  const amb = new AmbientLight(0xffffff, 0.4);
  parent.add(amb);
  const point = new PointLight(0xffffff, 0.8, 100);
  point.position.set(10, 10, 10);
  parent.add(point);
  return {
    amb,
    point,
  };
};

const gui = createGui({
  grid1: true,
  grid2: true,
  subgrid1: true,
  width: 20,
  height: 20,
  viewport_x: 10,
  viewport_y: 10,
});

/**
 *
 * Create Infinite Grid Sketch.
 *
 */
sketch(({ configure, scene, render, renderer, camera, resize, domElement }) => {
  // Setup Size
  configure({
    width: "1024px",
    height: "768px",
  });
  renderer.localClippingEnabled = true;

  camera.fov = 75;
  camera.updateProjectionMatrix();

  // PRNG
  const rand = new Smush32(0xff404);
  const seedRandom = (id: number) => rand.seed(id).float();

  // Scene
  const group = new Group();
  scene.add(group);
  const sphereBox = createSphere(scene);
  const lights = createLights(scene);
  const bounds = createBoundsMesh(scene);

  // Global Grid Position
  const position = reactive([0, 0] as [number, number]);
  const viewport = [10, 6];
  bounds.scale.set(viewport[0], 1, viewport[1]);
  group.position.set(-viewport[0] / 2, 0, -viewport[1] / 2);

  // Clipping Planes
  const clipPlanes = [
    new Plane(new Vector3(1, 0, 0), 2),
    new Plane(new Vector3(0, -1, 0), 2),
    new Plane(new Vector3(0, 0, -1), 2),
  ];

  // Create Instanced Mesh
  const instanced = createInstancedMesh(group, 3000, clipPlanes);

  // Grid 1.
  const opts1 = reactive<GridOpts>({
    dimensions: [5, 5],
    viewport,
  });
  const grid1 = infiniteGrid<number>(position, opts1);

  // Grid 2
  const opts2 = reactive<GridOpts>({
    dimensions: [2, 1.5],
    viewport,
  });
  const grid2 = infiniteGrid<number>(position, opts2);

  // Subgrid 1
  const opts3 = reactive<SubGridOpts>({
    dimensions: [2, 2],
    viewport,
    maxDepth: 3,
    subdivide: (cell) => seedRandom(cell[0]) > 0.6,
  });
  const subgrid1 = infiniteSubGrid(position, opts3);

  // Create Render Method & Helpers
  const obj3d = new Object3D();
  const color = new Color();

  sync({
    src: {
      grid1,
      grid2,
      subgrid1,
    },
  }).subscribe({
    next: ({ grid1, grid2, subgrid1 }) => {
      // console.log("GRID UPDATE", items.length);
      let idx = 0;

      const guiopts = gui.deref();
      const yscale = 0;
      const d1 = mulN2([], opts1.deref().dimensions, 0.9);
      const d2 = mulN2([], opts2.deref().dimensions, 0.9);
      const d3 = mulN2([], opts3.deref().dimensions, 0.3);

      // Grid 1
      if (guiopts.values.grid1) {
        for (let cell of grid1) {
          obj3d.position.x = cell.local[0];
          obj3d.position.y = seedRandom(cell.id) * yscale;
          obj3d.position.z = cell.local[1];

          obj3d.scale.set(d1[0], 0.1, d1[1]);
          obj3d.updateMatrixWorld();
          instanced.setMatrixAt(idx, obj3d.matrixWorld);
          idx++;
          // instanced.setColorAt(idx);
        }
      }

      // Grid 2
      if (guiopts.values.grid2) {
        for (let cell of grid2) {
          obj3d.position.x = cell.local[0];
          obj3d.position.y = seedRandom(cell.id) * yscale + 0.2;
          obj3d.position.z = cell.local[1];

          // obj3d.scale.set(0.9, 0.1, 0.2);
          obj3d.scale.set(d2[0], 0.1, d2[1]);
          obj3d.updateMatrixWorld();
          instanced.setMatrixAt(idx, obj3d.matrixWorld);
          idx++;
          // instanced.setColorAt(idx);
        }
      }

      // Subgrid 1
      if (guiopts.values.subgrid1) {
        for (let cell of subgrid1) {
          obj3d.position.x = cell.local[0];
          obj3d.position.y = seedRandom(cell.id) * yscale + 0.4;
          obj3d.position.z = cell.local[1];
          // obj3d.scale.set(0.2, 0.1, 0.2);
          // obj3d.scale.set(d3[0] * cell.step, 0.1, d3[1] * cell.step);
          let step = cell.step;
          // obj3d.scale.set(d3[0] * 0.5, 0.1, d3[1] * 0.5);
          obj3d.scale.set(
            d3[0] * step,
            1.1 * seedRandom(cell.id),
            d3[1] * step
          );

          obj3d.updateMatrixWorld();
          instanced.setMatrixAt(idx, obj3d.matrixWorld);
          idx++;
          // instanced.setColorAt(idx);
        }
      }
      instanced.count = idx;
      instanced.instanceMatrix.needsUpdate = true;

      // instanced.instanceColor.needsUpdate = true;
    },
    error: (err) => {
      throw err;
    },
  });

  grid2.subscribe({
    next: (items) => {},
  });

  // Drag Gesture
  const gesture$ = gestureStream3d(domElement, camera, resize).subscribe({
    next: (ev) => {
      // console.log(ev.pos);
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
});
