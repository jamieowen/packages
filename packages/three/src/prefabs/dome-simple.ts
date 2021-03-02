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
  showHelpers: boolean;
}

export const createDomeSimpleOpts = reactiveOptsFactory<DomeSimpleLightOpts>({
  color: "crimson",
  intensity: [0.2, 0.4, 0.3],
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
    next: ({ color, intensity, showHelpers }) => {
      // Apply color
      amb.intensity = intensity[0];
      dir.intensity = intensity[1];
      hem.intensity = intensity[2];

      const fm = floor.material as MeshLambertMaterial;
      const dm = dome.material as MeshLambertMaterial;
      // console.log("Apply Color");
      // fm.color.set(color);
      // fm.emissive.set(color).offsetHSL(0, 0, 0.1);
      // dm.color.set(color).offsetHSL(0, 0.1, 0.1);
      // dm.emissive.set(color).offsetHSL(0, 0, 0.1);

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
