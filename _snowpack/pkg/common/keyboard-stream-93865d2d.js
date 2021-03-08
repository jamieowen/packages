import { f as fromDOMEvent, m as merge } from './event-055cdf9a.js';
import { m as map } from './map-3e2f222d.js';

const events = ["keydown", "keyup"];
const keyboardStream = (params, target = window) => {
    const src = events.map((type) => fromDOMEvent(target, type));
    const { listen = [], toggle = [] } = params;
    const state = {
        isKeyDown: false,
        keysDown: [],
        keysToggled: [],
    };
    return merge({
        src,
        xform: map((ev) => {
            const idx = state.keysDown.indexOf(ev.key);
            const shouldListen = listen.indexOf(ev.key) > -1;
            switch (ev.type) {
                case "keyup":
                    if (shouldListen && idx > -1) {
                        state.keysDown.splice(idx, 1);
                    }
                    const shouldToggle = toggle.indexOf(ev.key) > -1;
                    const togIdx = state.keysToggled.indexOf(ev.key);
                    if (shouldToggle && togIdx === -1) {
                        state.keysToggled.push(ev.key);
                    }
                    else if (shouldToggle && togIdx > -1) {
                        state.keysToggled.splice(togIdx, 1);
                    }
                    break;
                case "keydown":
                    if (shouldListen && idx === -1) {
                        state.keysDown.push(ev.key);
                    }
                    break;
            }
            return Object.assign(Object.assign({}, state), { event: ev, isKeyDown: state.keysDown.length > 0, isKeyToggled: state.keysToggled.length > 0 });
        }),
    });
};

export { keyboardStream as k };
//# sourceMappingURL=keyboard-stream-93865d2d.js.map
