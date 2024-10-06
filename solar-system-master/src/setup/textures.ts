import * as THREE from "three";
import { onLoaded } from "./loading";

let textureCount = 0;
let texturesLoaded = 0;
const textureLoader = new THREE.TextureLoader();

/**
 * Loads a texture and updates the loader's percentage display.
 * @param path - Path to the texture file.
 * @returns - Loaded texture.
 */
export const loadTexture = (path: string) => {
  return textureLoader.load(path, () => {
    texturesLoaded++;

    const percentageContainer = document.getElementById("loader-percentage") as HTMLElement;
    
    // Check if the percentage container exists before modifying it
    if (percentageContainer) {
      percentageContainer.textContent = getProgress();
    } else {
      console.error("Loader percentage element not found.");
    }

    if (texturesLoaded === textureCount) {
      onLoaded();
    }
  });
};

/**
 * Sets the total number of textures to be loaded.
 * @param n - Number of textures.
 */
export const setTextureCount = (n: number) => {
  textureCount = n;
};

/**
 * Returns the loading progress as a percentage.
 * @returns Progress percentage.
 */
const getProgress = (): string => {
  const percentage = (100 * texturesLoaded) / textureCount;
  return `${percentage.toFixed(0)}%`;
};
