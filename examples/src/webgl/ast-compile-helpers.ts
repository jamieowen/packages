import { program } from "@thi.ng/shader-ast";
import { GLSLTarget, targetGLSL, GLSLVersion } from "@thi.ng/shader-ast-glsl";

export interface ProgramAst {
  vertexShader: (target: GLSLTarget) => ReturnType<typeof program>;
  fragmentShader: (target: GLSLTarget) => ReturnType<typeof program>;
}

export const compileProgramAst = (programAst: ProgramAst) => {
  const compileFS = targetGLSL({
    version: GLSLVersion.GLES_100,
    type: "fs",
  });
  const compileVS = targetGLSL({
    version: GLSLVersion.GLES_100,
    type: "vs",
  });

  console.log("AST COMPILE VERTEX: ", programAst.vertexShader(compileVS));

  const vertexSource = compileVS(programAst.vertexShader(compileVS));
  const fragmentSource = compileVS(programAst.fragmentShader(compileFS));

  return {
    vertexSource,
    fragmentSource,
  };
};
