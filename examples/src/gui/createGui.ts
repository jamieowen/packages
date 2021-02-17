import { GUI, GUIController } from "dat.gui";
import { Stream } from "@thi.ng/rstream";

const guiListen = (gui: GUI, callback: () => void) => {
  gui.__controllers.forEach((c) => c.onChange(callback));
  Object.values(gui.__folders).forEach((g) => guiListen(g, callback));
};
// type Value = string | number |
export function createGui<T>(controls: T) {
  // Create dat.gui
  const gui = new GUI({
    width: 250,
  });
  // Convert controls object to gui compatible
  const values: Partial<Record<keyof T, any>> = {};
  Object.entries(controls).forEach(([key, value]) => {
    let control: GUIController;
    // Add item array
    if (value instanceof Array) {
      // copy values over to new object
      values[key] = value[0];
      control = gui.add(values, key, value);
    } else if (typeof value === "function") {
      // add function ref directly
      control = gui.add(controls, key);
    } else {
      // copy values to new object
      values[key] = value;
      control = gui.add(values, key);
    }

    control.name(key.toUpperCase());
  });

  const stream = new Stream<{
    gui: GUI;
    values: typeof values;
  }>(($) => {
    guiListen(gui, () => {
      console.log("CHANGE");
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
