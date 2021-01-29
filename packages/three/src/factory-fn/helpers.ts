import {
  Object3D,
  PointLight,
  Color,
  PointLightHelper,
  DirectionalLightHelper,
  GridHelper,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  CameraHelper,
  OrthographicCamera,
} from "three";
/**
 * Add debug helpers to lights found in the given object.
 * @param obj
 */
export const createLightHelpers = (obj: Object3D) => {
  const group = new Group();
  const helpers: Object3D[] = [];

  obj.traverse((obj) => {
    if (obj instanceof PointLight) {
      helpers.push(pointLightHelper(obj));
    } else if (obj instanceof DirectionalLight) {
      helpers.push(directionalLightHelper(obj));
    }
  });

  group.add.apply(group, helpers);
  return group;
};

export const createCameraHelpers = (obj: Object3D) => {
  const group = new Group();
  const helpers: CameraHelper[] = [];

  obj.traverse((obj) => {
    if (obj instanceof PerspectiveCamera) {
      helpers.push(new CameraHelper(obj));
    } else if (obj instanceof OrthographicCamera) {
      helpers.push(new CameraHelper(obj));
    }
  });

  group.add.apply(group, helpers);
  return group;
};

export const pointLightHelper = (
  light: PointLight,
  size: number = 0.2,
  color: string | number | Color = "yellow"
) => {
  return new PointLightHelper(light, size, color);
};

export const directionalLightHelper = (
  light: DirectionalLight,
  size: number = 0.2,
  color: string | number | Color = "yellow"
) => {
  return new DirectionalLightHelper(light, size, color);
};

export const createGridHelper = (
  size: number = 10,
  divisions: number = 10,
  color1: Color | string | number = "yellow",
  color2: Color | string | number = "blue"
) => new GridHelper(size, divisions, color1, color2);
