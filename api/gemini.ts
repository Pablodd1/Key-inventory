import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// Serverless proxy to keep GEMINI_API_KEY server-side.
// Client: POST /api/gemini { prompt: string, imageBase64?: string, mimeType?: string, history?: {role:string, parts:{text:string}[]}[] }
// NOTA: sin imports relativos locales — el runtime ESM de las funciones no
// resuelve especificadores sin extensión y @vercel/node no los empaqueta.

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

// Rate limit en memoria por instancia cálida (mejor esfuerzo).
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;
const buckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(req: VercelRequest): boolean {
  const fwd = req.headers['x-forwarded-for'];
  const ip = (typeof fwd === 'string' && fwd.length > 0 ? fwd.split(',')[0].trim() : '') || 'unknown';
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  bucket.count += 1;
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (now >= b.resetAt) buckets.delete(k);
    }
  }
  return bucket.count <= MAX_REQUESTS;
}

interface ChatTurn {
  role: string;
  parts: { text: string }[];
}

function sanitizeHistory(history: unknown): ChatTurn[] {
  if (!Array.isArray(history)) return [];
  return history
    .filter(
      (turn): turn is ChatTurn =>
        turn !== null &&
        typeof turn === 'object' &&
        typeof (turn as any).role === 'string' &&
        Array.isArray((turn as any).parts)
    )
    .slice(-10) // solo las últimas 10 iteraciones para acotar costos
    .map(turn => ({
      role: turn.role === 'model' ? 'model' : 'user',
      parts: turn.parts
        .filter((p: any) => p && typeof p.text === 'string' && p.text.length > 0 && p.text.length <= 8000)
        .map((p: any) => ({ text: p.text })),
    }))
    .filter(turn => turn.parts.length > 0);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }
  if (!rateLimit(req)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: GEMINI_API_KEY not set' });
  }

  const { prompt, imageBase64, mimeType, history } = req.body ?? {};

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Missing required field: prompt (string)' });
  }

  // Basic abuse guardrail: limit prompt + image size
  if (prompt.length > 8000) {
    return res.status(400).json({ error: 'Prompt too long (max 8000 chars)' });
  }
  if (imageBase64 && imageBase64.length > 7_000_000) {
    return res.status(400).json({ error: 'Image too large (max ~5MB base64)' });
  }
  const mime = typeof mimeType === 'string' && ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())
    ? mimeType.toLowerCase()
    : 'image/jpeg';

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build contents: support optional vision input for blade/immobilizer inspection
    const parts: any[] = [{ text: prompt }];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: mime,
          data: imageBase64.replace(/^data:[^;]+;base64,/, ''),
        },
      });
    }

    const sanitizedHistory = sanitizeHistory(history);
    const contents = sanitizedHistory.length > 0
      ? [...sanitizedHistory, { role: 'user', parts }]
      : [{ role: 'user', parts }];

    const result = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: {
        // Keep field ops safe and concise
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    });

    const text = (result as any).text ?? (result as any).candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    return res.status(200).json({ text, model: MODEL });
  } catch (err: any) {
    console.error('[api/gemini] error', err);
    const message = err?.message || 'Gemini request failed';
    // Don't leak raw API key errors
    return res.status(500).json({ error: message.slice(0, 500) });
  }
}
