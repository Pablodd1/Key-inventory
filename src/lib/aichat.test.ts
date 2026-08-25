import { describe, it, expect, vi, afterEach } from 'vitest';
import { askAssistant, buildChatSystemPrompt } from './aichat';

function stubFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('Asistente IA de consultas (chat)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('incluye el prompt de sistema y el historial multi-turno', async () => {
    const fetchMock = stubFetch(200, { text: 'El OBD2 está tras la guantera.' });
    vi.stubGlobal('fetch', fetchMock);

    const answer = await askAssistant({
      history: [
        { role: 'user', text: '¿qué chip usa un Sentra 2012?' },
        { role: 'model', text: 'ID46 (PCF7936).' },
      ],
      question: '¿y dónde está el OBD2?',
    });

    expect(answer).toBe('El OBD2 está tras la guantera.');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.prompt).toContain('PREGUNTA DEL TÉCNICO');
    expect(body.prompt).toContain('¿y dónde está el OBD2?');
    expect(body.history).toHaveLength(2);
    expect(body.history[0]).toEqual({ role: 'user', parts: [{ text: '¿qué chip usa un Sentra 2012?' }] });
  });

  it('adjunta la foto como base64 sin prefijo data URL', async () => {
    const fetchMock = stubFetch(200, { text: 'Es una espada HU66.' });
    vi.stubGlobal('fetch', fetchMock);
    await askAssistant({ history: [], question: '¿qué llave es?', imageBase64: 'xyz789' });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.imageBase64).toBe('xyz789');
  });

  it('propaga el aviso claro cuando falta GEMINI_API_KEY', async () => {
    vi.stubGlobal('fetch', stubFetch(500, { error: 'Server misconfigured: GEMINI_API_KEY not set' }));
    const err = await askAssistant({ history: [], question: 'x' }).catch(e => e);
    expect(err.message).toMatch(/IA no está configurada/);
  });

  it('el prompt de sistema define al experto cerrajero en español', () => {
    const prompt = buildChatSystemPrompt();
    expect(prompt).toContain('cerrajería automotriz');
    expect(prompt).toContain('ESPAÑOL');
  });
});
