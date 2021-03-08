var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["FINE"] = 0] = "FINE";
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["SEVERE"] = 4] = "SEVERE";
    LogLevel[LogLevel["NONE"] = 5] = "NONE";
})(LogLevel || (LogLevel = {}));

const NULL_LOGGER = Object.freeze({
    level: LogLevel.NONE,
    fine() { },
    debug() { },
    info() { },
    warn() { },
    severe() { },
});

export { NULL_LOGGER as N };
//# sourceMappingURL=logger-b7639346.js.map
