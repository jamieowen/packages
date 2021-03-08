import { c as clamp } from './interval-ab795faf.js';
import { m as merge, f as fromDOMEvent } from './event-055cdf9a.js';
import { m as map } from './map-3e2f222d.js';
import { i as isBoolean } from './is-boolean-04a49a85.js';

const START_EVENTS = new Set([
    "mousedown",
    "touchmove",
    "touchstart",
    "mousemove",
]);
const END_EVENTS = new Set(["mouseup", "touchend", "touchcancel"]);
const BASE_EVENTS = ["mousemove", "mousedown", "touchstart", "wheel"];
const EVENT_GESTURETYPES = {
    touchstart: "start",
    touchmove: "drag",
    touchend: "end",
    touchcancel: "end",
    mousedown: "start",
    mouseup: "end",
    wheel: "zoom",
};
/**
 * Attaches mouse & touch event listeners to given DOM element and
 * returns a stream of {@link GestureEvent}s and their
 * {@link GestureInfo} details.
 *
 * In multi-touch environments, a `GestureEvent` can contain multiple
 * such `GestureInfo` objects (one per active touch). In general, the
 * `click` and `delta` values are only present if the abstracted event
 * `type == "drag"`. Both (and `pos` too) are 2-element arrays
 * of `[x,y]` coordinates.
 *
 * The `zoom` value is always present, but is only updated with wheel
 * events. The value will be constrained to `minZoom` ... `maxZoom`
 * interval (provided via options object).
 *
 * Note: If using `preventDefault` and attaching the event stream to
 * `document.body`, the following event listener options SHOULD be used:
 *
 * @example
 * ```ts
 * eventOpts: { passive: false }
 * ```
 *
 * {@link https://www.chromestatus.com/features/5093566007214080 }
 *
 * @param el -
 * @param opts -
 */
const gestureStream = (el, _opts) => {
    const opts = Object.assign({ id: "gestures", zoom: 1, absZoom: true, minZoom: 0.25, maxZoom: 4, smooth: 1, eventOpts: { capture: true }, preventDefault: true, preventScrollOnZoom: true, preventContextMenu: true, local: true, scale: false }, _opts);
    const active = [];
    let zoom = clamp(opts.zoom, opts.minZoom, opts.maxZoom);
    let zoomDelta = 0;
    let numTouches = 0;
    let tempStreams;
    const isBody = el === document.body;
    const tempEvents = [
        "touchend",
        "touchcancel",
        "touchmove",
        "mouseup",
    ];
    !isBody && tempEvents.push("mousemove");
    opts.preventContextMenu &&
        el.addEventListener("contextmenu", (e) => e.preventDefault());
    const gestureStart = (etype, events, bounds, isTouch) => {
        const isStart = etype === "mousedown" || etype === "touchstart";
        for (let t of events) {
            const id = t.identifier || 0;
            const pos = getPos(t, bounds, opts.local, opts.scale);
            let touch = active.find((t) => t.id === id);
            if (!touch && isStart) {
                touch = { id, start: pos };
                active.push(touch);
                numTouches++;
            }
            if (touch) {
                touch.pos = pos;
                touch.delta = [
                    pos[0] - touch.start[0],
                    pos[1] - touch.start[1],
                ];
                if (isTouch) {
                    touch.force = t.force;
                }
            }
        }
        if (isStart && !tempStreams) {
            tempStreams = tempEvents.map((id) => eventSource(document.body, id, opts, "-temp"));
            stream.addAll(tempStreams);
            !isBody && stream.removeID("mousemove");
        }
    };
    const gestureEnd = (events) => {
        for (let t of events) {
            const id = t.identifier || 0;
            const idx = active.findIndex((t) => t.id === id);
            if (idx !== -1) {
                active.splice(idx, 1);
                numTouches--;
            }
        }
        if (numTouches === 0) {
            stream.removeAll(tempStreams);
            !isBody && stream.add(eventSource(el, "mousemove", opts));
            tempStreams = undefined;
        }
    };
    const updateZoom = (e) => {
        const zdelta = opts.smooth *
            ("wheelDeltaY" in e
                ? -e.wheelDeltaY / 120
                : e.deltaY / 40);
        zoom = opts.absZoom
            ? clamp(zoom + zdelta, opts.minZoom, opts.maxZoom)
            : zdelta;
        zoomDelta = zdelta;
    };
    const stream = merge({
        src: BASE_EVENTS.map((id) => eventSource(el, id, opts)),
        xform: map((e) => {
            opts.preventDefault && e.preventDefault();
            const etype = e.type;
            const type = classifyEventType(etype, !!tempStreams);
            let isTouch = !!e.touches;
            let events = isTouch
                ? Array.from(e.changedTouches)
                : [e];
            const bounds = el.getBoundingClientRect();
            if (START_EVENTS.has(etype)) {
                gestureStart(etype, events, bounds, isTouch);
            }
            else if (END_EVENTS.has(etype)) {
                gestureEnd(events);
            }
            else if (type === "zoom") {
                updateZoom(e);
            }
            return {
                event: e,
                pos: getPos(events[0], bounds, opts.local, opts.scale),
                buttons: isTouch ? active.length : e.buttons,
                type,
                active,
                zoom,
                zoomDelta,
                isTouch,
            };
        }),
    });
    return stream;
};
const eventSource = (el, type, opts, suffix = "") => {
    let eventOpts = opts.eventOpts;
    if (type === "wheel" && opts.preventScrollOnZoom) {
        eventOpts = isBoolean(eventOpts)
            ? { capture: eventOpts, passive: false }
            : Object.assign(Object.assign({}, eventOpts), { passive: false });
    }
    return fromDOMEvent(el, type, eventOpts, { id: type + suffix });
};
const classifyEventType = (etype, isActive) => etype === "mousemove"
    ? isActive
        ? "drag"
        : "move"
    : EVENT_GESTURETYPES[etype];
const getPos = (e, bounds, isLocal, doScale) => {
    let x = e.clientX;
    let y = e.clientY;
    if (isLocal) {
        x -= bounds.left;
        y -= bounds.top;
    }
    if (doScale) {
        const dpr = window.devicePixelRatio || 1;
        x *= dpr;
        y *= dpr;
    }
    return [x | 0, y | 0];
};

export { gestureStream as g };
//# sourceMappingURL=gesture-stream-45517c35.js.map
