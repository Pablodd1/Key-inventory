import type { VercelRequest, VercelResponse } from '@vercel/node';

// Permite a la UI saber si los pagos con tarjeta están activos
// sin exponer ninguna clave.
// NOTA: sin imports relativos locales — el runtime ESM de las funciones no
// resuelve especificadores sin extensión y @vercel/node no los empaqueta.

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
  return bucket.count <= MAX_REQUESTS;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed, use GET' });
  }
  if (!rateLimit(req)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  return res.status(200).json({ cardPaymentsEnabled: Boolean(process.env.STRIPE_SECRET_KEY) });
}
