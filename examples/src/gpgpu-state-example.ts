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
} from "three";
import { sketch, createStateTextureAst } from "@jamieowen/three";
import {
  program,
  defMain,
  sym,
  texture,
  input,
  uniform,
  assign,
  vec4,
  add,
  $xyz,
  $w,
  $x,
  $y,
  $z,
  float,
  ifThen,
  greaterThan,
  gt,
  mul,
  vec3,
  Sym,
} from "@thi.ng/shader-ast";
import {
  dataTexture,
  encodeFillDataTexture3,
  encodeFillFloat32Array3,
  randomFloat32Array1,
  randomFloat32Array2,
  randomFloat32Array3,
} from "./three/buffer-helpers";
import { curlNoise3, snoiseVec3 } from "@thi.ng/shader-ast-stdlib";
import { renderViewportTexture } from "../../packages/three/src/render/render-viewports";
import { createGui } from "./gui";
import { astParticleLib } from "./three/ast-particle-update";

/**
 *
 *
 * Create Points Debug Mesh
 *
 */

const randomisePosition = (arr: Float32Array) => {
  for (let i = 0; i < arr.length; i += 3) {
    arr[i] = Math.random() * 2.0 - 1.0;
    arr[i + 1] = Math.random() * 2.0 - 1.0;
    arr[i + 2] = Math.random() * 2.0 - 1.0;
  }
};

const randomiseColor = (arr: Float32Array) => {
  for (let i = 0; i < arr.length; i += 4) {
    arr[i] = Math.random();
    arr[i + 1] = Math.random();
    arr[i + 2] = Math.random();
    arr[i + 3] = 1;
  }
};

const createPoints = (parent: Object3D, count: number) => {
  const geometry = new BufferGeometry();
  const position = new BufferAttribute(new Float32Array(count * 3), 3);
  const color = new BufferAttribute(new Float32Array(count * 4), 4);
  // const size = new BufferAttribute(new Float32Array(count * 3), 3);
  const offset = new BufferAttribute(
    new Float32Array(new Array(count).fill(0).map((_v, i) => i)),
    1
  );

  randomisePosition(position.array as any);
  randomiseColor(color.array as any);
  // randomisePosition(size.array as any);

  geometry.setAttribute("position", position);
  geometry.setAttribute("color", color);
  // geometry.setAttribute("size", size);
  geometry.setAttribute("offset", offset);

  const points = new Points(
    geometry,
    new PointsMaterial({
      // vertexColors: true,
      color: "white",
      size: 0.01,
      // sizeAttenuation: true,
    })
  );
  parent.add(points);
  return points;
};

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

/**
 *
 * Render the points with a custom update shader.
 *
 * @param parent
 * @param target
 * @param material
 */
const customPointsRenderer = (
  parent: Object3D,
  target: Points,
  material: RawShaderMaterial
) => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", target.geometry.getAttribute("position"));
  geometry.setAttribute("offset", target.geometry.getAttribute("offset"));

  const points = new Points(geometry, material);
  parent.add(points);
  return points;
};

const gui = createGui({
  forceX: 0,
  forceY: 0,
  forceZ: 0,
  curlScale: [0.001, 0, 0.1, 0.0001],
  curlInput: [0.01, 0.01, 10, 0.001],
});

