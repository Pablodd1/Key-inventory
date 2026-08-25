import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateId,
  validateClientInput,
  validateInventoryItem,
  processItemSale,
  processSupplierRestock,
  appendQuickNote,
  matchPresetByBrand,
  buildHistoryCsv,
  classifyService,
  deriveAnalytics,
} from './domain';
import { PRESET_CAR_MODELS } from '../data/presets';
import type { DiagnosticRecord } from './types';

describe('Validación de entrada', () => {
  it('rechaza registros de cliente vacíos con errores en español', () => {
    const result = validateClientInput({});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('El nombre es obligatorio');
    expect(result.errors).toContain('El apellido es obligatorio');
    expect(result.errors).toContain('El vehículo (año/marca/modelo) es obligatorio');
  });

  it('acepta un cliente válido con teléfono bien formado', () => {
    const result = validateClientInput({
      firstName: 'Carlos',
      lastName: 'Mendez',
      carInfo: '2018 Honda Civic',
      phone: '305-555-0199',
    });
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it('rechaza teléfonos con letras o demasiado cortos', () => {
    expect(validateClientInput({ firstName: 'A', lastName: 'B', carInfo: 'C', phone: 'abc' }).isValid).toBe(false);
    expect(validateClientInput({ firstName: 'A', lastName: 'B', carInfo: 'C', phone: '123' }).isValid).toBe(false);
  });

  it('rechaza stock negativo y precio cero en inventario', () => {
    const invalid = validateInventoryItem({ name: 'Key FOB', stock: -5, price: 0 });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.length).toBe(2);

    const valid = validateInventoryItem({ name: 'Ford H84 Key', stock: 10, price: 55 });
    expect(valid.isValid).toBe(true);
  });
});

describe('Operaciones de inventario', () => {
  let sampleInventory: ReturnType<typeof processItemSale> extends never ? never : any;

  beforeEach(() => {
    sampleInventory = [
      { id: '1', name: 'Toyota Corolla 98-05', type: 'LLAVE TRANSPONDER', stock: 12, price: 65, barcode: '123' },
      { id: '2', name: 'Honda Civic 01-10', type: 'CONTROL FOB (3B)', stock: 2, price: 85, barcode: '456' },
      { id: '3', name: 'Nissan Sentra 00-12', type: 'CHIP ID46', stock: 1, price: 45, barcode: '789' },
    ];
  });

  it('descuenta stock al vender un ítem', () => {
    const { updatedInventory, soldItem } = processItemSale(sampleInventory, '2');
    expect(soldItem).not.toBeNull();
    expect(soldItem?.name).toBe('Honda Civic 01-10');
    expect(updatedInventory.find(i => i.id === '2')?.stock).toBe(1);
  });

  it('impide vender cuando el stock es cero', () => {
    const depleted = [{ id: '99', name: 'Chip ID48', type: 'CHIP', stock: 0, price: 40, barcode: '999' }];
    const { updatedInventory, soldItem } = processItemSale(depleted, '99');
    expect(soldItem).toBeNull();
    expect(updatedInventory[0].stock).toBe(0);
  });

  it('aplica cantidades de reposición mayorista correctamente', () => {
    const restocked = processSupplierRestock(sampleInventory, [
      { itemId: '2', quantity: 15 },
      { itemId: '3', quantity: 20 },
    ]);
    expect(restocked.find(i => i.id === '2')?.stock).toBe(17);
    expect(restocked.find(i => i.id === '3')?.stock).toBe(21);
    expect(restocked.find(i => i.id === '1')?.stock).toBe(12);
  });
});

describe('Notas del técnico y comandos de voz', () => {
  it('agrega etiquetas rápidas sin sobrescribir notas existentes', () => {
    expect(appendQuickNote('Cilindro puerta oxidado', 'Corte Lishi HU66')).toBe(
      'Cilindro puerta oxidado • Corte Lishi HU66'
    );
    expect(appendQuickNote(undefined, 'Chip ID48 Virgen')).toBe('Chip ID48 Virgen');
  });

  it('encuentra la ficha de Toyota por voz sin depender del año hardcodeado', () => {
    // Regresión: antes se buscaba '2003 TOYOTA COROLLA' y la ficha real es del 2005
    const preset = matchPresetByBrand('toyota corolla por favor', PRESET_CAR_MODELS);
    expect(preset?.model).toBe('2005 TOYOTA COROLLA');
  });

  it('reconoce todas las marcas soportadas y rechaza texto sin marca', () => {
    expect(matchPresetByBrand('quiero un honda', PRESET_CAR_MODELS)?.model).toBe('2010 HONDA CIVIC');
    expect(matchPresetByBrand('camioneta ford', PRESET_CAR_MODELS)?.model).toBe('2008 FORD F-150');
    expect(matchPresetByBrand('un vw jetta', PRESET_CAR_MODELS)?.model).toBe('2014 VOLKSWAGEN JETTA');
    expect(matchPresetByBrand('buenos días', PRESET_CAR_MODELS)).toBeNull();
  });
});

describe('Identificadores', () => {
  it('genera IDs únicos incluso en el mismo milisegundo', () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateId()));
    expect(ids.size).toBe(500);
  });
});

