import { App } from "./App";
import debounce from "debounce";
/**
 * [ ] Turn Antialias on
 *
 *
 */

let config = {
  nInstances: 1000,
  scale: 1
};
/// 15,000 30fps
// 7,000 60ps
const container = document.getElementById("app");
const myApp = new App(container, config);
myApp.init();

let less = document.getElementById("less");
let more = document.getElementById("more");
let evenLess = document.getElementById("even-less");
let evenMore = document.getElementById("even-more");
let countEle = document.getElementById("count");
let switchEle = document.getElementById("switch");

let restart = debounce(myApp.restart, 400);

countEle.innerText = config.nInstances * 2;
let addInstances = count => {
  config.nInstances += count;
  config.nInstances = Math.max(500, config.nInstances);
  countEle.innerText = config.nInstances * 2;
  let scale = 1 - Math.min(1, (config.nInstances - 500) / 50000) * 0.8;
  config.scale = scale;
  restart();
};
let handleLess = () => {
  addInstances(-500);
};

let handleEvenLess = () => {
  addInstances(-2000);
};
let handleMore = () => {
  addInstances(500);
};
let handleEvenMore = () => {
  addInstances(2000);
};

let handleSwitch = () => {
  config.useCube = !config.useCube;
  if (config.useCube) {
    switchEle.innerText = "Use Spheres";
  } else {
    switchEle.innerText = "Use Cubes";
  }
  restart();
};
switchEle.addEventListener("click", handleSwitch);

less.addEventListener("click", handleLess);
more.addEventListener("click", handleMore);
evenLess.addEventListener("click", handleEvenLess);
evenMore.addEventListener("click", handleEvenMore);
if (module && module.hot) {
  // module.hot.accept((a, b) => {
  //   // For some reason having this function here makes dat gui work correctly
  //   // when using hot module replacement
  // });
  module.hot.dispose(() => {
    less.removeEventListener("click", handleLess);
    more.removeEventListener("click", handleMore);
    evenLess.removeEventListener("click", handleEvenLess);
    evenMore.removeEventListener("click", handleEvenMore);
    switchEle.removeEventListener("click", handleSwitch);
    if (myApp) myApp.dispose();
  });
}
