import {assign, ifThen, gt, float, add} from "../../../../_snowpack/pkg/@thi.ng/shader-ast.js";
export const advanceAgeByDecay = (age, decay, dead) => {
  return ifThen(gt(age, float(1)), [assign(age, float(0)), ...dead], [assign(age, add(age, decay))]);
};
export const advanceAgeByDecayEmit = (age, decay, position, emitter) => advanceAgeByDecay(age, decay, [assign(position, emitter)]);
//# sourceMappingURL=emitters.js.map
