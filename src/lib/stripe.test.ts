import { describe, it, expect, vi, afterEach } from 'vitest';
import { createCheckoutSession, isCardPaymentEnabled, parsePaymentReturn } from './stripe';

function stubFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('Cliente de Stripe', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('crea una sesión de checkout con el monto en centavos', async () => {
    const fetchMock = stubFetch(200, { url: 'https://checkout.stripe.com/c/pay/cs_test_123', sessionId: 'cs_test_123' });
    vi.stubGlobal('fetch', fetchMock);

    const session = await createCheckoutSession(150, 'Servicio Honda Civic');
    expect(session.url).toContain('checkout.stripe.com');
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.amountCents).toBe(15000);
  });

  it('reporta "no configurado" cuando falta STRIPE_SECRET_KEY', async () => {
    vi.stubGlobal('fetch', stubFetch(503, { error: 'Server misconfigured: STRIPE_SECRET_KEY not set' }));
    const err = await createCheckoutSession(150, 'x').catch(e => e);
    expect(err.notConfigured).toBe(true);
    expect(err.message).toMatch(/no configurados en el servidor/);
  });

  it('rechaza montos menores a $1.00 sin llamar al servidor', async () => {
    const fetchMock = stubFetch(200, {});
    vi.stubGlobal('fetch', fetchMock);
    await expect(createCheckoutSession(0.5, 'x')).rejects.toThrow(/monto mínimo/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('detecta si los pagos con tarjeta están habilitados', async () => {
    vi.stubGlobal('fetch', stubFetch(200, { cardPaymentsEnabled: true }));
    expect(await isCardPaymentEnabled()).toBe(true);
  });

  it('interpreta el retorno de Stripe Checkout', () => {
    expect(parsePaymentReturn('?payment=success&session_id=cs_test_abc')).toEqual({
      status: 'success',
      sessionId: 'cs_test_abc',
    });
    expect(parsePaymentReturn('?payment=cancel')).toEqual({ status: 'cancel' });
    expect(parsePaymentReturn('')).toEqual({ status: null });
    expect(parsePaymentReturn('?otra=cosa')).toEqual({ status: null });
  });
});
