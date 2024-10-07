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
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  bloomComposer.setSize(sizes.width, sizes.height);
  labelRenderer.setSize(sizes.width, sizes.height);
});

// Solar system
const [solarSystem, planetNames] = createSolarSystem(scene);

// Create hitboxes for each planet
Object.values(solarSystem).forEach((planet) => {
  const hitboxGeometry = new THREE.SphereGeometry(planet.radius * 1.5, 32, 32);
  const hitboxMaterial = new THREE.MeshBasicMaterial({
    visible: false,
  });
  const hitbox = new THREE.Mesh(hitboxGeometry, hitboxMaterial);
  planet.mesh.add(hitbox);
  planet.hitbox = hitbox;
});

// Camera positions
const cameraPositions = {
  solarSystem: {
    position: new THREE.Vector3(0, 20, 20), // Ajustado para comenzar más cerca del sistema solar
    target: new THREE.Vector3(0, 0, 0)
  },
  default: {
    position: new THREE.Vector3(0, 50, 100),
    target: new THREE.Vector3(0, 0, 0)
  }
};

// Raycaster for detecting clicks on planets
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Function to show planet information
const showPlanetInfo = (planetName: string) => {
  const planet = solarSystem[planetName];

  // Update the planet info panel
  const infoPanel = document.getElementById("planet-info") as HTMLElement;
  const planetNameElem = document.getElementById("planet-name") as HTMLElement;
  const planetRadiusElem = document.getElementById("planet-radius") as HTMLElement;
  const planetDistanceElem = document.getElementById("planet-distance") as HTMLElement;
  const planetPeriodElem = document.getElementById("planet-period") as HTMLElement;
  const planetDaylengthElem = document.getElementById("planet-daylength") as HTMLElement;
  const planetCategory = document.getElementById("planet-category") as HTMLElement;
  const planetDescription = document.getElementById("planet-description") as HTMLElement;
  const planetNamesake = document.getElementById("planet-namesake") as HTMLElement;
  const planetMoons = document.getElementById("planet-moons") as HTMLElement;



  planetNameElem.textContent = planetName;
  planetRadiusElem.textContent = `Radius: ${planet.radius} km`;
  planetDistanceElem.textContent = `Distance from Sun: ${planet.distance} AU`;
  planetPeriodElem.textContent = `Orbital Period: ${planet.period} years`;
  planetDaylengthElem.textContent = `Day Length: ${planet.daylength} hours`;
  planetCategory.textContent = `Category: ${planet.category} hours`;
  planetDescription.textContent = `Description: ${planet.description} hours`;
  planetNamesake.textContent = `Namesake: ${planet.namesake}`;
  planetMoons.textContent = `Moons: ${planet.moons}`;


  // Show the info panel
  infoPanel.style.display = "block";
};

// Update the click event to show planet info
window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(
    Object.values(solarSystem).map((obj) => obj.hitbox)
  );

  if (intersects.length > 0) {
    const intersectedObject = intersects[0].object;
    const clickedPlanet = Object.keys(solarSystem).find(
      (key) => solarSystem[key].hitbox === intersectedObject
    );

    if (clickedPlanet && options.focus !== clickedPlanet) {
      changeFocus(options.focus, clickedPlanet);
      options.focus = clickedPlanet;

      // Show the planet information
      showPlanetInfo(clickedPlanet);
    }
  }
});

let focusedPlanet: any = null;

let cameraTransition = {
  inProgress: false,
  duration: 1.5,
  time: 0,
  fromPosition: new THREE.Vector3(),
  toPosition: new THREE.Vector3(),
  fromTarget: new THREE.Vector3(),
  toTarget: new THREE.Vector3(),
};

const changeFocus = (oldFocus: string, newFocus: string) => {
  const selectedPlanet = solarSystem[newFocus];

  focusedPlanet = newFocus !== "SolarSystem" ? selectedPlanet : null;

  let minDistance = selectedPlanet.getMinDistance();
  if (newFocus === "SolarSystem") {
    minDistance = 20; // Ajustado para vista más cercana al sistema solar
  }
  controls.minDistance = minDistance;
  controls.maxDistance = minDistance * 5;

  cameraTransition.inProgress = true;
  cameraTransition.time = 0;
  cameraTransition.duration = 1.5;
  cameraTransition.fromPosition.copy(camera.position);
  cameraTransition.fromTarget.copy(controls.target);

  const planetPosition = new THREE.Vector3();
  selectedPlanet.mesh.getWorldPosition(planetPosition);

  if (newFocus !== "SolarSystem") {
    const cameraDistance = minDistance * 1.5;
    cameraTransition.toPosition.set(
      planetPosition.x + cameraDistance,
      planetPosition.y + cameraDistance / 2,
      planetPosition.z + cameraDistance
    );
    cameraTransition.toTarget.copy(planetPosition);
  } else {
    cameraTransition.toPosition.copy(cameraPositions.solarSystem.position);
    cameraTransition.toTarget.copy(cameraPositions.solarSystem.target);
  }

  (document.querySelector(".caption p") as HTMLElement).innerHTML = newFocus;
  solarSystem[oldFocus].labels.hidePOI();
  solarSystem[newFocus].labels.showPOI();
};

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
camera.position.copy(cameraPositions.solarSystem.position);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enablePan = false;
controls.target.copy(cameraPositions.solarSystem.target);

