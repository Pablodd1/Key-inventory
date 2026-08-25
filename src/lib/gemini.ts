import type { Client } from './types';

export interface GeminiRequest {
  prompt: string;
  imageBase64?: string;
  mimeType?: string;
  history?: { role: string; parts: { text: string }[] }[];
}

export interface GeminiResponse {
  text: string;
  model: string;
}

export class GeminiError extends Error {
  /** true cuando el servidor no tiene GEMINI_API_KEY configurada */
  readonly notConfigured: boolean;
  constructor(message: string, notConfigured = false) {
    super(message);
    this.name = 'GeminiError';
    this.notConfigured = notConfigured;
  }
}

export async function callGemini(req: GeminiRequest): Promise<GeminiResponse> {
  let res: Response;
  try {
    res = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
  } catch {
    throw new GeminiError('No se pudo contactar el servidor de IA. Verifique su conexión.');
  }

  let body: { text?: string; model?: string; error?: string } = {};
  try {
    body = await res.json();
  } catch {
    // respuesta no-JSON (proxy, 502, etc.)
  }

  if (!res.ok) {
    const error = body.error || `Error ${res.status}`;
    const notConfigured = res.status === 500 && /GEMINI_API_KEY/i.test(error);
    throw new GeminiError(
      notConfigured
        ? 'La IA no está configurada en el servidor (falta GEMINI_API_KEY). Escriba el diagnóstico manualmente.'
        : `Error del servicio de IA: ${error}`,
      notConfigured
    );
  }

  if (!body.text) {
    throw new GeminiError('La IA devolvió una respuesta vacía. Intente de nuevo o escriba el diagnóstico manualmente.');
  }

  return { text: body.text, model: body.model || 'gemini' };
}

/**
 * Construye el prompt en español con el contexto del cliente activo
 * para el asistente de diagnóstico de cerrajería automotriz.
 */
export function buildDiagnosticPrompt(client: Client | null, hasImage: boolean): string {
  const contexto = client
    ? [
        `VEHÍCULO: ${client.carInfo || 'no especificado'}`,
        `FALLA REPORTADA: ${client.issue || 'no especificada'}`,
        `NOTAS DEL TÉCNICO: ${client.notes || 'ninguna'}`,
        `UBICACIÓN: ${client.location || 'no especificada'}`,
      ].join('\n')
    : 'Sin cliente activo (servicio de mostrador).';

  const imagen = hasImage
    ? '\nSe adjunta una FOTO de la llave / tablero / módulo capturada en sitio.'
    : '';

  return (
    `Eres un maestro cerrajero automotriz experto en Miami con 20 años de experiencia en transponders, ` +
    `inmovilizadores, programación OBD2 y aperturas Lishi.\n\n` +
    `CONTEXTO DEL SERVICIO:\n${contexto}${imagen}\n\n` +
    `Genera un DIAGNÓSTICO TÉCNICO en español, en formato de lista breve (máx. 8 líneas), que incluya:\n` +
    `1. Chip/transponder probable y perfil de espada requerido.\n` +
    `2. Herramienta recomendada (Lishi, KM100, IM608, VVDI, etc.).\n` +
    `3. Procedimiento paso a paso resumido para resolver en sitio.\n` +
    `4. Riesgos o precauciones especiales.\n` +
    `Responde SOLO con el diagnóstico, sin introducciones.`
  );
}
