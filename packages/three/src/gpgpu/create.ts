import { WebGLRenderer } from "three";
import { gpgpuSetup, GPGPUSetupOpts } from "@jamieowen/webgl";
import { GPGPUState } from "./state-texture";

export const createStateTextureAst = (
  renderer: WebGLRenderer,
  opts: GPGPUSetupOpts
) => {
  const setup = gpgpuSetup(opts);
  return new GPGPUState(renderer, setup);
};
