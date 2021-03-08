import {
  PointLight,
  PointLightHelper,
  DirectionalLightHelper,
  GridHelper,
  DirectionalLight,
  Group,
  PerspectiveCamera,
  CameraHelper,
  OrthographicCamera
} from "../../../../_snowpack/pkg/three.js";
export const createLightHelpers = (obj) => {
  const group = new Group();
  const helpers = [];
  obj.traverse((obj2) => {
    if (obj2 instanceof PointLight) {
      helpers.push(pointLightHelper(obj2));
    } else if (obj2 instanceof DirectionalLight) {
      helpers.push(directionalLightHelper(obj2));
    }
  });
  group.add.apply(group, helpers);
  return group;
};
export const createCameraHelpers = (obj) => {
  const group = new Group();
  const helpers = [];
  obj.traverse((obj2) => {
    if (obj2 instanceof PerspectiveCamera) {
      helpers.push(new CameraHelper(obj2));
    } else if (obj2 instanceof OrthographicCamera) {
      helpers.push(new CameraHelper(obj2));
    }
  });
  group.add.apply(group, helpers);
  return group;
};
export const pointLightHelper = (light, size = 0.2, color = "yellow") => {
  return new PointLightHelper(light, size, color);
};
export const directionalLightHelper = (light, size = 0.2, color = "yellow") => {
  return new DirectionalLightHelper(light, size, color);
};
export const createGridHelper = (size = 10, divisions = 10, color1 = "yellow", color2 = "blue") => new GridHelper(size, divisions, color1, color2);
//# sourceMappingURL=helpers.js.map
