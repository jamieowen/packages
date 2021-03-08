import { u as uniform, i as input, o as output, s as sym, v as vec4, a as vec2, f as float } from './item-bc8a12c1.js';
import { p as program, d as defMain, a as assign, b as add, $ as $xy, m as mul, f as floor, c as div, e as mod, g as $y, h as $x, s as sub, i as $w, j as step, k as $xyz } from './math-9c107e9c.js';
import { t as texture } from './texture-9eea8e8b.js';
import { t as targetGLSL, G as GLSLVersion } from './target-220e3a94.js';

/**
 *
 * Render a quad style geometry and
 * generate UV for GPGPU texture read.
 *
 * @param target
 */
const gpgpuQuadVertexShader = (target) => {
    const modelViewMatrix = uniform("mat4", "modelViewMatrix", {});
    const projectionMatrix = uniform("mat4", "projectionMatrix");
    const position = input("vec3", "position");
    const vReadUV = output("vec2", "vReadUV");
    return program([
        modelViewMatrix,
        projectionMatrix,
        position,
        vReadUV,
        defMain(() => [
            assign(vReadUV, add($xy(position), 0.5)),
            assign(target.gl_Position, mul(projectionMatrix, mul(modelViewMatrix, vec4(position, 1.0)))),
        ]),
    ]);
};
/**
 *
 * Render 'big triangle' style geometry and
 * generate UV for GPGPU texture read.
 *
 * @param target
 */
const gpgpuTriangleVertexShader = (target) => {
    const position = input("vec3", "position");
    const vReadUV = output("vec2", "vReadUV");
    return program([
        position,
        vReadUV,
        defMain(() => [
            assign(vReadUV, mul(0.5, add($xy(position), 1.0))),
            assign(target.gl_Position, vec4(position, 1.0)),
        ]),
    ]);
};
/**
 * UNUSED.
 * WIP for base update shader.
 * @param target
 */
const gpgpuFragmentBase = (target) => {
    const previous = uniform("sampler2D", "previous");
    const current = uniform("sampler2D", "current");
    const vReadUV = input("vec2", "vReadUV");
    return program([previous, current, vReadUV, defMain(() => [])]);
};
/**
 *
 * Writes an input texture or data texture
 * directly to the output buffer.
 * TODO: inputSource needs renaming.
 * @param target
 *
 */
const gpgpuWriteOperation = (target) => {
    const currentIn = uniform("sampler2D", "inputSource");
    const vReadUV = input("vec2", "vReadUV");
    const current = sym(texture(currentIn, vReadUV));
    return program([
        currentIn,
        vReadUV,
        defMain(() => [current, assign(target.gl_FragColor, current)]),
    ]);
};

const gpgpuSetup = (opts) => {
    const { width, height, count, geomType, updateProgram } = opts;
    const targetVS = targetGLSL({
        version: GLSLVersion.GLES_100,
        versionPragma: false,
        type: "vs",
    });
    const targetFS = targetGLSL({
        version: GLSLVersion.GLES_100,
        versionPragma: false,
        type: "fs",
        prelude: "precision highp float;",
    });
    let vertexAst;
    let positionBuffer;
    /**
     * Determine which vertex shader to use
     * for determining read uv from geometry.
     */
    if (geomType === "quad") {
        vertexAst = gpgpuQuadVertexShader(targetVS);
        // prettier-ignore
        positionBuffer = new Float32Array([-0.5, 0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0]);
    }
    else {
        vertexAst = gpgpuTriangleVertexShader(targetVS);
        positionBuffer = new Float32Array([-1, -1, 0, -1, 4, 0, 4, -1, 0]);
    }
    const fragmentAst = updateProgram(targetFS);
    const vertexSource = targetVS(vertexAst);
    const fragmentSource = targetFS(fragmentAst);
    // An additional source for raw state writes.
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
        height,
    };
};

/**
 *
 * Shader for rendering particles as lines
 * based on the velocity of the particle.
 *
 * Velocity is calculated from the difference between
 * two position states.
 *
 * @param target
 */
