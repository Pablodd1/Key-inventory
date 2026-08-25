import type { VercelRequest, VercelResponse } from '@vercel/node';

// Límite de peticiones en memoria por instancia cálida (mejor esfuerzo).
// En serverless cada instancia reinicia su contador; esto frena abusos
// ligeros, no ataques dedicados.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 30;

const buckets = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(req: VercelRequest): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  if (Array.isArray(fwd) && fwd.length > 0) return String(fwd[0]);
  return req.socket?.remoteAddress || 'unknown';
}

export function rateLimit(req: VercelRequest, name: string, maxRequests = MAX_REQUESTS): boolean {
  const key = `${name}:${getClientIp(req)}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  bucket.count += 1;
  // Limpieza ocasional para no acumular memoria
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) {
      if (now >= b.resetAt) buckets.delete(k);
    }
  }
  return bucket.count <= maxRequests;
}
