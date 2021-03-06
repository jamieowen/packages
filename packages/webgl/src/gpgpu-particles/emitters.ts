import { assign, Sym, Term, ifThen, gt, float, add } from "@thi.ng/shader-ast";

/**
 *
 * Advance age by decay amount, by assigning
 * decay + age to age symbol.
 *
 * Once age > 1.0, reset age to 0.0 and apply
 * dead terms.
 *
 * @param age
 * @param decay
 * @param dead
 */
export const advanceAgeByDecay = (
  age: Sym<"float">,
  decay: Term<"float">,
  dead: Term<any>[]
) => {
  return ifThen(
    gt(age, float(1.0)),
    [assign(age, float(0.0)), ...dead],
    [assign(age, add(age, decay))]
  );
};

/**
 *
 * Same as @see advanceAgeByDecay(),
 * but assign an emitter term to
 * the position.
 *
 * @param age
 * @param decay
 * @param emitter
 */
export const advanceAgeByDecayEmit = (
  age: Sym<"float">,
  decay: Term<"float">,
  position: Sym<"vec3">,
  emitter: Term<"vec3">
) => advanceAgeByDecay(age, decay, [assign(position, emitter)]);
