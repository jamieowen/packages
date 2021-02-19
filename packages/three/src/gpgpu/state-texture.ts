import {
  RawShaderMaterial,
  BufferGeometry,
  Scene,
  Mesh,
  DataTexture,
  WebGLRenderTarget,
  WebGLRenderer,
  OrthographicCamera,
  RGBAFormat,
  FloatType,
  ClampToEdgeWrapping,
  NearestFilter,
  BufferAttribute,
  DoubleSide,
} from "three";
import { GPGPUSetup, gpgpuSetup } from "@jamieowen/webgl";

const defaultRttOpts = {
  format: RGBAFormat,
  type: FloatType,
  // mapping: UVMapping,
  wrapS: ClampToEdgeWrapping,
  wrapT: ClampToEdgeWrapping,
  minFilter: NearestFilter,
  magFilter: NearestFilter,
  stencilBuffer: false,
  depthBuffer: false,
};

const createTexture = (width: number, height: number) => {
  return new WebGLRenderTarget(width, height, {
    format: RGBAFormat,
    type: FloatType,
    // mapping: UVMapping,
    wrapS: ClampToEdgeWrapping,
    wrapT: ClampToEdgeWrapping,
    minFilter: NearestFilter,
    magFilter: NearestFilter,
    stencilBuffer: false,
    depthBuffer: false,
  });
};

const createGeometry = (buffer: Float32Array) => {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(buffer, 3));
  return geometry;
};

export class GPGPUState {
  renderer: WebGLRenderer;
  states: WebGLRenderTarget[];
  material: RawShaderMaterial;
  writeMaterial: RawShaderMaterial;
  geometry: BufferGeometry;
  camera: OrthographicCamera;
  scene: Scene = new Scene();
  mesh: Mesh;

  /**
   *
   * @param renderer
   * @param setup
   */
  constructor(renderer: WebGLRenderer, setup: ReturnType<typeof gpgpuSetup>) {
    this.renderer = renderer;
    // Create state textures.
    this.states = new Array(setup.count)
      .fill(0)
      .map(() => createTexture(setup.width, setup.height));
    // Main ping/pong update material
    this.material = new RawShaderMaterial({
      vertexShader: setup.vertexSource,
      fragmentShader: setup.fragmentSource,
      depthTest: false,
      depthWrite: false,
      // side: setup.geomType === "triangle" ? BackSide : FrontSide,
      side: DoubleSide,
      uniforms: {
        previousState: { value: null },
      },
    });
    // Material to write a data texture to the output buffer.
    this.writeMaterial = new RawShaderMaterial({
      vertexShader: setup.vertexSource,
      fragmentShader: setup.fragmentWriteSource,
      depthTest: false,
      depthWrite: false,
      side: DoubleSide,
      uniforms: {
        inputSource: { value: null },
      },
    });
    this.geometry = createGeometry(setup.positionBuffer);
    this.mesh = new Mesh(this.geometry, this.material);
    this.camera = new OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0, 1);
    this.scene.add(this.mesh);
  }

  /**
   * Set the supplied data as all states and
   * write it to the current output buffer.
   *
   * This is replaces the current state and
   * @param data
   */
  write(data: DataTexture) {
    this.writeMaterial.uniforms["inputSource"].value = data;
    this.mesh.material = this.writeMaterial;
    this.states.forEach((state) => {
      console.log("write state.");
      this.renderer.setRenderTarget(state);
      this.renderer.render(this.scene, this.camera);
    });
    this.renderer.setRenderTarget(null);
    this.mesh.material = this.material;
  }

  /**
   * Update the state using the supplied update shader.
   * Number of state textures should be equal to count + 1,
   * as the the texture in state[0] will be the output
   * texture.
   */
  update() {
    // Update state uniforms
    // this.states.forEach((state, i) => {
    //   this.material.uniforms[`state_${i}`].value = state.texture;
    // });
    // Render
    this.material.uniforms["previousState"].value = this.states[1].texture;
    this.renderer.setRenderTarget(this.states[0]);
    this.renderer.render(this.scene, this.camera);
    this.renderer.setRenderTarget(null);
    this.nextState();
  }

  get output() {
    return this.states[0];
  }

  /**
   * Return a preview texture ( that is not being rendered to next )
   */
  get preview() {
    return this.states[1];
  }

  /**
   * Advance the states along from left to right.
   * The texture in the state[0] position will
   * be the next output buffer.
   *
   * State at > state[1] can be used as a texture for preview.
   */
  nextState() {
    let prevState = this.states[this.states.length - 1];
    for (let i = 0; i < this.states.length; i++) {
      let current = this.states[i];
      this.states[i] = prevState;
      prevState = current;
    }
  }
}
