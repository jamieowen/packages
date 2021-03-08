import {gpgpuSetup} from "../../../../_snowpack/pkg/@jamieowen/webgl.js";
import {GPGPUState} from "./state-texture.js";
export const createStateTextureAst = (renderer, opts) => {
  const setup = gpgpuSetup(opts);
  return new GPGPUState(renderer, setup);
};
//# sourceMappingURL=create.js.map
