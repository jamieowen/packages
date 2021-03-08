import { d as defError } from './deferror-99934d1f.js';

const isString = (x) => typeof x === "string";

const isNumber = (x) => typeof x === "number";

const IllegalArgumentError = defError(() => "illegal argument(s)");
const illegalArgs = (msg) => {
    throw new IllegalArgumentError(msg);
};

export { illegalArgs as a, isString as b, isNumber as i };
//# sourceMappingURL=illegal-arguments-07fc2d96.js.map
