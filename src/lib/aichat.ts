import { callGemini, GeminiError } from './gemini';

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface ChatSubmission {
  history: ChatTurn[];
  question: string;
  imageBase64?: string;
}

/**
 * Prompt de sistema para el asistente de preguntas y respuestas:
 * experto cerrajero automotriz, respuestas breves y accionables en campo.
 */
export function buildChatSystemPrompt(): string {
  return (
    'Eres un asistente experto en cerrajería automotriz (transponders, inmovilizadores, ' +
    'programación OBD2, aperturas Lishi, frecuencias RF) con 20 años de experiencia en EE.UU. ' +
    'Respondes en ESPAÑOL de forma BREVE y accionable (máx. 8 líneas), para un técnico que está ' +
    'trabajando en la calle con el vehículo frente a él. Incluye: chip/espada probable si aplica, ' +
    'herramienta recomendada, y precauciones. Si te falta información (año exacto, modelo), ' +
    'pregunta una sola cosa concreta antes de adivinar. Si la consulta no es de cerrajería ' +
    'automotriz, respóndelo en una línea y ofrece ayuda con el tema técnico.'
  );
}

/**
 * Envía una pregunta al asistente manteniendo el contexto de la conversación.
 * Lanza GeminiError con mensaje en español si el servicio falla o no está
 * configurado (falta GEMINI_API_KEY).
 */
export async function askAssistant({ history, question, imageBase64 }: ChatSubmission): Promise<string> {
  const geminiHistory = history.map(turn => ({
    role: turn.role,
    parts: [{ text: turn.text }],
  }));

  const prompt = `${buildChatSystemPrompt()}\n\n---\nPREGUNTA DEL TÉCNICO:\n${question}`;

  const response = await callGemini({
    prompt,
    imageBase64,
    mimeType: 'image/jpeg',
    history: geminiHistory,
  });

  return response.text;
}

export { GeminiError };
