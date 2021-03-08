import { S as Stream } from './stream-f3489f1b.js';

function resizeObserverStream(domElement, opts = { box: "border-box" }) {
    return new Stream((stream) => {
        const callback = (entries) => {
            const entry = entries[0];
            const width = entry.contentRect.width;
            const height = entry.contentRect.height;
            stream.next({ width, height, entry, domElement });
        };
        stream.next({ width: 0, height: 0, entry: null, domElement });
        const observer = new ResizeObserver(callback);
        observer.observe(domElement, opts);
        return () => {
            observer.disconnect();
        };
    });
}

export { resizeObserverStream as r };
//# sourceMappingURL=resize-observer-stream-fc863d0f.js.map
