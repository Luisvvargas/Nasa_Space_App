export interface Pregunta {
    pregunta: string;
    respuesta: string;
    distractores: string[];
    imagen?: string;
  }
  export const baseDePreguntas: Pregunta[] = [
    {
      pregunta: "Which planet is known as Earth's twin?",
      respuesta: "Venus",
      distractores: ["Mars", "The Moon", "Saturn"],
      imagen:
        "https://i.pinimg.com/originals/1e/0f/d9/1e0fd9c60f28a7f72b839f88fa8e55bf.jpg",
    },
    {
      pregunta: "Which is the planet farthest from the Sun?",
      respuesta: "Neptune",
      distractores: ["Saturn", "Uranus", "Pluto"],
      imagen: "https://art.pixilart.com/29f65ef751ba86d.png",
    },
    {
      pregunta: "Which is the largest planet in our solar system?",
      respuesta: "Jupiter",
      distractores: ["Saturn", "Earth", "Neptune"],
      imagen:
        "https://png.pngtree.com/png-clipart/20231002/original/pngtree-pixel-art-fictional-planet-png-image_13061336.png",
    },
    {
      pregunta: "Which is the closest planet to the Sun?",
      respuesta: "Mercury",
      distractores: ["Venus", "Mars", "Earth"],
      imagen:
        "https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/391aa854-ba50-427b-a8ab-68392d1af18f/dbzojaq-02e3812f-2a73-4c2d-8026-3fc200d8f752.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzM5MWFhODU0LWJhNTAtNDI3Yi1hOGFiLTY4MzkyZDFhZjE4ZlwvZGJ6b2phcS0wMmUzODEyZi0yYTczLTRjMmQtODAyNi0zZmMyMDBkOGY3NTIucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.X61jocVut5DoKecM3cBE6v5EZtj15250qDI_84nwGlM",
    },
    {
      pregunta: "Which planet is known as the 'Red Planet'?",
      respuesta: "Mars",
      distractores: ["Venus", "Jupiter", "Mercury"],
      imagen:
        "https://static.vecteezy.com/system/resources/previews/013/519/073/original/pixel-art-fictional-planet-png.png",
    },
    {
      pregunta: "What is the name of Earth's natural satellite?",
      respuesta: "The Moon",
      distractores: ["Phobos", "Europa", "Io"],
      imagen:
        "https://static.vecteezy.com/system/resources/previews/021/831/075/non_2x/moon-pixel-art-icon-yellow-and-grey-pixelated-moon-design-for-logo-web-mobile-app-badges-and-patches-video-game-sprite-8-bit-isolated-illustration-vector.jpg",
    },
    {
      pregunta: "Which planet is famous for its rings?",
      respuesta: "Saturn",
      distractores: ["Uranus", "Neptune", "Jupiter"],
      imagen:
        "https://i.pinimg.com/originals/05/ff/37/05ff373d98937e98e093437b358164ef.png",
    },
    {
      pregunta: "Which planet is known for having the most moons?",
      respuesta: "Jupiter",
      distractores: ["Neptune", "Saturn", "Uranus"],
      imagen:
        "https://static.vecteezy.com/system/resources/thumbnails/013/519/074/small/pixel-art-fictional-planet-png.png",
    },
    {
      pregunta: "Which is the hottest planet in the solar system?",
      respuesta: "Venus",
      distractores: ["Mercury", "Earth", "The Sun"],
      imagen:
        "https://us.123rf.com/450wm/robuart/robuart1908/robuart190801977/129043541-planeta-de-vector-de-forma-redondeada-cuerpo-celeste-aislado-con-manchas-gr%C3%A1ficos-de-juegos-de.jpg",
    },
    {
      pregunta: "Which is the second largest planet in the solar system?",
      respuesta: "Saturn",
      distractores: ["Neptune", "Uranus", "Jupiter"],
      imagen:
        "https://i.pinimg.com/originals/1e/0f/d9/1e0fd9c60f28a7f72b839f88fa8e55bf.jpg",
    },
  ];
  