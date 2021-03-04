/**
 * Snowpack.
 *
 * Some issues with aliasing packages.  Some possible reasons could be :
 *
 * + Aliasing to parent folders.  Causes issues with resolving node_modules.
 * + Lack of support for 'full source-code-like development' ? ( see #938 )
 *
 * Solutions could be :
 * + Typesript project references
 *
 * Reference :
 * https://github.com/snowpackjs/snowpack/discussions/938
 */

/**
 * Create alias path & mount points for packages.
 */
const aliasPaths = [
  "browser",
  "color",
  "layout",
  "motion",
  "three",
  "webgl",
  "gui",
  "core",
].reduce(
  (map, pkg) => {
    return {
      alias: {
        ...map.alias,
        [`@jamieowen/${pkg}`]: `../packages/${pkg}/src`,
      },
      alias2: {
        ...map.alias,
        [`@jamieowen/${pkg}`]: `../../packages/${pkg}/src`,
      },
      mount: {
        ...map.mount,
        [`../packages/${pkg}/src`]: `/dist/@jamieowen/${pkg}`,
      },
      relative_mount: {
        ...map.relative_mount,
        [`../packages/${pkg}/src`]: `/packages/${pkg}/src`,
      },
    };
  },
  { alias: {}, mount: {}, relative_mount: {} }
);

/** @type {import("snowpack").SnowpackUserConfig } */
const snowpackConfig = {
  mount: {
    public: { url: "/", static: true },
    src: "/dist",
    // ...aliasPaths.mount,

    // This seems to allow for relative imports direct to pkg folder. e.g : ../../packages/three..
    ...aliasPaths.relative_mount,

    // "../packages/three/src": "/packages/three/src",
  },
  plugins: ["@snowpack/plugin-typescript"],
  alias: {
    // ...aliasPaths.alias2,
  },
  buildOptions: {
    sourcemap: true,
  },
};

console.log(snowpackConfig);

module.exports = snowpackConfig;
