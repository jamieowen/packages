import { GridOpts, infiniteGrid } from "@jamieowen/layout";
import { dragGesture2d, reactive } from "@jamieowen/motion";
import { gestureStream } from "@jamieowen/browser";
import { sketch } from "@jamieowen/three";
console.log("Hello Examples.. Typescriptsss");

const gesture$ = gestureStream(document.body);

gesture$.subscribe({
  next: (ev) => {
    console.log(ev.type);
  },
});

// const position = reactive([0.3, 0.8] as [number, number]);
// const opts = reactive<GridOpts>({
//   dimensions: [1, 1],
//   viewport: [4, 3],
// });

// const grid = infiniteGrid(position, opts, {
//   add: (cell) => {},
//   remove: (id, mesh) => {},
//   update: () => {},
// });

// console.log(grid.deref());

sketch(({ configure }) => {
  configure({
    width: "1024px",
    height: "768px",
  });
});
