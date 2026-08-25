import { describe, it, expect } from 'vitest';
import { createBackup, serializeBackup, parseBackup, BackupError, BACKUP_VERSION } from './backup';
import type { AppData } from './types';

const sampleData: AppData = {
  clients: [
    { id: 'c1', firstName: 'ANA', lastName: 'GOMEZ', phone: '305-555-0199', email: '', carInfo: '2010 HONDA CIVIC', issue: 'FOB', timestamp: 'x' },
  ],
  inventory: [
    { id: 'i1', name: 'Chip ID46', type: 'CHIP', stock: 5, price: 45, barcode: '123' },
  ],
  history: [
    { id: 'h1', date: 'x', client: 'ANA GOMEZ', car: 'HONDA', issue: 'FOB', aiDiagnosis: 'OK', status: 'ÉXITO', amount: 150, paymentMethod: 'efectivo' },
  ],
  revenue: 150,
};

describe('Respaldo completo (backup)', () => {
  it('serializa y recupera los datos en un ciclo completo', () => {
    const json = serializeBackup(sampleData);
    const restored = parseBackup(json);
    expect(restored.app).toBe('miami-autokey');
    expect(restored.version).toBe(BACKUP_VERSION);
    expect(restored.data).toEqual(sampleData);
  });

  it('rechaza JSON inválido', () => {
    expect(() => parseBackup('no soy json')).toThrow(BackupError);
  });

  it('rechaza archivos de otra aplicación', () => {
    expect(() => parseBackup(JSON.stringify({ app: 'otra-cosa', version: 1, data: {} }))).toThrow(/no es un respaldo/);
  });

  it('rechaza versiones futuras no soportadas', () => {
    const env = createBackup(sampleData);
    expect(() => parseBackup(JSON.stringify({ ...env, version: BACKUP_VERSION + 1 }))).toThrow(/no soportada/);
  });

  it('rechaza datos corruptos (clientes no es lista)', () => {
    const env = createBackup(sampleData);
    const corrupt = { ...env, data: { ...env.data, clients: 'roto' } };
    expect(() => parseBackup(JSON.stringify(corrupt))).toThrow(/corruptos/);
  });
});
