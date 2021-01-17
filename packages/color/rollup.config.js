const pkg = require("./package.json");

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
};
