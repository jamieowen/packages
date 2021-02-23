const pkg = require("./package.json");
import typescript from "@rollup/plugin-typescript";

export default {
  input: "./dist/index.js",
  output: {
    file: pkg.main,
    format: "cjs",
  },
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [typescript()],
};