/**
 *
 *
 * Main Sketch
 *
 *
 */
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
  // Create Debug Points
  const points = createPoints(group, count);

  // Create Data Texture for additional props
  // within the state update shader
  const maxAge = dataTexture(
    randomFloat32Array1(count, [5, 30]),
    size,
    size,
    1
  );

  // Create the standard constants texture. ( read by the constants AST chunk )
  const constants = encodeFillDataTexture3(size, size, (arr, offset) => {
    arr[offset] = Math.random(); // mass
    arr[offset + 1] = Math.random() * 0.01 + 0.001; // decay
    arr[offset + 2] = 0; // unused
  });

  /**
   *
   *
   * Update Shader
   *
   */

  // State Shader Update
  const state = createStateTextureAst(renderer, {
    count: 3,
    geomType: "triangle",
    width: size,
    height: size,
    updateProgram: (target) => {
      // Import Basic Particle Lib AST Chunks
      // Read State.
      const read = astParticleLib.readState2();
      const [uni_state1, , input_vUv] = read.decl;
      const [, , position, velocity, age] = read.main;
      // Read Constants
      const constants = astParticleLib.readConstants(input_vUv);
      const [, mass, decay] = constants.main;

      // Force Uniforms, manually created per configuration.
      const curlScale = uniform("float", "curlScale");
      const curlInput = uniform("float", "curlInput");
      const time = uniform("float", "time");

      // Move to
      const gravity = sym(vec3(0.0, 0.005, 0.0));
      const curl = curlNoise3(position, curlInput);
      // const curl = vec3(0.0);

      const transformed = sym(
        add(position, add(gravity, mul(curl, vec3(curlScale))))
      );

      const accumulate = astParticleLib.accumulateForces(
        position,
        velocity,
        age,
        age,
        []
        // [astParticleLib.gravity(vec3(0.0, 1.0, 0.0))]
      );

      // Including velocity? - needs capping and resetting at emission point
      // const transformed = sym(
      //   add(position, add(velocity, add(gravity, mul(curl, vec3(curlScale)))))
      // );

      const newLife = sym(age);

      // Age is capped at 1
      // We could reset velocity by overrunning age multiple times before emitting.
      const checkLife = ifThen(
        gt(age, float(1.0)),
        [
          assign(newLife, float(0.0)),
          // assign(transformed, snoiseVec3(mul(time, pos))), // simplex noise * time start point
          assign(transformed, snoiseVec3(position)),
          // assign(transformed, vec3($x(pos), 0.0, $z(pos))),
        ],
        [assign(newLife, add(newLife, float(decay)))]
      );

      return program([
        ...read.decl,
        ...constants.decl,
        // maxAgeSampler,
        curlScale,
        curlInput,
        time,
        defMain(() => [
          ...read.main,
          ...constants.main,
          gravity,
          transformed,
          newLife,
          checkLife,
          assign(target.gl_FragColor, vec4(transformed, newLife)),
          ...accumulate,
        ]),
      ]);
    },
  });

  // Define custom uniforms for now.
  // At some point do some magic and read the AST.
  state.material.uniforms.constants = { value: constants };
  state.material.uniforms.time = { value: 0 };
  state.material.uniforms.maxAge = { value: maxAge };
  state.material.uniforms.curlScale = { value: gui.deref().values.curlScale };
  state.material.uniforms.curlInput = { value: gui.deref().values.curlInput };

  console.log("Update Shader");
  console.log(state.material.fragmentShader);

  gui.subscribe({
    next: ({ values }) => {
      state.material.uniforms.curlScale.value = values.curlScale;
      state.material.uniforms.curlInput.value = values.curlInput;
    },
  });

  /**
   *
   *
   * Render Points Shader
   *
   */

  // Render Shader
  const renderMaterial = new RawShaderMaterial({
    vertexShader: `
    precision highp float;
    uniform mat4 projectionMatrix;
    uniform mat4 modelViewMatrix;
    
    uniform sampler2D state;
    uniform sampler2D maxAge;
    
    uniform vec2 resolution;

    attribute vec3 position;
    attribute float offset;

    void main(){
      gl_PointSize = 3.0;

      // calculate uv from offset attribute
      vec2 uv = vec2( offset / resolution.x, mod( offset, resolution.y ) ) / resolution;
      
      // read position
      vec4 tex = texture2D(state,uv);
      vec4 max = texture2D(maxAge,uv);
      vec3 pos = tex.rgb;

      vec3 transformed = pos;
      // transformed.y = max.x;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed,1.0);
    }
    `,
    fragmentShader: `    
    void main(){
      gl_FragColor = vec4(1.0,1.0,1.0,1.0);
    }
    `,
    uniforms: {
      state: { value: null },
      maxAge: { value: maxAge },
      resolution: { value: new Vector2(size, size) },
    },
  });

  const points2 = customPointsRenderer(group, points, renderMaterial);
  // points.visible = false;
  console.log(points2);
  // group.position.set(-0.5, -0.5, -0.5);
  // points.scale.multiplyScalar(5);
  // points.position.set(-2.5, -2.5, -2.5);

  // points2.scale.multiplyScalar(5);
  // points2.position.set(-2.5, -2.5, -2.5);

  // Write Start Data.

  const data = dataTexture(
    points.geometry.getAttribute("position").array as Float32Array,
    size,
    size,
    3
  );
  state.write(data);
  state.update();

  render((clock) => {
    // Update Sim
    state.material.uniforms.time.value = clock.time;
    state.update();

    // Render
    renderer.autoClear = false;
    renderer.clear();
    renderer.render(scene, camera);

    points.visible = false;
    // group.rotation.y += 0.01;

    // Render Texture
    renderMaterial.uniforms.state.value = state.preview.texture;
    renderViewportTexture(renderer, state.preview.texture, {
      x: 0,
      y: 0,
      width: Math.min(128, size),
      height: Math.min(128, size),
    });

    renderViewportTexture(renderer, state.states[2].texture, {
      x: Math.min(128, size) + 1,
      y: 0,
      width: Math.min(128, size),
      height: Math.min(128, size),
    });

    return false;
  });
});
