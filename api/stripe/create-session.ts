import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { rateLimit } from '../../server/ratelimit';

// Crea una Stripe Checkout Session para cobrar un servicio en campo.
// Client: POST /api/stripe/create-session { amountCents: number, description: string }

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
  if (!rateLimit(req, 'stripe-create')) {
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
