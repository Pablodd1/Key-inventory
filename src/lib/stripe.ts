export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface VerifySessionResponse {
  paid: boolean;
  amountTotal?: number;
  currency?: string;
  paymentMethod?: string;
}

export class StripeClientError extends Error {
  /** true cuando el servidor no tiene STRIPE_SECRET_KEY configurada */
  readonly notConfigured: boolean;
  constructor(message: string, notConfigured = false) {
    super(message);
    this.name = 'StripeClientError';
    this.notConfigured = notConfigured;
  }
}

async function postJson<T>(url: string, body: unknown): Promise<{ ok: boolean; status: number; data: T }> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new StripeClientError('No se pudo contactar el servidor de pagos. Verifique su conexión.');
  }
  let data: any = {};
  try {
    data = await res.json();
  } catch {
    // respuesta no-JSON
  }
  return { ok: res.ok, status: res.status, data };
}

export async function isCardPaymentEnabled(): Promise<boolean> {
  try {
    const res = await fetch('/api/stripe/config');
    if (!res.ok) return false;
    const data = await res.json();
    return data?.cardPaymentsEnabled === true;
  } catch {
    return false;
  }
}

export async function createCheckoutSession(amount: number, description: string): Promise<CheckoutSessionResponse> {
  const cents = Math.round(amount * 100);
  if (!isFinite(cents) || cents < 100) {
    throw new StripeClientError('El monto mínimo es $1.00 USD.');
  }
  const { ok, data } = await postJson<{ url?: string; sessionId?: string; error?: string }>('/api/stripe/create-session', {
    amountCents: cents,
    description: description.slice(0, 200),
  });
  if (!ok || !data.url) {
    const error = data.error || 'No se pudo iniciar el cobro';
    const notConfigured = /STRIPE_SECRET_KEY/i.test(error);
    throw new StripeClientError(
      notConfigured ? 'Pagos con tarjeta no configurados en el servidor (falta STRIPE_SECRET_KEY).' : `Error de pago: ${error}`,
      notConfigured
    );
  }
  return { url: data.url, sessionId: data.sessionId || '' };
}

export async function verifySession(sessionId: string): Promise<VerifySessionResponse> {
  const { ok, data } = await postJson<{ paid?: boolean; amountTotal?: number; currency?: string; error?: string }>(
    '/api/stripe/verify',
    { sessionId }
  );
  if (!ok) {
    throw new StripeClientError(data.error || 'No se pudo verificar el pago con el servidor.');
  }
  return {
    paid: data.paid === true,
    amountTotal: data.amountTotal,
    currency: data.currency,
  };
}

export interface PaymentReturn {
  status: 'success' | 'cancel' | null;
  sessionId?: string;
}

export function parsePaymentReturn(search: string): PaymentReturn {
  const params = new URLSearchParams(search);
  const payment = params.get('payment');
  if (payment === 'success') {
    return { status: 'success', sessionId: params.get('session_id') || undefined };
  }
  if (payment === 'cancel') {
    return { status: 'cancel' };
  }
  return { status: null };
}
