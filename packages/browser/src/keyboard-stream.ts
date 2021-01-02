import { merge, fromDOMEvent } from "@thi.ng/rstream";
import { map } from "@thi.ng/transducers";

type KeyStreamParams = {
  // keys to listenn and update state. All events will still be emitted.
  listen: string[];
  // keys to store a toggled state
  toggle: string[];
};

type KeyEventId = "keyup" | "keydown";
const events: KeyEventId[] = ["keydown", "keyup"];

export const keyboardStream = (
  params?: Partial<KeyStreamParams>,
  target: HTMLElement | Window = window
) => {
  const src = events.map((type) => fromDOMEvent<KeyEventId>(target, type));

  const { listen = [], toggle = [] } = params;
  const state = {
    isKeyDown: false,
    keysDown: [],
    keysToggled: [],
  };

  return merge({
    src,
    xform: map((ev: KeyboardEvent) => {
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
          } else if (shouldToggle && togIdx > -1) {
            state.keysToggled.splice(togIdx, 1);
          }
          break;
        case "keydown":
          if (shouldListen && idx === -1) {
            state.keysDown.push(ev.key);
          }
          break;
      }

      return {
        ...state,
        event: ev,
        isKeyDown: state.keysDown.length > 0,
        isKeyToggled: state.keysToggled.length > 0,
      };
    }),
  });
};
