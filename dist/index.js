import {gestureStream} from "../_snowpack/pkg/@jamieowen/browser.js";
import {sketch} from "../_snowpack/pkg/@jamieowen/three.js";
console.log("Hello Examples.. Typescriptsss");
const gesture$ = gestureStream(document.body);
gesture$.subscribe({
  next: (ev) => {
    console.log(ev.type);
  }
});
sketch(({configure}) => {
  configure({
    width: "1024px",
    height: "768px"
  });
});
