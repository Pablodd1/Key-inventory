import { describe, it, expect, vi, afterEach } from 'vitest';
import { callGemini, buildDiagnosticPrompt, GeminiError } from './gemini';
import type { Client } from './types';

function stubFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('Cliente de Gemini (/api/gemini)', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('devuelve el texto del diagnóstico en éxito', async () => {
    const fetchMock = stubFetch(200, { text: 'CHIP ID4C REQUERIDO...', model: 'gemini-2.5-flash' });
    vi.stubGlobal('fetch', fetchMock);

    const result = await callGemini({ prompt: 'diagnostica' });
    expect(result.text).toBe('CHIP ID4C REQUERIDO...');
    expect(fetchMock).toHaveBeenCalledWith('/api/gemini', expect.objectContaining({ method: 'POST' }));
  });

  it('traduce el error de servidor sin GEMINI_API_KEY a "no configurada"', async () => {
    vi.stubGlobal('fetch', stubFetch(500, { error: 'Server misconfigured: GEMINI_API_KEY not set' }));
    const err = await callGemini({ prompt: 'x' }).catch(e => e);
    expect(err).toBeInstanceOf(GeminiError);
    expect(err.notConfigured).toBe(true);
    expect(err.message).toMatch(/IA no está configurada/);
  });

  it('envía la imagen como base64 sin el prefijo data URL', async () => {
    const fetchMock = stubFetch(200, { text: 'ok' });
    vi.stubGlobal('fetch', fetchMock);
    await callGemini({ prompt: 'x', imageBase64: 'abc123', mimeType: 'image/jpeg' });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.imageBase64).toBe('abc123');
    expect(body.mimeType).toBe('image/jpeg');
  });

  it('falla con mensaje claro ante error de red', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const err = await callGemini({ prompt: 'x' }).catch(e => e);
    expect(err.message).toMatch(/No se pudo contactar el servidor/);
  });

  it('construye el prompt con el contexto del cliente', () => {
    const client: Client = {
      id: 'c1', firstName: 'ANA', lastName: 'GOMEZ', phone: '', email: '',
      carInfo: '2012 NISSAN SENTRA', issue: 'NO ARRANCA', timestamp: 'x', notes: 'LUZ NATS',
    };
    const prompt = buildDiagnosticPrompt(client, true);
    expect(prompt).toContain('2012 NISSAN SENTRA');
    expect(prompt).toContain('NO ARRANCA');
    expect(prompt).toContain('FOTO');
  });
});