describe('Exportación CSV', () => {
  it('escapa comillas en todos los campos', () => {
    const csv = buildHistoryCsv([
      {
        id: 'a1',
        date: '25/08/2026',
        client: 'JUAN "EL LOCO" PEREZ',
        car: '2005 TOYOTA COROLLA',
        issue: 'Llave "perdida"',
        aiDiagnosis: 'OK',
        status: 'ÉXITO',
        amount: 150,
        paymentMethod: 'efectivo',
      },
    ]);
    const line = csv.split('\n')[1];
    expect(line).toContain('"JUAN ""EL LOCO"" PEREZ"');
    expect(line).toContain('"Llave ""perdida"""');
    expect(csv.split('\n')[0]).toContain('Monto,MetodoPago');
    expect(line).toContain('"150.00","efectivo"');
  });
});

describe('Analíticas derivadas del historial', () => {
  const today = Date.now();
  const record = (overrides: Partial<DiagnosticRecord>): DiagnosticRecord => ({
    id: 'r',
    date: 'x',
    client: 'C',
    car: 'CAR',
    issue: 'ISSUE',
    aiDiagnosis: 'DIAG',
    status: 'ÉXITO',
    ...overrides,
  });

  it('calcula totales, ticket promedio y bucket semanal', () => {
    const history = [
      record({ id: '1', timestampMs: today, amount: 100 }),
      record({ id: '2', timestampMs: today - 86_400_000, amount: 200 }),
      record({ id: '3', timestampMs: today, amount: 50, issue: 'APERTURA LISHI LOCKOUT' }),
    ];
    const analytics = deriveAnalytics(history, 0);
    expect(analytics.totalServices).toBe(3);
    expect(analytics.totalRevenue).toBe(350);
    expect(analytics.avgTicket).toBeCloseTo(116.67, 1);
    const todayBucket = analytics.weekly[analytics.weekly.length - 1];
    expect(todayBucket.servicios).toBe(2);
    expect(todayBucket.ingresos).toBe(150);
  });

  it('clasifica servicios por palabras clave', () => {
    expect(classifyService({ issue: 'LLAVE PERDIDA TOTAL', aiDiagnosis: '' })).toBe('Pérdida Total de Llave');
    expect(classifyService({ issue: 'CONTROL FOB DESCONFIGURADO', aiDiagnosis: '' })).toBe('Control / FOB');
    expect(classifyService({ issue: 'APERTURA GANZÚA LISHI', aiDiagnosis: '' })).toBe('Apertura / Lockout');
    expect(classifyService({ issue: 'cosita rara', aiDiagnosis: '' })).toBe('Otro');
  });

  it('devuelve estado vacío utilizable sin datos', () => {
    const analytics = deriveAnalytics([], 0);
    expect(analytics.totalServices).toBe(0);
    expect(analytics.topCategory).toBe('—');
    expect(analytics.weekly).toHaveLength(7);
  });
});
