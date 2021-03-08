import {Stream} from "../../../_snowpack/pkg/@thi.ng/rstream.js";
export function resizeObserverStream(domElement, opts = {box: "border-box"}) {
  return new Stream((stream) => {
    const callback = (entries) => {
      const entry = entries[0];
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      stream.next({width, height, entry, domElement});
    };
    stream.next({width: 0, height: 0, entry: null, domElement});
    const observer = new ResizeObserver(callback);
    observer.observe(domElement, opts);
    return () => {
      observer.disconnect();
    };
  });
}
//# sourceMappingURL=resize-observer-stream.js.map
