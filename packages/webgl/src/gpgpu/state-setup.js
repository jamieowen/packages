import {GLSLVersion, targetGLSL} from "../../../../_snowpack/pkg/@thi.ng/shader-ast-glsl.js";
import {
  gpgpuQuadVertexShader,
  gpgpuTriangleVertexShader,
  gpgpuWriteOperation
} from "../shaders/full-screen-read.js";
export const gpgpuSetup = (opts) => {
  const {width, height, count, geomType, updateProgram} = opts;
  const targetVS = targetGLSL({
    version: GLSLVersion.GLES_100,
    versionPragma: false,
    type: "vs"
  });
  const targetFS = targetGLSL({
    version: GLSLVersion.GLES_100,
    versionPragma: false,
    type: "fs",
    prelude: "precision highp float;"
  });
  let vertexAst;
  let positionBuffer;
  if (geomType === "quad") {
    vertexAst = gpgpuQuadVertexShader(targetVS);
    positionBuffer = new Float32Array([-0.5, 0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0]);
  } else {
    vertexAst = gpgpuTriangleVertexShader(targetVS);
    positionBuffer = new Float32Array([-1, -1, 0, -1, 4, 0, 4, -1, 0]);
  }
  const fragmentAst = updateProgram(targetFS);
  const vertexSource = targetVS(vertexAst);
  const fragmentSource = targetFS(fragmentAst);
  const fragmentWriteSource = targetFS(gpgpuWriteOperation(targetFS));
  return {
    geomType,
    count,
    vertexAst,
    fragmentAst,
    vertexSource,
    fragmentSource,
    fragmentWriteSource,
    positionBuffer,
    width,
    height
  };
};
//# sourceMappingURL=state-setup.js.map
