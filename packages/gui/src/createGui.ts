import { GUI, GUIController } from "dat.gui";
import { Stream } from "@thi.ng/rstream";
import { keyboardStream } from "@jamieowen/browser";

const guiListen = (gui: GUI, callback: () => void) => {
  gui.__controllers.forEach((c) => c.onChange(callback));
  Object.values(gui.__folders).forEach((g) => guiListen(g, callback));
};
// type Value = string | number |
export function createGui<T>(controls: T) {
  // Create dat.gui
  const gui = new GUI({
    width: 350,
    closed: true,
  });

  keyboardStream({
    toggle: ["k"],
  }).subscribe({
    next: (ev) => {
      if (ev.isKeyToggled && ev.keysToggled.indexOf("k") > -1) {
        gui.hide();
      } else {
        gui.show();
      }
    },
  });

  gui.domElement.parentElement.style.zIndex = "100";
  // Convert controls object to gui compatible
  const values: Partial<Record<keyof T, any>> = {};
  Object.entries(controls).forEach(([key, value]) => {
    let control: GUIController;
    // Add item array
    if (value instanceof Array) {
      // number, min/max shorthand.
      if (value.length === 4 && typeof value[0] === "number") {
        values[key as keyof T] = value[0];
        control = gui.add(values, key, value[1], value[2], value[3]);
      } else {
        values[key as keyof T] = value[0];
        control = gui.add(values, key, value);
      }
    } else if (typeof value === "function") {
      // add function ref directly
      control = gui.add(controls, key);
    } else {
      // copy values to new object
      values[key as keyof T] = value;
      control = gui.add(values, key);
    }

    // control.name(key.toUpperCase());
  });

  const stream = new Stream<{
    gui: GUI;
    values: typeof values;
  }>(($) => {
    guiListen(gui, () => {
      $.next({
        values,
        gui,
      });
    });
  });
  stream.next({
    values,
    gui,
  });
  return stream;
}
