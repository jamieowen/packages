module.exports = {
  mount: {
    public: { url: "/", static: true },
    src: "/dist",
    // "./node_modules/@jamieowen/layout/src": "/dist/@jamieowen/layout",
    // "./node_modules/@jamieowen/motion/src": "/dist/@jamieowen/motion",
    // "./node_modules/@jamieowen/three/src": "/dist/@jamieowen/three",
  },
  plugins: ["@snowpack/plugin-typescript"],
  alias: {
    // "@jamieowen/motion": "./node_modules/@jamieowen/motion/src",
    // "@jamieowen/three": "./node_modules/@jamieowen/three/src",
    // "@jamieowen/layout": "./node_modules/@jamieowen/layout/src",
    // "@jamieowen/browser": "./node_modules/@jamieowen/browser/src",
    // "@jamieowen/color": "./node_modules/@jamieowen/color/src",
  },
};
