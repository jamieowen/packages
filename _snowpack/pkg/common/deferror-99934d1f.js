const defError = (prefix, suffix = (msg) => (msg !== undefined ? ": " + msg : "")) => class extends Error {
    constructor(msg) {
        super(prefix(msg) + suffix(msg));
    }
};

export { defError as d };
//# sourceMappingURL=deferror-99934d1f.js.map
