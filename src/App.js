import "./styles.css";
import * as THREE from "three";
import { BasicThreeDemo } from "./BasicThreeDemo";
import { Spheres } from "./spheres";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import createInputEvents from "simple-input-events";

export class App extends BasicThreeDemo {
  constructor(container, config) {
    super(container);
    this.camera.position.z = 200;
    this.config = config;
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.text = new Text(this);
    this.topSpheres = new Spheres(
      config,
      [new THREE.Color("#ff3030"), new THREE.Color("#121214")],
      1
    );
    this.bottomSpheres = new Spheres(
      config,
      [new THREE.Color("#5050ff"), new THREE.Color("#121214")],
      -1
    );
    this.scene.background = new THREE.Color("#1d2132");

    this.onMove = this.onMove.bind(this);
    this.restart = this.restart.bind(this);

    this.event = createInputEvents(this.container);
  }
  loadAssets() {
    return new Promise((resolve, reject) => {
      const manager = new THREE.LoadingManager(resolve);
      manager.itemStart("a");
      manager.itemEnd("a");
    });
  }
  restart() {
    this.topSpheres.clean();
    this.bottomSpheres.clean();
    this.topSpheres.init();
    this.bottomSpheres.init();
  }
  onMove({ event }) {
    let mouse = {
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1
    };

    // this.topSpheres.onMouseMove(mouse);
    // this.bottomSpheres.onMouseMove(mouse);
  }
  dispose() {
    this.disposed = true;
    this.event.disable();
  }
  init() {
    this.topSpheres.init(this.scene);
    this.bottomSpheres.init(this.scene);
    this.scene.add(this.bottomSpheres);
    this.scene.add(this.topSpheres);

    this.topSpheres.rotation.y = Math.PI / 2;
    this.topSpheres.position.x = Math.PI / 2;

    this.bottomSpheres.rotation.y = Math.PI / 2;
    this.bottomSpheres.rotation.x = Math.PI;
    this.bottomSpheres.position.x = 200;

    this.event.on("move", this.onMove);

    this.tick();
  }
  update() {
    let time = this.clock.getElapsedTime();
    this.topSpheres.update(time);
    this.bottomSpheres.update(-time);
  }
}
