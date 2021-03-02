import {
  Object3D,
  Group,
  PointLight,
  DirectionalLight,
  HemisphereLight,
  AmbientLight,
  SpotLight,
  Light,
  Spherical,
} from "three";
import { reactiveOptsFactory } from "@jamieowen/core";

const linear = (t: number) => t;
type EasingFn = (t: number) => number;
type EasingType = "linear";
const EasingLookup: Record<EasingType, EasingFn> = {
  linear,
};

export interface LightingRigOpts {
  count: number;
  types: string;
  radius: number;
  intensityDist: EasingFn;
  intensityMin: number;
  intensityMax: number;
  azimuthDist: EasingFn;
  azimuthAngle: number;
  azimuthVariance: number;
  polarDist: EasingFn;
  polarAngle: number;
  polarVariance: number;
}

export const createLightingRigOpts = reactiveOptsFactory<
  Partial<LightingRigOpts>
>({
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
  polarVariance: 1,
});

const parseLights = (types: string) => {
  return types.split("").map((char: string) => {
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

const distribute = (
  lights: Light[],
  ease: EasingFn,
  apply: (light: Light, value: number) => void,
  filter: (light: Light) => boolean = () => true
) => {
  const filtered = lights.filter(filter);
  filtered.forEach((light, i) => {
    const value = ease(i / (filtered.length - 1) || 0);
    apply(light, value);
  });
};

const assignIntensity = (lights: Light[], opts: LightingRigOpts) => {
  distribute(lights, opts.intensityDist, (light, value) => {
    light.intensity =
      opts.intensityMin + value * (opts.intensityMax - opts.intensityMin);
  });
};

const filterAngleLights = (light: any) =>
  !light.isHemisphereLight && !light.isAmbientLight;

const toRadians = Math.PI / 180;
const assignAngles = (
  lights: Light[],
  sph: Spherical,
  opts: LightingRigOpts
) => {
  const filtered = lights.filter(filterAngleLights);
  const len = filtered.length;

  for (let i = 0; i < len; i++) {
    const N = i / (len - 1) || 0;
    const theE = opts.azimuthDist(N);
    const phiE = opts.polarDist(N);
    const phiStart = opts.polarAngle * toRadians;
    const theStart = opts.azimuthAngle * toRadians;

    sph.set(
      opts.radius,
      phiStart + phiE * (Math.PI * opts.polarVariance),
      theStart + theE * (Math.PI * 2.0 * opts.azimuthVariance)
    );

    const light = filtered[i];
    light.position.setFromSpherical(sph);
  }
};

export const createLightingRig = (
  parent: Object3D,
  opts: ReturnType<typeof createLightingRigOpts>
) => {
  const group = new Group();
  parent.add(group);
  const sphHelper = new Spherical();

  const lights = {
    types: "none",
    lights: [] as Light[],
  };
  // Would be nice to split streams across properties.
  // As some invalidation system
  // Later...
  // Look at @thi.ng/atom
  opts.subscribe({
    next: (opts) => {
      if (lights.types !== opts.types) {
        lights.lights.forEach((l) => group.remove(l));
        lights.lights = parseLights(opts.types);
        lights.lights.forEach((l) => group.add(l));
        lights.types = opts.types;
        // console.log("update lights");
      }
      lights.lights.forEach((l) => {
        if (l.type !== "AmbientLight" && l.type !== "HemisphereLight") {
          l.castShadow = true;
        }
      });
      assignIntensity(lights.lights, opts);
      assignAngles(lights.lights, sphHelper, opts);
    },
    error: (err) => {
      throw err;
    },
  });
  // .subscribe(trace("Update Opts"));

  return {
    lights: lights.lights,
    group,
  };
};
