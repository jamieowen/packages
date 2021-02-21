import {
  Points,
  PointsMaterial,
  BufferGeometry,
  BufferAttribute,
  Object3D,
  Group,
  RawShaderMaterial,
  Vector2,
  Mesh,
  MeshBasicMaterial,
  BoxBufferGeometry,
  WebGLRenderer,
} from "three";
import { sketch, createStateTextureAst } from "@jamieowen/three";
import {
  program,
  defMain,
  sym,
  uniform,
  assign,
  vec4,
  add,
  float,
  ifThen,
  gt,
  vec3,
} from "@thi.ng/shader-ast";
import {
  dataTexture,
  encodeFillDataTexture3,
  encodeFillDataTexture4,
} from "./webgl/buffer-helpers";
import { snoiseVec3 } from "@thi.ng/shader-ast-stdlib";
import { renderViewportTexture } from "../../packages/three/src/render/render-viewports";
import { createGui } from "./gui";
import * as astParticleLib from "./webgl/gpgpu-particles";

import { createParticleStatePoints } from "./three/particle-state-points";
import {
  createParticleStateLineSegments,
  particleStateLineSegments,
} from "./three/particle-state-lines";

/**
 *
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
  curlScale: [0.001, 0, 0.1, 0.0001],
  curlInput: [0.01, 0.01, 10, 0.001],
});

const createStateUpdate = (renderer: WebGLRenderer, size: number) => {
  return createStateTextureAst(renderer, {
    count: 3,
    geomType: "triangle",
    width: size,
    height: size,
    updateProgram: (target) => {
      // Import Basic Particle Lib AST Chunks
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

      const [transformP] = accumulate;

      const newLife = sym(age);

      // Age is capped at 1
      // We could reset velocity by overrunning age multiple times before emitting.
      const checkLife = ifThen(
        gt(age, float(1.0)),
        [
          assign(newLife, float(0.0)),
          // assign(transformed, snoiseVec3(mul(time, pos))), // simplex noise * time start point
          assign(transformP, snoiseVec3(position)),
          // assign(transformed, vec3($x(pos), 0.0, $z(pos))),
        ],
        [assign(newLife, add(newLife, float(decay)))]
      );

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
          newLife,
          checkLife,
          assign(target.gl_FragColor, vec4(transformP, newLife)),
        ]),
      ]);
    },
  });
};

sketch(({ configure, render, renderer, scene, camera }) => {
  configure({
    width: "1024px",
    height: "768px",
  });

  // Containers
  const group = new Group();
  scene.add(group as any);

  const bounds05 = createBounds(scene);
  const bounds11 = createBounds(scene, 2, "red");

  const size = 64;
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

  // Update
  const state = createStateUpdate(renderer, size);

  // Define custom uniforms for now.
  // At some point do some magic and read the AST.
  state.material.uniforms.constants = { value: constants };
  state.material.uniforms.time = { value: 0 };
  state.material.uniforms.curlScale = { value: gui.deref().values.curlScale };
  state.material.uniforms.curlInput = { value: gui.deref().values.curlInput };

  gui.subscribe({
    next: ({ values }) => {
      state.material.uniforms.curlScale.value = values.curlScale;
      state.material.uniforms.curlInput.value = values.curlInput;
    },
  });

  // Render Points
  // Check renderer for required uniform updates.
  const renderPoints = createParticleStatePoints(count, state);
  scene.add(renderPoints);
  console.log("Render Points :", renderPoints);
  const renderLines = createParticleStateLineSegments(count, state);
  scene.add(renderLines);

  // Write Start Data.

  state.write(startData);
  // state.update();

  render((clock) => {
    // Update Sim
    state.material.uniforms.time.value = clock.time;
    state.update();

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
