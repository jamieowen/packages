import {
  Object3D,
  BackSide,
  SphereBufferGeometry,
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  Matrix4,
  CameraHelper,
  MeshLambertMaterial,
} from "three";
import { createMeshFactory, createLightHelpers } from "../factory-fn";
import { reactiveOptsFactory, ReactiveOpts } from "@jamieowen/core";
import { forceStream } from "@jamieowen/motion";

const mf = createMeshFactory();

const createDome = (parent: Object3D) => {
  const dome = new SphereBufferGeometry(1, 20, 30).applyMatrix4(
    new Matrix4().makeRotationX(Math.PI * -0.5)
  );
  mf.setGeometry(dome);
  mf.lambertMaterial({
    color: "crimson",
    emissive: "red",
    emissiveIntensity: 0.2,
    side: BackSide,
  });
  return mf.mesh(parent);
};

const createFloor = (parent: Object3D, color: string = "crimson") => {
  // Floor
  mf.lambertMaterial({
    color: "crimson",
    emissive: "crimson",
    emissiveIntensity: 0.2,
  });
  mf.scale.multiplyScalar(10);
  mf.plane();
  const floor = mf.mesh(parent);
  floor.rotation.x = Math.PI * -0.5;
  return floor;
};

interface DomeSimpleLightOpts {
  color: string | number;
  intensity: [number, number, number]; // amb/dir/hem
  emissive?: {
    intensity: [number, number]; // dome / floor
    offset: [[number, number, number], [number, number, number]]; // dome / floor hsl
  };
  showHelpers: boolean;
}

export const createDomeSimpleOpts = reactiveOptsFactory<DomeSimpleLightOpts>({
  color: "crimson",
  intensity: [0.2, 0.4, 0.3],
  emissive: {
    intensity: [0.1, 0.2], // dome / floor
    offset: [
      [0, 0, 0], // dome
      [0, 0, 0], // floor
    ],
  },
  showHelpers: true,
});

/**
 *
 * A mimimal dome and light setup.
 * Designed for reuse without major configurations.
 *
 * @param parent
 * @param opts
 */
export const createDomeSimpleLight = (
  parent: Object3D,
  opts: ReactiveOpts<DomeSimpleLightOpts> = createDomeSimpleOpts({})
) => {
  mf.scale.set(1, 1, 1);
  const dome = createDome(parent);
  dome.scale.multiplyScalar(30);

  const floor = createFloor(parent);
  floor.scale.multiplyScalar(10);
  floor.receiveShadow = true;

  const amb = new AmbientLight();
  const dir = new DirectionalLight();
  const hem = new HemisphereLight();
  const lights = [amb, dir, hem];
  parent.add(amb, hem, dir);

  dir.castShadow = true;
  dir.shadow.camera.far = 50;
  dir.shadow.camera.near = 5;
  dir.shadow.camera.left = -10;
  dir.shadow.camera.right = 10;
  dir.shadow.camera.top = 10;
  dir.shadow.camera.bottom = -10;

  const shadowHelper = new CameraHelper(dir.shadow.camera);
  parent.add(shadowHelper);

  dir.position.set(2, 4, 5).multiplyScalar(4);

  const helpers = createLightHelpers(parent);
  parent.add(helpers);

  opts.subscribe({
    next: ({ color, intensity, emissive, showHelpers }) => {
      // Apply color
      amb.intensity = intensity[0];
      dir.intensity = intensity[1];
      hem.intensity = intensity[2];

      const dm = dome.material as MeshLambertMaterial;
      const fm = floor.material as MeshLambertMaterial;

      // Set color to the same
      dm.color.set(color);
      fm.color.set(color);

      dm.emissive.set(color);
      fm.emissive.set(color);

      dm.emissiveIntensity = emissive.intensity[0];
      fm.emissiveIntensity = emissive.intensity[1];

      dm.emissive.offsetHSL.apply(dm.emissive, emissive.offset[0]);
      fm.emissive.offsetHSL.apply(fm.emissive, emissive.offset[1]);

      helpers.visible = showHelpers;
      shadowHelper.visible = showHelpers;
    },
  });

  opts.next({});

  return {
    opts,
    dome,
    lights,
    floor,
    helpers,
  };
};
