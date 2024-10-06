// List of prompts to display while loading textures.
const loadingPrompts = [
  "Detecting neutrinos",
  "Forming event horizons",
  "Annihilating particles",
  "Tunneling electrons",
  "Entangling photons",
  "Collapsing wavefunctions",
  "Quantising gravity",
  "Evaporating black holes",
  "Increasing entropy",
];

// Switch loading screen text every 2 seconds.
const switchLoadText = setInterval(() => {
  const index = Math.floor(Math.random() * loadingPrompts.length);
  const loadText = document.getElementById("loader-text") as HTMLDivElement;

  // Check if the loader text element exists before modifying it
  if (loadText) {
    loadText.textContent = `${loadingPrompts[index]}...`;
  } else {
    console.error("Loader text element not found.");
  }
}, 2000);

/**
 * Updates the loading screen once textures are loaded.
 */
export const onLoaded = () => {
  clearInterval(switchLoadText);  // Stop switching loading text

  const loadText = document.getElementById("loader-text") as HTMLDivElement;
  if (loadText) {
    loadText.textContent = "Click to continue...";
  } else {
    console.error("Loader text element not found.");
  }

  const loadIcon = document.getElementById("loader-circle") as HTMLDivElement;
  if (loadIcon) {
    const svg = loadIcon.children[0] as HTMLElement;
    if (svg) {
      svg.style.animation = "none";
    } else {
      console.error("SVG element inside loader icon not found.");
    }
  } else {
    console.error("Loader circle element not found.");
  }

  const loadContainer = document.getElementById("loading") as HTMLDivElement;
  if (loadContainer) {
    loadContainer.style.cursor = "pointer";
    
    loadContainer.addEventListener("click", () => {
      loadContainer.style.pointerEvents = "none";
      const animation = loadContainer.animate(
        { opacity: [1, 0], transform: ["scale(1)", "scale(0.75)"] },
        {
          duration: 750,
          easing: "ease",
          fill: "forwards",
        }
      );

      animation.onfinish = () => {
        loadContainer.style.display = "none";
      };
    });
  } else {
    console.error("Loading container element not found.");
  }
};
