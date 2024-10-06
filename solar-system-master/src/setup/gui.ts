import * as dat from "lil-gui";
import { SolarSystem } from "./solar-system";

export const options = {
  showPaths: true,
  showMoons: true,
  focus: "Sun",
  clock: true,
  speed: 0.125,
  zangle: 0,
  yangle: 0,
};

export const createGUI = (
  ambientLight: THREE.AmbientLight,
  solarSystem: SolarSystem,
  clock: THREE.Clock,
  camera: THREE.Camera
) => {
  const gui = new dat.GUI();

  // gui.title("");


  // Pause the simulation
  // gui
  //   .add(options, "clock")
  //   .name("Run")
  //   .onChange((value: boolean) => {
  //     value ? clock.start() : clock.stop();
  //   });

  // Control the simulation speed
  // gui.add(options, "speed", 0.1, 20, 0.1).name("Speed");
};
