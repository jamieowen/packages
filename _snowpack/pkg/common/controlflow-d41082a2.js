import { q as scope } from './math-9c107e9c.js';

const ifThen = (test, truthy, falsey) => ({
    tag: "if",
    type: "void",
    test,
    t: scope(truthy),
    f: falsey ? scope(falsey) : undefined,
});

export { ifThen as i };
//# sourceMappingURL=controlflow-d41082a2.js.map
