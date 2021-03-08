import { C as CloseMode } from './subscription-3ccab2d1.js';

/**
 * Returns true if mode is FIRST, or if mode is LAST *and* `num = 0`.
 *
 * @internal
 */
const isFirstOrLastInput = (mode, num) => mode === CloseMode.FIRST || (mode === CloseMode.LAST && !num);

export { isFirstOrLastInput as i };
//# sourceMappingURL=checks-bec761b0.js.map