const minDistance = 20;
controls.minDistance = minDistance;
controls.maxDistance = minDistance * 5;

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

const clock = new THREE.Clock();

// Variable para controlar la velocidad
let speedFactor = 1;

// Variable `elapsedTime` para rastrear el tiempo transcurrido
let elapsedTime = 0;

// Generate travel options dynamically
const menuTravel = document.getElementById("menu-travel");
const generateTravelOptions = () => {
  const bodyList = Object.keys(solarSystem);

  bodyList.forEach((bodyName) => {
    const option = document.createElement("button");
    option.textContent = bodyName;
    option.className = "w-full text-left px-4 py-2 text-sm text-white focus:outline-none transition-transform duration-200 transform hover:text-black hover:scale-105"; // Hover: color y tamaño
    option.setAttribute("role", "menuitem");
    
    option.addEventListener("click", () => {
      changeFocus(options.focus, bodyName);
      options.focus = bodyName;

      // Show the planet information when selected from the travel menu
      showPlanetInfo(bodyName);

      menuTravel?.classList.add("hidden");
    });

    menuTravel?.appendChild(option);
  });
};

generateTravelOptions();

document.getElementById("btn-travel")?.addEventListener("click", () => {
  const menu = document.getElementById("menu-travel");
  menu?.classList.toggle("hidden");
});

document.getElementById("btn-sun")?.addEventListener("click", () => {
  if (options.focus !== "SolarSystem") {
    changeFocus(options.focus, "SolarSystem");
    options.focus = "SolarSystem";
  }
});

document.getElementById("btn-speed")?.addEventListener("click", () => {
  speedFactor = speedFactor >= 16 ? 1 : speedFactor * 2;
  options.speed = 0.125 * speedFactor;
  (document.getElementById("btn-speed") as HTMLElement).innerText = ` - x${speedFactor} - `;
});

//DESPLEGAR MENU DE OPCIONES PARA ELEGIR JUEGO
document.getElementById("btn-options")?.addEventListener("click", () => {
  const menuOptions = document.getElementById("menu-options");
  menuOptions?.classList.toggle("hidden");
});

document.getElementById("game-1")?.addEventListener("click", () => {
  console.log("Opción 1 seleccionada");
  // INSERTAR LOGICA GAME 1
});

document.getElementById("game-2")?.addEventListener("click", () => {
  console.log("Opción 2 seleccionada");
  // INSERTAR LOGICA GAME 2
});

(function tick() {
  const deltaTime = clock.getDelta();
  elapsedTime += deltaTime * options.speed;

  for (const object of Object.values(solarSystem)) {
    object.tick(elapsedTime);
  }

  if (cameraTransition.inProgress) {
    cameraTransition.time += deltaTime;
    let t = cameraTransition.time / cameraTransition.duration;
    if (t >= 1) {
      t = 1;
      cameraTransition.inProgress = false;
    }

    camera.position.lerpVectors(
      cameraTransition.fromPosition,
      cameraTransition.toPosition,
      t
    );
    controls.target.lerpVectors(
      cameraTransition.fromTarget,
      cameraTransition.toTarget,
      t
    );
  } else if (focusedPlanet) {
    const minDistance = focusedPlanet.getMinDistance();
    const cameraDistance = minDistance * 1.5;

    const planetPosition = new THREE.Vector3();
    focusedPlanet.mesh.getWorldPosition(planetPosition);

    camera.position.set(
      planetPosition.x + cameraDistance,
      planetPosition.y + cameraDistance / 2,
      planetPosition.z + cameraDistance
    );

    controls.target.copy(planetPosition);
  }

  controls.update();
  const currentBody = solarSystem[options.focus];
  currentBody.labels.update(camera);

  bloomComposer.render();
  labelRenderer.render(scene, camera);

  window.requestAnimationFrame(tick);
})();

exp