const linesVertexShader = (target) => {
    const projectionMatrix = uniform("mat4", "projectionMatrix");
    const modelViewMatrix = uniform("mat4", "modelViewMatrix");
    const resolution = uniform("vec2", "resolution");
    const state_1 = uniform("sampler2D", "state_1");
    const state_2 = uniform("sampler2D", "state_2");
    // Attributes
    const position = input("vec3", "position");
    const color = input("vec3", "color");
    const vColor = output("vec3", "vColor");
    // Offsets span from 0 to count * 2.
    // From this, the line segment start and end is determined by offset % 2
    // And the offset for reading from the texture is offset / 2
    const offset = input("float", "offset");
    const offset2 = floor(div(offset, 2.0));
    // Read Values
    const uv = sym(div(vec2(div(offset2, $x(resolution)), mod(offset2, $y(resolution))), resolution));
    const readState1 = sym(texture(state_1, uv));
    const readState2 = sym(texture(state_2, uv));
    const stateDiff = sym(sub(readState2, readState1));
    // Line/Velocity length
    // Ensure age2 < age1 always. Otherwise lines
    // flicker when resetting age between states.
    const age1 = $w(readState1);
    const age2 = $w(readState2);
    const velCap = step(float(0), sub(age1, age2)); // cap velocity
    const lineLen = mul(float(5.0), velCap); // multiply by line length, unless age2 > age 1
    const vel = mul($xyz(stateDiff), lineLen); // apply
    const pos = $xyz(readState1);
    const modOffset = mod(offset, float(2.0));
    const pos1 = add(pos, mul(vel, modOffset)); // mod the offset and add the velocity on alternating indices.
    return program([
        // Uniforms
        projectionMatrix,
        modelViewMatrix,
        state_1,
        state_2,
        resolution,
        // Attributes
        position,
        offset,
        color,
        vColor,
        // Main
        defMain(() => [
            uv,
            readState1,
            readState2,
            stateDiff,
            assign(vColor, color),
            // assign(vColor, vec3(0.7)),
            assign(target.gl_Position, mul(projectionMatrix, mul(modelViewMatrix, vec4(pos1, 1.0)))),
        ]),
    ]);
};
const linesFragmentShader = (target) => {
    let vColor;
    return program([
        (vColor = input("vec3", "vColor", { prec: "highp" })),
        defMain(() => [assign(target.gl_FragColor, vec4(vColor, 1.0))]),
    ]);
};
const particleLinesProgram = () => {
    return {
        vertexShader: linesVertexShader,
        fragmentShader: linesFragmentShader,
    };
};

const pointsVertexShader = (target) => {
    const projectionMatrix = uniform("mat4", "projectionMatrix");
    const modelViewMatrix = uniform("mat4", "modelViewMatrix");
    const resolution = uniform("vec2", "resolution");
    const state_1 = uniform("sampler2D", "state_1");
    const point_size = uniform("float", "point_size");
    // Attributes
    const position = input("vec3", "position");
    const offset = input("float", "offset");
    const color = input("vec3", "color");
    // Varyings
    const vColor = output("vec3", "vColor");
    // Read Values
    const uv = sym(div(vec2(div(offset, $x(resolution)), mod(offset, $y(resolution))), resolution));
    const readState = sym(texture(state_1, uv));
    const pos = $xyz(readState);
    $w(readState);
    return program([
        // Uniforms
        projectionMatrix,
        modelViewMatrix,
        state_1,
        point_size,
        resolution,
        // Attributes
        position,
        offset,
        color,
        vColor,
        // Main
        defMain(() => [
            uv,
            readState,
            assign(target.gl_PointSize, point_size),
            assign(vColor, color),
            assign(target.gl_Position, mul(projectionMatrix, mul(modelViewMatrix, vec4(pos, 1.0)))),
        ]),
    ]);
};
const pointsFragmentShader = (target) => {
    const vColor = input("vec3", "vColor", { prec: "highp" });
    return program([
        vColor,
        defMain(() => [assign(target.gl_FragColor, vec4(vColor, 1.0))]),
    ]);
};
const particlePointsProgram = () => {
    return {
        vertexShader: pointsVertexShader,
        fragmentShader: pointsFragmentShader,
    };
};

const compileProgramAst = (programAst) => {
    const compileVS = targetGLSL({
        version: GLSLVersion.GLES_100,
        type: "vs",
    });
    const compileFS = targetGLSL({
        version: GLSLVersion.GLES_100,
        type: "fs",
    });
    const vertexSource = compileVS(programAst.vertexShader(compileVS));
    const fragmentSource = compileFS(programAst.fragmentShader(compileFS));
    return {
        vertexSource,
        fragmentSource,
    };
};

export { particlePointsProgram as a, linesFragmentShader as b, compileProgramAst as c, pointsVertexShader as d, pointsFragmentShader as e, gpgpuQuadVertexShader as f, gpgpuSetup as g, gpgpuTriangleVertexShader as h, gpgpuFragmentBase as i, gpgpuWriteOperation as j, linesVertexShader as l, particleLinesProgram as p };
//# sourceMappingURL=ast-compile-helpers-350d4721.js.map
