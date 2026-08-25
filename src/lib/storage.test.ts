import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadJson, saveJson, removeKey, STORAGE_KEYS } from './storage';

// Stub mínimo de localStorage para el entorno Node de Vitest
class MemoryStorage {
  private map = new Map<string, string>();
  getItem(k: string) { return this.map.get(k) ?? null; }
  setItem(k: string, v: string) { this.map.set(k, v); }
  removeItem(k: string) { this.map.delete(k); }
  clear() { this.map.clear(); }
}

describe('Persistencia localStorage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
  });

  it('guarda y recupera datos JSON', () => {
    expect(saveJson(STORAGE_KEYS.revenue, 250.75)).toBe(true);
    expect(loadJson<number>(STORAGE_KEYS.revenue, 0)).toBe(250.75);
  });

  it('devuelve el valor por defecto si no hay datos', () => {
    expect(loadJson(STORAGE_KEYS.history, [])).toEqual([]);
  });

  it('devuelve el valor por defecto si el JSON está corrupto', () => {
    localStorage.setItem(STORAGE_KEYS.clients, '{corrupto');
    expect(loadJson(STORAGE_KEYS.clients, [])).toEqual([]);
  });

  it('devuelve el valor por defecto si falla la validación de esquema', () => {
    localStorage.setItem(STORAGE_KEYS.revenue, '"no-es-numero"');
    expect(loadJson(STORAGE_KEYS.revenue, 0, (v) => typeof v === 'number')).toBe(0);
  });

  it('reporta false cuando la escritura falla (cuota excedida)', () => {
    const failing = Object.assign(new MemoryStorage(), {
      setItem() { throw new Error('QuotaExceededError'); },
    });
    vi.stubGlobal('localStorage', failing);
    expect(saveJson(STORAGE_KEYS.history, [{ id: 'x' }])).toBe(false);
  });

  it('elimina claves sin lanzar errores', () => {
    localStorage.setItem(STORAGE_KEYS.activeClient, '{}');
    removeKey(STORAGE_KEYS.activeClient);
    expect(localStorage.getItem(STORAGE_KEYS.activeClient)).toBeNull();
  });
});
