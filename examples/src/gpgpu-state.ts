import {
  Mesh,
  MeshBasicMaterial,
  WebGLRenderer,
  MeshLambertMaterial,
  DoubleSide,
  Group,
} from "three";
import {
  sketch,
  createStateTextureAst,
  createDomeSimpleLight,
  createDomeSimpleOpts,
  createGeometryFactory,
  GeometryAlignment,
} from "@jamieowen/three";
import {
  program,
  defMain,
  uniform,
  assign,
  vec4,
  vec3,
  sym,
  texture,
  input,
  $xyz,
  mul,
  $w,
  ifThen,
  length,
  lte,
  float,
} from "@thi.ng/shader-ast";
import { encodeFillDataTexture4 } from "./webgl/buffer-helpers";

const createStateUpdate = (renderer: WebGLRenderer, size: number) => {
  return createStateTextureAst(renderer, {
    count: 3,
    geomType: "triangle",
    width: size,
    height: size,
    updateProgram: (target) => {
      // Read State.
      const uni_state1 = uniform("sampler2D", "state_1");
      const uni_state2 = uniform("sampler2D", "state_2");
      const input_vUv = input("vec2", "vReadUV"); // TODO: Rename vReadUV - vUv

      // Main
      const s1 = sym(texture(uni_state1, input_vUv));
      const s2 = sym(texture(uni_state2, input_vUv));

      const time = uniform("float", "time");

      return program([
        uni_state1,
        uni_state2,
        input_vUv,
        time,
        defMain(() => [
          s1,
          s2,
          ifThen(lte(length($xyz(s1)), float(0.001)), [
            assign($xyz(s1), vec3(1.0)),
          ]),
          assign(target.gl_FragColor, vec4(mul($xyz(s1), $w(s1)), $w(s1))),
        ]),
      ]);
    },
  });
};

sketch(({ render, renderer, scene, controls }) => {
  const { lights } = createDomeSimpleLight(
    scene,
    createDomeSimpleOpts({ showHelpers: true, color: "#eeeeff" })
  );

  lights[1].position.x += 2;

  const size = 128;

  const startData = encodeFillDataTexture4(size, size, (arr, offset) => {
    arr[offset] = Math.random() * 2.0 - 1.0;
    arr[offset + 1] = Math.random() * 2.0 - 1.0;
    arr[offset + 2] = Math.random() * 2.0 - 1.0;
    arr[offset + 3] = 0.9 + Math.random() * 0.09; // set some decay speed
  });

  // Update
  const state = createStateUpdate(renderer, size);
  state.material.uniforms.time = { value: 0 };

  // Write Start Data.
  state.write(startData);
  // state.update();

  // Display texture for state.
  const gf = createGeometryFactory();
  const geom = gf.create("plane", GeometryAlignment.BOTTOM);
  const mesh1 = new Mesh(geom, new MeshLambertMaterial({ side: DoubleSide }));
  const mesh2 = new Mesh(geom, new MeshBasicMaterial({ side: DoubleSide }));
  const group = new Group();
  group.add(mesh1, mesh2);
  scene.add(group);

  mesh1.position.set(-0.55, 0, 0);
  mesh2.position.set(0.55, 0, 0);
  group.scale.multiplyScalar(6);
  mesh1.castShadow = mesh2.castShadow = true;

  renderer.shadowMap.enabled = true;

  controls.target.y = 2.8;
  controls.target.x = -0.2;
  controls.object.position.y = 2;
  controls.object.position.x -= 2;
  controls.object.position.multiplyScalar(1.5);
  controls.update();

  render((clock) => {
    state.material.uniforms.time.value = clock.time;
    state.update();

    (mesh1.material as MeshBasicMaterial).map = state.states[1].texture;
    (mesh2.material as MeshBasicMaterial).map = state.states[2].texture;
  });
});
