import { describe, it, expect } from 'vitest';
import { createDemoData } from './demo';
import { deriveAnalytics } from './domain';

const NOW = new Date('2026-08-25T15:00:00').getTime();

describe('Datos de demostración', () => {
  const demo = createDemoData(NOW);

  it('incluye clientes, inventario e historial no vacíos', () => {
    expect(demo.clients.length).toBeGreaterThanOrEqual(8);
    expect(demo.inventory.length).toBeGreaterThanOrEqual(10);
    expect(demo.history.length).toBeGreaterThanOrEqual(14);
  });

  it('tiene ítems con stock bajo para disparar las alertas', () => {
    expect(demo.inventory.filter(i => i.stock < 3).length).toBeGreaterThanOrEqual(3);
  });

  it('distribuye los servicios en los últimos 7 días (para los gráficos)', () => {
    const week = demo.history.filter(r => typeof r.timestampMs === 'number' && r.timestampMs > NOW - 7 * 86_400_000 && r.timestampMs <= NOW);
    expect(week.length).toBe(demo.history.length);
  });

  it('usa los tres métodos de pago y estados variados', () => {
    const methods = new Set(demo.history.map(r => r.paymentMethod));
    expect(methods.has('efectivo')).toBe(true);
    expect(methods.has('zelle')).toBe(true);
    expect(methods.has('tarjeta')).toBe(true);
    expect(demo.history.some(r => r.status !== 'ÉXITO')).toBe(true);
  });

  it('la ganancia es consistente: servicios + ventas de inventario', () => {
    const servicesTotal = demo.history.reduce((sum, r) => sum + (r.amount ?? 0), 0);
    expect(demo.revenue).toBeGreaterThan(servicesTotal); // incluye venta de repuestos
  });

  it('alimenta las analíticas con datos reales', () => {
    const analytics = deriveAnalytics(demo.history, demo.revenue);
    expect(analytics.totalServices).toBe(demo.history.length);
    expect(analytics.totalRevenue).toBeGreaterThan(0);
    expect(analytics.weekly.some(d => d.servicios > 0)).toBe(true);
    expect(analytics.categories.length).toBeGreaterThan(1);
  });
});
