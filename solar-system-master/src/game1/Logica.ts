import Swal from "sweetalert2";
import { baseDePreguntas, Pregunta } from "./Preguntas";

export let INDEX_PREGUNTA = 0;
export let puntaje = 0;
export let vidas = 4;

export async function cargarPregunta(index: number) {
  const objetoPregunta = baseDePreguntas[index];
  const opciones = [...objetoPregunta.distractores, objetoPregunta.respuesta];
  opciones.sort(() => Math.random() - 0.5);

  return { objetoPregunta, opciones }; // Return both the question and options
}

export async function seleccionarOpcion(
  index: number,
  opciones: string[],
  objetoPregunta: Pregunta,
  loadQuestion: (index: number) => void
) {
  const validezRespuesta = opciones[index] === objetoPregunta.respuesta;

  if (validezRespuesta) {
    await Swal.fire({
      title: "Correct Answer!",
      text: "Great!",
      icon: "success",
    });
    puntaje++;
  } else {
    vidas--;
    if (vidas === 0) {
      await Swal.fire({
        title: "Game Over",
        text: `Your Score: ${puntaje}/${baseDePreguntas.length}`,
        icon: "error",
      });
      resetGame(); // Reset game on loss of all lives
      return;
    }
    await Swal.fire({
      title: "Incorrect Answer",
      text: `The correct answer is ${objetoPregunta.respuesta}`,
      icon: "error",
    });
  }

  INDEX_PREGUNTA++;
  if (INDEX_PREGUNTA < baseDePreguntas.length) {
    loadQuestion(INDEX_PREGUNTA); // Load the next question
  } else {
    await Swal.fire({
      title: "Game Finished",
      text: `Your final score es: ${puntaje}/${baseDePreguntas.length}`,
      icon: "success",
    });
    resetGame(); // Reset game after completing all questions
  }
}

export function resetGame() {
  INDEX_PREGUNTA = 0;
  puntaje = 0;
  vidas = 4;
  loadNextQuestion(); // Load the first question after resetting
}

const loadNextQuestion = async () => {
  await cargarPregunta(INDEX_PREGUNTA);
};
