import {
  Object3D,
  Group,
  Mesh,
  MeshBasicMaterial,
  BoxBufferGeometry,
  WebGLRenderer,
  Color,
  BufferAttribute,
} from "three";
import {
  sketch,
  createStateTextureAst,
  createDomeSimpleLight,
  createDomeSimpleOpts,
  createParticleStatePoints,
  createParticleStateLineSegments,
  encodeFillDataTexture3,
  renderViewportTexture,
} from "@jamieowen/three";
import {
  program,
  defMain,
  uniform,
  assign,
  vec4,
  vec3,
} from "@thi.ng/shader-ast";

import { snoiseVec3 } from "@thi.ng/shader-ast-stdlib";
import { createGui } from "@jamieowen/gui";
import * as astParticleLib from "@jamieowen/webgl";

/**
 *
 * Create Bounds
 *
 */
const createBounds = (
  parent: Object3D,
  scale: number = 1,
  color: string = "blue"
) => {
  const bounds = new Mesh(
    new BoxBufferGeometry(1, 1, 1),
    new MeshBasicMaterial({
      wireframe: true,
      color: color,
    })
  );
  parent.add(bounds);
  bounds.scale.multiplyScalar(scale);
  return bounds;
};

const gui = createGui({
  // ySpeed: [0]
  curlScale: [0.0051, 0, 0.1, 0.0001],
  curlInput: [0.742, 0.01, 10, 0.001],
});

const createStateUpdate = (renderer: WebGLRenderer, size: number) => {
  return createStateTextureAst(renderer, {
    count: 3,
    geomType: "triangle",
    width: size,
    height: size,
    updateProgram: (target) => {
      // Read State.
      const read = astParticleLib.readState2();
      const [, , input_vUv] = read.decl;
      const [, , position, velocity, age] = read.main;
      // Read Constants
      const constants = astParticleLib.readConstants(input_vUv);
      const [, mass, decay] = constants.main;

      // Force Uniforms, manually created per configuration.
      const curlScale = uniform("float", "curlScale");
      const curlInput = uniform("float", "curlInput");
      const time = uniform("float", "time");

      // Accumulate forces
      const accumulate = astParticleLib.accumulateForces(
        position,
        velocity,
        mass,
        age,
        [
          astParticleLib.gravity(vec3(0.0, 0.007, 0.0)),
          astParticleLib.curlPosition(curlScale, curlInput),
        ]
      );

      // Possible to remove transformP and reuse position sym ( above )
      const [transformP] = accumulate;
      const advanceAge = astParticleLib.advanceAgeByDecay(age, decay, [
        assign(transformP, snoiseVec3(position)),
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
          assign(target.gl_FragColor, vec4(transformP, age)),
        ]),
      ]);
    },
  });
};

sketch(({ configure, render, renderer, scene, camera, controls }) => {
  // Dome

  createDomeSimpleLight(
    scene,
    createDomeSimpleOpts({ showHelpers: false, color: "crimson" })
  );

  // Containers
  const group = new Group();
  scene.add(group as any);

  // const bounds05 = createBounds(scene);
  // const bounds11 = createBounds(scene, 2, "red");

  const size = 200;
  const count = size * size;

  // Create the standard constants texture. ( read by the constants AST chunk )
  const constants = encodeFillDataTexture3(size, size, (arr, offset) => {
    arr[offset] = Math.random(); // mass
    arr[offset + 1] = Math.random() * 0.01 + 0.001; // decay
    arr[offset + 2] = 0; // unused
  });

  const startData = encodeFillDataTexture3(size, size, (arr, offset) => {
    arr[offset] = Math.random() * 2.0 - 1.0;
    arr[offset + 1] = Math.random() * 2.0 - 1.0;
    arr[offset + 2] = Math.random() * 2.0 - 1.0;
    // arr[offset + 3] = 0.0; //Math.random(); // Not sure why RGBA doesn't work?
  });

  let curlInputSine = 0; // offset each frame

  // Update
  const state = createStateUpdate(renderer, size);
  console.log(state.material.fragmentShader);

  // Define custom uniforms for now.
  // At some point do some magic and read the AST.
  state.material.uniforms.constants = { value: constants };
  state.material.uniforms.time = { value: 0 };
  state.material.uniforms.curlScale = { value: gui.deref().values.curlScale };
  state.material.uniforms.curlInput = {
    value: gui.deref().values.curlInput + curlInputSine,
  };

  gui.subscribe({
    next: ({ values }) => {
      state.material.uniforms.curlScale.value = values.curlScale;
      state.material.uniforms.curlInput.value =
        values.curlInput + curlInputSine;
    },
  });

  // Render Points

  // Colors
  const color = new Color();
  const colors = new BufferAttribute(new Float32Array(size * size * 3), 3);
  const colors2 = new BufferAttribute(new Float32Array(size * size * 3 * 2), 3);

  const deg1 = 1 / 12;
  const deg2 = deg1 * 6;
  for (let i = 0; i < colors.count; i++) {
    color.setHSL((Math.random() * 0.1 + 1) % 1, 0.9, 0.4 + Math.random() * 0.2);
    // color.offsetHSL(0.5, 0, 0);

    if (Math.random() > 0.9) {
      color.setHSL(1, Math.random() * 0.3 + 0.7, Math.random() * 0.3 + 0.7);
    }
    colors.setXYZ(i, color.r, color.g, color.b);
    colors2.setXYZ(i * 2, color.r, color.g, color.b);
    colors2.setXYZ(i * 2 + 1, color.r, color.g, color.b);
  }
  colors.needsUpdate = true;

  // Check renderer for required uniform updates.
  const renderPoints = createParticleStatePoints(count, state, colors);
  group.add(renderPoints);
  // renderPoints.position.x = 2.0;
  console.log("Render Points :", renderPoints);
  const renderLines = createParticleStateLineSegments(count, state, colors2);
  group.add(renderLines);
  console.log("Render Lines:", renderLines);

  // Write Start Data.

  state.write(startData);
  // state.update();

  controls.object.position.set(0, -1, 0);
  controls.object.position.multiplyScalar(1);

  controls.update();

  render((clock) => {
    // Update Sim
    state.material.uniforms.time.value = clock.time;

    curlInputSine = Math.cos(clock.time) * Math.sin(clock.time * 25) * 0.05;
    state.material.uniforms.curlInput.value =
      gui.deref().values.curlInput + curlInputSine;

    group.rotation.y += 0.01;
    // if (clock.time < 1) {
    state.update();
    // }

    // Render
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(scene, camera);

    // group.rotation.y += 0.01;

    const psize = 128;
    // Render Texture
    renderViewportTexture(renderer, state.preview.texture, {
      x: 0,
      y: 0,
      width: Math.min(psize, size),
      height: Math.min(psize, size),
    });

    renderViewportTexture(renderer, state.states[2].texture, {
      x: Math.min(psize, size) + 1,
      y: 0,
      width: Math.min(psize, size),
      height: Math.min(psize, size),
    });

    return false;
  });
});
