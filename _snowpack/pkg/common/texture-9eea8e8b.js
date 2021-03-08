import { b as isVec } from './item-bc8a12c1.js';
import { l as builtinCall } from './math-9c107e9c.js';
import { a as illegalArgs } from './illegal-arguments-07fc2d96.js';

const texRetType = (sampler) => {
    const t = sampler.type[0];
    const shadow = sampler.type.indexOf("Shadow") > 0;
    return t === "s"
        ? shadow
            ? "float"
            : "vec4"
        : t === "i"
            ? shadow
                ? "int"
                : "ivec4"
            : t === "u"
                ? shadow
                    ? "uint"
                    : "uvec4"
                : illegalArgs(`unknown sampler type ${sampler.type}`);
};
const $call = (name, sampler, args, bias) => {
    const f = bias
        ? builtinCall(name, texRetType(sampler), sampler, ...args, bias)
        : builtinCall(name, texRetType(sampler), sampler, ...args);
    !isVec(f) && (f.info = "n");
    return f;
};
// prettier-ignore
function texture(sampler, uv, bias) {
    return $call("texture", sampler, [uv], bias);
}

export { texture as t };
//# sourceMappingURL=texture-9eea8e8b.js.map
