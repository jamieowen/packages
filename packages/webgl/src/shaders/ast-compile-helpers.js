import {targetGLSL, GLSLVersion} from "../../../../_snowpack/pkg/@thi.ng/shader-ast-glsl.js";
export const compileProgramAst = (programAst) => {
  const compileVS = targetGLSL({
    version: GLSLVersion.GLES_100,
    type: "vs"
  });
  const compileFS = targetGLSL({
    version: GLSLVersion.GLES_100,
    type: "fs"
  });
  const vertexSource = compileVS(programAst.vertexShader(compileVS));
  const fragmentSource = compileFS(programAst.fragmentShader(compileFS));
  return {
    vertexSource,
    fragmentSource
  };
};
//# sourceMappingURL=ast-compile-helpers.js.map
