# Description

A lerna based monorepo for some personal custom packages. ( some packages are wip and some used in production )

All written in typescript and using the [ thi.ng ](https://thi.ng/) ecosystem as a thin architectural base. Primarily for features like [streams](http://thi.ng/rstream), [shader-ast](http://thi.ng/shader-ast), [vectors](http://thi.ng/vectors) & [transducers](http://thi.ng/transducers).

# Overview

### Browser

Browser based helpers, gesture streams, keyboard, timers, resize observers, etc.

### Color

Color helpers and utlities for generating color palettes using [thi.ng/color](http://thi.ng/color).

Examples : [color palette grid](https://jamieowen.com/play/color-palette-grid)

### Layout

Some transducer / iterator based helpers for generating seeded infinite style grids/subgrids.

Examples: [infinite grid/subgrid](https://jamieowen.com/packages/infinite-grid)

### Motion

A work in progress stream based motion library. For manipulating objects as a series of stream based attributes/buffers. ( position, scale, etc ).

Examples: [motion trails](https://jamieowen.com/packages/motion-trails)

### Three.js

Some helpers for three.js, lighting rigs, quick scene/sketch setup, renderer helpers, geometry cache, etc.

### WebGL

Helpers for GPGPU abstractions for ping/pong style state handling on the GPU. Plus initial stages of GPU based particle system helpers written with shader AST - a typescript based GLSL abstraction.

Examples: [curl particles](https://jamieowen.com/play/curl-particles) / [gpgpu state](https://jamieowen.com/packages/gpgpu-state)

# Examples

Examples source is found in /examples/src or other sketches found at. [jamieowen.com](http://www.jamieowen.com)
