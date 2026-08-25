import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Verifica del lado del servidor el estado de una Checkout Session
// después del redirect de vuelta a la app.
// Client: POST /api/stripe/verify { sessionId: string }
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
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }
  if (!rateLimit(req, 'stripe-verify')) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(503).json({ error: 'Server misconfigured: STRIPE_SECRET_KEY not set' });
  }

  const { sessionId } = req.body ?? {};
  if (typeof sessionId !== 'string' || !/^cs_(test_)?[A-Za-z0-9]{10,}$/.test(sessionId)) {
    return res.status(400).json({ error: 'sessionId inválido' });
  }

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return res.status(200).json({
      paid: session.payment_status === 'paid',
      amountTotal: session.amount_total ?? undefined,
      currency: session.currency ?? undefined,
    });
  } catch (err: any) {
    console.error('[api/stripe/verify] error', err?.message);
    return res.status(500).json({ error: (err?.message || 'Stripe request failed').slice(0, 500) });
  }
}
