import { d as defError } from './deferror-99934d1f.js';

const UnsupportedOperationError = defError(() => "unsupported operation");
const unsupported = (msg) => {
    throw new UnsupportedOperationError(msg);
};

export { unsupported as u };
//# sourceMappingURL=unsupported-608d53c8.js.map
