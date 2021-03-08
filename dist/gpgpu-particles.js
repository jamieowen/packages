import {
  Group,
  Mesh,
  MeshBasicMaterial,
  BoxBufferGeometry,
  Color,
  BufferAttribute
} from "../_snowpack/pkg/three.js";
import {
  sketch,
  createStateTextureAst,
  createDomeSimpleLight,
  createDomeSimpleOpts
} from "../_snowpack/pkg/@jamieowen/three.js";
import {
  program,
  defMain,
  uniform,
  assign,
  vec4,
  vec3
} from "../_snowpack/pkg/@thi.ng/shader-ast.js";
import {
  encodeFillDataTexture3,
  createParticleStatePoints,
  createParticleStateLineSegments,
  renderViewportTexture
} from "../_snowpack/pkg/@jamieowen/three.js";
import {snoiseVec3} from "../_snowpack/pkg/@thi.ng/shader-ast-stdlib.js";
import {createGui} from "../_snowpack/pkg/@jamieowen/gui.js";
import * as astParticleLib from "../_snowpack/pkg/@jamieowen/webgl.js";
const createBounds = (parent, scale = 1, color = "blue") => {
  const bounds = new Mesh(new BoxBufferGeometry(1, 1, 1), new MeshBasicMaterial({
    wireframe: true,
    color
  }));
  parent.add(bounds);
  bounds.scale.multiplyScalar(scale);
  return bounds;
};
const gui = createGui({
  curlScale: [51e-4, 0, 0.1, 1e-4],
  curlInput: [0.742, 0.01, 10, 1e-3]
});
const createStateUpdate = (renderer, size) => {
  return createStateTextureAst(renderer, {
    count: 3,
    geomType: "triangle",
    width: size,
    height: size,
    updateProgram: (target) => {
      const read = astParticleLib.readState2();
      const [, , input_vUv] = read.decl;
      const [, , position, velocity, age] = read.main;
      const constants = astParticleLib.readConstants(input_vUv);
      const [, mass, decay] = constants.main;
      const curlScale = uniform("float", "curlScale");
      const curlInput = uniform("float", "curlInput");
      const time = uniform("float", "time");
      const accumulate = astParticleLib.accumulateForces(position, velocity, mass, age, [
        astParticleLib.gravity(vec3(0, 7e-3, 0)),
        astParticleLib.curlPosition(curlScale, curlInput)
      ]);
      const [transformP] = accumulate;
      const advanceAge = astParticleLib.advanceAgeByDecay(age, decay, [
        assign(transformP, snoiseVec3(position))
      ]);
      return program([
        ...read.decl,
        ...constants.decl,
        curlScale,
        curlInput,
        time,
        defMain(() => [
          ...read.main,
          ...constants.main,
          ...accumulate,
          advanceAge,
          assign(target.gl_FragColor, vec4(transformP, age))
        ])
      ]);
    }
  });
};
sketch(({configure, render, renderer, scene, camera, controls}) => {
  createDomeSimpleLight(scene, createDomeSimpleOpts({showHelpers: false, color: "crimson"}));
  const group = new Group();
  scene.add(group);
  const size = 32;
  const count = size * size;
  const constants = encodeFillDataTexture3(size, size, (arr, offset) => {
    arr[offset] = Math.random();
    arr[offset + 1] = Math.random() * 0.01 + 1e-3;
    arr[offset + 2] = 0;
  });
  const startData = encodeFillDataTexture3(size, size, (arr, offset) => {
    arr[offset] = Math.random() * 2 - 1;
    arr[offset + 1] = Math.random() * 2 - 1;
    arr[offset + 2] = Math.random() * 2 - 1;
  });
  let curlInputSine = 0;
  const state = createStateUpdate(renderer, size);
  console.log(state.material.fragmentShader);
  state.material.uniforms.constants = {value: constants};
  state.material.uniforms.time = {value: 0};
  state.material.uniforms.curlScale = {value: gui.deref().values.curlScale};
  state.material.uniforms.curlInput = {
    value: gui.deref().values.curlInput + curlInputSine
  };
  gui.subscribe({
    next: ({values}) => {
      state.material.uniforms.curlScale.value = values.curlScale;
      state.material.uniforms.curlInput.value = values.curlInput + curlInputSine;
    }
  });
  const color = new Color();
  const colors = new BufferAttribute(new Float32Array(size * size * 3), 3);
  const colors2 = new BufferAttribute(new Float32Array(size * size * 3 * 2), 3);
  const deg1 = 1 / 12;
  const deg2 = deg1 * 6;
  for (let i = 0; i < colors.count; i++) {
    color.setHSL((Math.random() * 0.1 + 1) % 1, 0.9, 0.4 + Math.random() * 0.2);
    if (Math.random() > 0.9) {
      color.setHSL(1, Math.random() * 0.3 + 0.7, Math.random() * 0.3 + 0.7);
    }
    colors.setXYZ(i, color.r, color.g, color.b);
    colors2.setXYZ(i * 2, color.r, color.g, color.b);
    colors2.setXYZ(i * 2 + 1, color.r, color.g, color.b);
  }
  colors.needsUpdate = true;
  const renderPoints = createParticleStatePoints(count, state, colors);
  group.add(renderPoints);
  console.log("Render Points :", renderPoints);
  const renderLines = createParticleStateLineSegments(count, state, colors2);
  group.add(renderLines);
  console.log("Render Lines:", renderLines);
  state.write(startData);
  render((clock) => {
    state.material.uniforms.time.value = clock.time;
    curlInputSine = Math.cos(clock.time) * Math.sin(clock.time * 25) * 0.05;
    state.material.uniforms.curlInput.value = gui.deref().values.curlInput + curlInputSine;
    group.rotation.y += 0.01;
    state.update();
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(scene, camera);
    const psize = 128;
    renderViewportTexture(renderer, state.preview.texture, {
      x: 0,
      y: 0,
      width: Math.min(psize, size),
      height: Math.min(psize, size)
    });
    renderViewportTexture(renderer, state.states[2].texture, {
      x: Math.min(psize, size) + 1,
      y: 0,
      width: Math.min(psize, size),
      height: Math.min(psize, size)
    });
    return false;
  });
});
//# sourceMappingURL=gpgpu-particles.js.map
