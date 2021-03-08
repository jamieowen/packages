import {
  Mesh,
  MeshBasicMaterial,
  DoubleSide,
  Group
} from "../_snowpack/pkg/three.js";
import {
  sketch,
  createStateTextureAst,
  createDomeSimpleLight,
  createDomeSimpleOpts,
  createGeometryFactory,
  GeometryAlignment,
  encodeFillDataTexture4
} from "../_snowpack/pkg/@jamieowen/three.js";
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
  float
} from "../_snowpack/pkg/@thi.ng/shader-ast.js";
const createStateUpdate = (renderer, size) => {
  return createStateTextureAst(renderer, {
    count: 3,
    geomType: "triangle",
    width: size,
    height: size,
    updateProgram: (target) => {
      const uni_state1 = uniform("sampler2D", "state_1");
      const uni_state2 = uniform("sampler2D", "state_2");
      const input_vUv = input("vec2", "vReadUV");
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
          ifThen(lte(length($xyz(s1)), float(1e-3)), [
            assign($xyz(s1), vec3(1))
          ]),
          assign(target.gl_FragColor, vec4(mul($xyz(s1), $w(s1)), $w(s1)))
        ])
      ]);
    }
  });
};
sketch(({render, renderer, scene, controls}) => {
  const {lights} = createDomeSimpleLight(scene, createDomeSimpleOpts({showHelpers: true, color: "#eeeeff"}));
  lights[1].position.x += 2;
  const size = 128;
  const startData = encodeFillDataTexture4(size, size, (arr, offset) => {
    arr[offset] = Math.random() * 2 - 1;
    arr[offset + 1] = Math.random() * 2 - 1;
    arr[offset + 2] = Math.random() * 2 - 1;
    arr[offset + 3] = 0.9 + Math.random() * 0.09;
  });
  const state = createStateUpdate(renderer, size);
  state.material.uniforms.time = {value: 0};
  state.write(startData);
  const gf = createGeometryFactory();
  const geom = gf.create("plane", GeometryAlignment.BOTTOM);
  const mesh1 = new Mesh(geom, new MeshBasicMaterial({side: DoubleSide}));
  const mesh2 = new Mesh(geom, new MeshBasicMaterial({side: DoubleSide}));
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
    mesh1.material.map = state.states[1].texture;
    mesh2.material.map = state.states[2].texture;
  });
});
//# sourceMappingURL=gpgpu-state.js.map
