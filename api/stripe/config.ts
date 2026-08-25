import type { VercelRequest, VercelResponse } from '@vercel/node';
import { rateLimit } from '../_lib';

// Permite a la UI saber si los pagos con tarjeta están activos
// sin exponer ninguna clave.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed, use GET' });
  }
  if (!rateLimit(req, 'stripe-config')) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  return res.status(200).json({ cardPaymentsEnabled: Boolean(process.env.STRIPE_SECRET_KEY) });
}
