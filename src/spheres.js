import * as THREE from "three";
import random from "random";

let fragmentShader = `
varying vec2 vUv;
varying vec3 vColor;

  void main(){
    vec3 color = vColor;
    gl_FragColor = vec4(color, 1.);
  }
`;

let vertexShader = `
#define PI 3.14159265359
attribute vec4 aNot;
varying vec2 vUv;
uniform float uFreq;
uniform float uLong;
uniform float uTime;
uniform float uHold;
uniform vec2 uMouse;

attribute vec3 aColor;
attribute vec4 aEndPosition;
varying vec3 vColor;
  vec3 getCurvePosition(float progress){
    float radius = aNot.x;
    float offset = aNot.z;
    vec3 pos = vec3(0.);

    pos.x += cos(progress *PI *uFreq ) * radius ;
    pos.y += sin(progress *PI*uFreq) * radius + sin(progress * PI *2.) * 30.;

    pos.z += progress *uLong - uLong/2. + offset;
    return pos;
  }
  vec2 getScreenNDC(vec3 pos){
    // https://stackoverflow.com/questions/26965787/how-to-get-accurate-fragment-screen-position-like-gl-fragcood-in-vertex-shader
    vec4 clipSpace = projectionMatrix* modelViewMatrix * vec4(pos, 1.);
    vec3 ndc = clipSpace.xyz / clipSpace.w; //perspective divide/normalize
    vec2 viewPortCoord = ndc.xy; //ndc is -1 to 1 in GL. scale for 0 to 1
    return viewPortCoord;
  }
  void main(){
    vec3 transformed = position.xyz;
    float speed = aNot.w;
    float progress = mod(aNot.y + uTime * speed, 1.);

    vec3 curvePosition = getCurvePosition(progress);

    vec3 spherePosition = mix(curvePosition, aEndPosition.xyz, uHold);
    vec2 SphereViewportCoord =getScreenNDC( spherePosition); //ndc is -1 to 1 in GL. scale for 0 to 1

    float dist = length(uMouse - SphereViewportCoord);
    
    if(dist < 0.4){
      transformed *= 1.+ (1.-dist/0.4) *6.;
    }
    transformed *= 1.- abs(progress - 0.5) *2.;
    float hold = smoothstep(aEndPosition.w, 1., uHold);
    transformed += spherePosition;

    gl_Position = projectionMatrix* modelViewMatrix * vec4(transformed, 1.);

    vUv = uv;
    vColor = vec3(aColor);
  }
`;
let baseGeometry = new THREE.SphereBufferGeometry(1, 6, 6);

let mix = (a, b, t) => a * (1 - t) + b * t;
export class Sphere extends THREE.Mesh {
  constructor(material, config) {
    super();
    this.config = config;
    this.material = material;
    this.geometry = baseGeometry;
    this.hold = 0;
    this.maxScale = config.scale;
    this.updatePosition(0);
  }
  updatePosition(time) {
    let progress = this.config.progress;
    let speed = this.config.speed;
    progress = (progress + time * speed) % 1;
    let radius = this.config.radius;
    let long = this.config.long;
    let offset = this.config.offset;
    let freq = this.config.rotationFrequency;
    let scale = 1 - Math.abs(Math.abs(progress) - 0.5) * 2;
    scale *= this.maxScale;

    let x = Math.cos(progress * Math.PI * freq) * radius;
    let y =
      Math.sin(progress * Math.PI * freq) * radius +
      Math.sin(progress * Math.PI * 2) * 30;
    let z = progress * long - long / 2 + offset;

    this.position.set(x, y, z);
    this.scale.set(scale, scale, scale);
  }
  update(time) {
    this.updatePosition(time);
  }
}
let endSize = 20;
let halfSquare = endSize / 20;

export class Spheres extends THREE.Object3D {
  constructor(config, colors, direction) {
    super();
    this.config = config;
    this.colors = colors;
    this.direction = direction;
    this.meshes = [];
    let materials = this.colors.map(
      color => new THREE.MeshBasicMaterial({ color })
    );
    this.endPositions = [
      new THREE.Vector3(0, endSize / 2, 0),
      new THREE.Vector3(0, -endSize / 2, -endSize)
    ];
    this.materials = materials;
  }
  init() {
    for (let i = 0; i < this.config.nInstances; i++) {
      let radius = random.float(30, 40);
      let progress = random.float() * this.direction;
      let offset = random.float(-5, 5);
      let speed = random.float(0.02, 0.07);

      let index = Math.floor(Math.random() * this.materials.length);
      let centerEndPosition = this.endPositions[index];

      let endPosition = new THREE.Vector3(
        random.float(-halfSquare, halfSquare),
        random.float(-halfSquare, halfSquare),
        random.float(halfSquare)
      );
      endPosition.add(centerEndPosition);

      let material = this.materials[index];
      let sphere = new Sphere(material, {
        progress,
        radius,
        offset,
        speed,
        endPosition,
        scale: 1,
        rotationFrequency: 8,
        long: 200
      });

      this.add(sphere);
      this.meshes.push(sphere);
    }
  }
  update(time) {
    this.meshes.forEach(mesh => mesh.update(time));
  }
  clean() {
    this.meshes.forEach(mesh => this.remove(mesh));
    this.meshes = [];
  }
  onMouseMove(mouse) {
    // this.uniforms.uMouse.value.set(mouse.x, mouse.y);
  }
  dispose() {}
}
