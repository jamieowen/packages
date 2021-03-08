import {
  Group,
  PointLight,
  DirectionalLight,
  HemisphereLight,
  AmbientLight,
  SpotLight,
  Light,
  Spherical
} from "../../../../_snowpack/pkg/three.js";
import {reactiveOptsFactory} from "../../../../_snowpack/pkg/@jamieowen/core.js";
const linear = (t) => t;
const EasingLookup = {
  linear
};
export const createLightingRigOpts = reactiveOptsFactory({
  count: 3,
  types: "HPD",
  radius: 10,
  intensityDist: linear,
  intensityMin: 0.1,
  intensityMax: 1,
  azimuthAngle: 45,
  azimuthDist: linear,
  azimuthVariance: 1,
  polarAngle: 45,
  polarDist: linear,
  polarVariance: 1
});
const parseLights = (types) => {
  return types.split("").map((char) => {
    switch (char) {
      case "A":
        return new AmbientLight();
      case "H":
        return new HemisphereLight();
      case "P":
        return new PointLight();
      case "D":
        return new DirectionalLight();
      case "S":
        return new SpotLight();
      default:
        console.warn(`Unrecognised light type '${char}'`);
        return new Light();
    }
  });
};
const distribute = (lights, ease, apply, filter = () => true) => {
  const filtered = lights.filter(filter);
  filtered.forEach((light, i) => {
    const value = ease(i / (filtered.length - 1) || 0);
    apply(light, value);
  });
};
const assignIntensity = (lights, opts) => {
  distribute(lights, opts.intensityDist, (light, value) => {
    light.intensity = opts.intensityMin + value * (opts.intensityMax - opts.intensityMin);
  });
};
const filterAngleLights = (light) => !light.isHemisphereLight && !light.isAmbientLight;
const toRadians = Math.PI / 180;
const assignAngles = (lights, sph, opts) => {
  const filtered = lights.filter(filterAngleLights);
  const len = filtered.length;
  for (let i = 0; i < len; i++) {
    const N = i / (len - 1) || 0;
    const theE = opts.azimuthDist(N);
    const phiE = opts.polarDist(N);
    const phiStart = opts.polarAngle * toRadians;
    const theStart = opts.azimuthAngle * toRadians;
    sph.set(opts.radius, phiStart + phiE * (Math.PI * opts.polarVariance), theStart + theE * (Math.PI * 2 * opts.azimuthVariance));
    const light = filtered[i];
    light.position.setFromSpherical(sph);
  }
};
export const createLightingRig = (parent, opts) => {
  const group = new Group();
  parent.add(group);
  const sphHelper = new Spherical();
  const lights = {
    types: "none",
    lights: []
  };
  opts.subscribe({
    next: (opts2) => {
      if (lights.types !== opts2.types) {
        lights.lights.forEach((l) => group.remove(l));
        lights.lights = parseLights(opts2.types);
        lights.lights.forEach((l) => group.add(l));
        lights.types = opts2.types;
      }
      lights.lights.forEach((l) => {
        if (l.type !== "AmbientLight" && l.type !== "HemisphereLight") {
          l.castShadow = true;
        }
      });
      assignIntensity(lights.lights, opts2);
      assignAngles(lights.lights, sphHelper, opts2);
    },
    error: (err) => {
      throw err;
    }
  });
  return {
    lights: lights.lights,
    group
  };
};
//# sourceMappingURL=lighting-rig.js.map
