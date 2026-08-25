import type { AppData, Client, DiagnosticRecord, InventoryItem } from './types';

export const STORAGE_KEYS = {
  clients: 'miami_autokey_clients',
  inventory: 'miami_autokey_inventory',
  history: 'miami_autokey_history',
  revenue: 'miami_autokey_revenue',
  activeClient: 'miami_autokey_active_client',
  diagnosisDraft: 'miami_autokey_diagnosis_draft',
} as const;

function isRecordArray(v: unknown): boolean {
  return Array.isArray(v) && v.every(item => item !== null && typeof item === 'object');
}

export function loadJson<T>(key: string, fallback: T, validate?: (v: unknown) => boolean): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed: unknown = JSON.parse(saved);
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Guarda un valor en localStorage. Devuelve false si la escritura falla
 * (p. ej. cuota excedida por fotos) para que la UI pueda avisar al usuario.
 */
export function saveJson(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error(`Storage sync error (${key}):`, e);
    return false;
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error(`Storage remove error (${key}):`, e);
  }
}

// Validadores de esquema básico para datos leídos de localStorage.
export const isValidClientList = (v: unknown): boolean => isRecordArray(v);
export const isValidInventoryList = (v: unknown): boolean =>
  isRecordArray(v) && (v as InventoryItem[]).every(i => typeof i.stock === 'number' && typeof i.price === 'number');
export const isValidHistoryList = (v: unknown): boolean => isRecordArray(v);
export const isValidRevenue = (v: unknown): boolean => typeof v === 'number' && isFinite(v) && v >= 0;

export function loadAppDefaults(): Pick<AppData, 'clients' | 'inventory' | 'history' | 'revenue'> {
  return {
    clients: loadJson<Client[]>(STORAGE_KEYS.clients, [], isValidClientList),
    inventory: loadJson<InventoryItem[]>(STORAGE_KEYS.inventory, [], isValidInventoryList),
    history: loadJson<DiagnosticRecord[]>(STORAGE_KEYS.history, [], isValidHistoryList),
    revenue: loadJson<number>(STORAGE_KEYS.revenue, 0, isValidRevenue),
  };
}
