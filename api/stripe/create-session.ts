import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

// Crea una Stripe Checkout Session para cobrar un servicio en campo.
// Client: POST /api/stripe/create-session { amountCents: number, description: string }
// NOTA: sin imports relativos locales — el runtime ESM de las funciones no
// resuelve especificadores sin extensión y @vercel/node no los empaqueta.

const MIN_CENTS = 100; // $1.00 USD
const MAX_CENTS = 500_000; // $5,000 USD

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

const MIN_CENTS = 100; // $1.00 USD
const MAX_CENTS = 500_000; // $5,000 USD

function getBaseUrl(req: VercelRequest): string {
  const envUrl = process.env.APP_URL;
  if (envUrl) return envUrl.replace(/\/+$/, '');
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] || (String(host).includes('localhost') ? 'http' : 'https');
  return `${Array.isArray(proto) ? proto[0] : proto}://${Array.isArray(host) ? host[0] : host}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed, use POST' });
  }
  if (!rateLimit(req)) {
    return res.status(429).json({ error: 'Demasiadas solicitudes, intente en un momento' });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return res.status(503).json({ error: 'Server misconfigured: STRIPE_SECRET_KEY not set' });
  }

  const { amountCents, description } = req.body ?? {};
  if (typeof amountCents !== 'number' || !Number.isInteger(amountCents) || amountCents < MIN_CENTS || amountCents > MAX_CENTS) {
    return res.status(400).json({ error: `Monto inválido (entre $${MIN_CENTS / 100} y $${MAX_CENTS / 100} USD)` });
  }

  const baseUrl = getBaseUrl(req);

  try {
    const stripe = new Stripe(secretKey);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      locale: 'es',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: 'Servicio de Cerrajería Automotriz Móvil',
              description: typeof description === 'string' && description.trim() ? description.trim() : 'Servicio en sitio',
            },
          },
        },
      ],
      success_url: `${baseUrl}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?payment=cancel`,
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('[api/stripe/create-session] error', err?.message);
    return res.status(500).json({ error: (err?.message || 'Stripe request failed').slice(0, 500) });
  }
}
