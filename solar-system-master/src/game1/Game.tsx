import React, { useEffect, useState } from "react";
import {
  cargarPregunta,
  INDEX_PREGUNTA,
  seleccionarOpcion,
  vidas,
} from "./Logica";
import { Pregunta } from "./Preguntas"; // Importando el tipo Pregunta

function Game() {
  const [opciones, setOpciones] = useState<string[]>([]);
  const [preguntaActual, setPreguntaActual] = useState<Pregunta | null>(null);
  const [mostrarExplosion, setMostrarExplosion] = useState<boolean>(false); // Estado para mostrar la explosión

  useEffect(() => {
    loadQuestion(INDEX_PREGUNTA); // Cargar la primera pregunta al montar el componente
  }, []);

  const loadQuestion = async (index: number) => {
    try {
      const data = await cargarPregunta(index);
      setPreguntaActual(data.objetoPregunta);
      setOpciones(data.opciones);
    } catch (error) {
      console.error("Error loading question:", error);
    }
  };

  const manejarError = () => {
    console.log("Errorrr"); // El asteroide se acerca 10 unidades más con cada error
  };

  return (
    <div
      id="tablero-de-juego"
      className="relative flex flex-col justify-center items-center min-h-screen bg-steelblue bg-cover bg-center"
      style={{
        backgroundImage: `url('https://www.shutterstock.com/shutterstock/videos/1100561631/thumb/1.jpg?ip=x480')`, // Reemplaza con la ruta correcta de la imagen
      }}
    >
      <div
        id="encabezado"
        className="w-[80vw] min-h-[200px] flex flex-col justify-center items-center text-2xl font-bold text-white rounded-lg m-2 p-2 transition-all duration-250"
      >
        <p id="pregunta" className="text-xl mb-4">
          {preguntaActual ? preguntaActual.pregunta : "Loading..."}
        </p>
        <img
          id="imagen"
          src={preguntaActual?.imagen}
          alt="Pregunta"
          className="w-auto h-[200px] object-contain mb-4"
        />
      </div>

      {opciones.map((opcion, index) => (
        <div
          key={index}
          id={`opcion-${index + 1}`}
          className="font-bold text-white text-2xl opcion text-center w-[70vw]  rounded-lg border opacity-80 border-gray-300 m-2 p-2 cursor-pointer transition-all duration-250 hover:bg-lightgray"
          onClick={() => {
            if (preguntaActual) {
              const correcta = seleccionarOpcion(
                index,
                opciones,
                preguntaActual,
                loadQuestion
              );
              if (!correcta) manejarError();

              console.log(vidas);
              const asteroideElement = document.getElementById("asteroide");

              if (vidas === 4 && asteroideElement) {
                asteroideElement.style.left = "15%";
              } else if (vidas === 3 && asteroideElement) {
                asteroideElement.style.left = "38%";
              } else if (vidas === 2 && asteroideElement) {
                asteroideElement.style.left = "58%";
              } else if (vidas === 1 && asteroideElement) {
                asteroideElement.style.left = "68%";
              } else if (vidas === 0) {
                // Cuando las vidas llegan a 0, muestra la explosión
                setMostrarExplosion(true);
                if (asteroideElement) {
                  asteroideElement.style.opacity = "0%";
                }
                setTimeout(() => {
                  setMostrarExplosion(false); // Oculta la explosión después de 2 segundos
                }, 2000);
              }
            }
          }}
        >
          {opcion}
        </div>
      ))}

      <div className="w-[80vw] min-h-[200px] flex flex-col justify-center items-center rounded-lg m-2 p-2 transition-all duration-250">
        {/* Asteroide */}
        <img
          src="src/assets/asteroid.png" // Reemplaza con la ruta correcta de la imagen del asteroide
          alt="Asteroide"
          id="asteroide"
          className="absolute left-48 w-20 h-20 flex float-right"
        />

        {/* Tierra */}
        <img
          src="src/assets/earth.png"
          alt="Tierra"
          className="absolute right-28 w-40 h-40 flex float-right"
        />

        {/* Explosion (condicional) */}
        {mostrarExplosion && (
          <img
            src="src/assets/explosion.png" // Reemplaza con la ruta de tu imagen de explosión
            alt="Explosion"
            className="absolute w-32 h-32" // Tamaño de la explosión
            style={{
              left: "80%", // La misma posición que el asteroide
              top: "77%", // Ajusta esta posición según tu diseño
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Game;
