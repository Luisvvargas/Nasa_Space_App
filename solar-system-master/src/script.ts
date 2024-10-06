import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer";
import { createEnvironmentMap } from "./setup/environment-map";
import { options } from "./setup/gui";
import { createLights } from "./setup/lights";
import { createSolarSystem } from "./setup/solar-system";
import './style.scss';

THREE.ColorManagement.enabled = false;

// Canvas
const canvas = document.querySelector("canvas.webgl") as HTMLElement;

// Scene
const scene = new THREE.Scene();

// Environment map
scene.background = createEnvironmentMap("./textures/environment");

// Lights
const [ambientLight, pointLight] = createLights();
scene.add(ambientLight, pointLight);

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderers
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  bloomComposer.setSize(sizes.width, sizes.height);
  labelRenderer.setSize(sizes.width, sizes.height);
});

// Solar system
const [solarSystem, planetNames] = createSolarSystem(scene);

// Create hitboxes for each planet
Object.values(solarSystem).forEach((planet) => {
  const hitboxGeometry = new THREE.SphereGeometry(planet.radius * 1.5, 32, 32); // Increase hitbox size by 50%
  const hitboxMaterial = new THREE.MeshBasicMaterial({
    visible: false, // Make the hitbox invisible
  });
  const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
  planet.mesh.add(hitbox); // Attach the hitbox to the planet
  planet.hitbox = hitbox; // Store the hitbox in the planet object for later use
});

// Raycaster for detecting clicks on planets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event listener for mouse clicks
window.addEventListener("click", (event) => {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the raycaster with the current camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Check for intersections with planetary hitboxes (not the visible planet mesh)
  const intersects = raycaster.intersectObjects(
    Object.values(solarSystem).map((obj) => obj.hitbox) // Use hitbox instead of mesh
  );

  if (intersects.length > 0) {
    // Get the first intersected object (closest to the camera)
    const intersectedObject = intersects[0].object;

    // Find the planet or moon that was clicked
    const clickedPlanet = Object.keys(solarSystem).find(
      (key) => solarSystem[key].hitbox === intersectedObject
    );

    if (clickedPlanet && options.focus !== clickedPlanet) {
      // Change focus to the clicked planet
      changeFocus(options.focus, clickedPlanet);
      options.focus = clickedPlanet;
    }
  }
});

let focusedPlanet: any = null; // Inicialmente, no hay planeta enfocado

const changeFocus = (oldFocus: string, newFocus: string) => {
  const selectedPlanet = solarSystem[newFocus];

  // Actualiza el planeta enfocado, excepto si es el Sol
  if (newFocus !== "Sun") {
    focusedPlanet = selectedPlanet;
  } else {
    focusedPlanet = null; // No seguir al Sol
  }

  // Actualiza los límites del control y el objetivo
  const minDistance = selectedPlanet.getMinDistance();
  controls.minDistance = minDistance;
  controls.maxDistance = minDistance * 3;

  // Si es el Sol, establecer el objetivo en su posición mundial
  if (newFocus === "Sun") {
    const sunPosition = new THREE.Vector3();
    selectedPlanet.mesh.getWorldPosition(sunPosition);
    controls.target.copy(sunPosition);
  }

  // Actualiza la interfaz y etiquetas
  (document.querySelector(".caption p") as HTMLElement).innerHTML = newFocus;
  solarSystem[oldFocus].labels.hidePOI();
  solarSystem[newFocus].labels.showPOI();
};

// Camera
const aspect = sizes.width / sizes.height;
const camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
camera.position.set(0, 20, 50);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;

// Start orbit around the Sun's world position
const sunPosition = new THREE.Vector3();
solarSystem["Sun"].mesh.getWorldPosition(sunPosition);
controls.target.copy(sunPosition);
controls.minDistance = solarSystem["Sun"].getMinDistance();
controls.maxDistance = 200;

// Label renderer
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(sizes.width, sizes.height);
document.body.appendChild(labelRenderer.domElement);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const renderScene = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(sizes.width, sizes.height),
  0.75,
  0,
  1
);

const bloomComposer = new EffectComposer(renderer);
bloomComposer.setSize(sizes.width, sizes.height);
bloomComposer.renderToScreen = true;
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

// Animate
const clock = new THREE.Clock();
let elapsedTime = 0;
let speedFactor = 1;

// Agregar listener al botón "Regresar al Sol"
document.getElementById("btn-sun")?.addEventListener("click", () => {
  if (options.focus !== "Sun") {
    changeFocus(options.focus, "Sun");
    options.focus = "Sun";
  }
});

// Agregar listener al botón "Aumentar Velocidad"
document.getElementById("btn-speed")?.addEventListener("click", () => {
  speedFactor = speedFactor >= 16 ? 1 : speedFactor * 2; // Incrementar velocidad x2, x4, x8, luego regresar a x1
  options.speed = 0.125 * speedFactor;
  (document.getElementById("btn-speed") as HTMLElement).innerText = ` - x${speedFactor} - `;
});

(function tick() {
  elapsedTime += clock.getDelta() * options.speed;

  // Update the solar system objects
  for (const object of Object.values(solarSystem)) {
    object.tick(elapsedTime);
  }

  // Update camera position to follow the focused planet, except for the Sun
  if (focusedPlanet) {
    const minDistance = focusedPlanet.getMinDistance();
    const cameraDistance = minDistance * 1.5;

    // Get the world position of the focused planet
    const planetPosition = new THREE.Vector3();
    focusedPlanet.mesh.getWorldPosition(planetPosition);

    // Update camera position to follow the planet's orbit
    camera.position.set(
      planetPosition.x + cameraDistance,
      planetPosition.y + cameraDistance / 2,
      planetPosition.z + cameraDistance
    );

    // Ensure the camera is looking at the planet
    camera.lookAt(planetPosition);

    // Update controls target
    controls.target.copy(planetPosition);
  }

  // Update controls and camera position
  controls.update();

  // Update labels
  const currentBody = solarSystem[options.focus];
  currentBody.labels.update(camera);

  // Render
    bloomComposer.render();
    labelRenderer.render(scene, camera);
  
    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
  })();
  