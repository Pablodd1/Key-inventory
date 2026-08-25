import type { CarPreset, Client, DiagnosticRecord, InventoryItem, PartUsage } from './types';

// ─── Identificadores ────────────────────────────────────────────────────────

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Validación de entrada (intake / inventario) ───────────────────────────

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateClientInput(data: Partial<Client>): ValidationResult {
  const errors: string[] = [];
  if (!data.firstName?.trim()) errors.push('El nombre es obligatorio');
  if (!data.lastName?.trim()) errors.push('El apellido es obligatorio');
  if (!data.carInfo?.trim()) errors.push('El vehículo (año/marca/modelo) es obligatorio');
  if (data.phone && !/^[0-9+\s\-()]{7,20}$/.test(data.phone.trim())) {
    errors.push('Formato de teléfono inválido (ej. 305-555-0199)');
  }
  return { isValid: errors.length === 0, errors };
}

export function validateInventoryItem(item: Partial<InventoryItem>): ValidationResult {
  const errors: string[] = [];
  if (!item.name?.trim()) errors.push('El nombre del ítem es obligatorio');
  if (typeof item.stock !== 'number' || isNaN(item.stock) || item.stock < 0) {
    errors.push('El stock debe ser un número no negativo');
  }
  if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
    errors.push('El precio debe ser mayor que cero');
  }
  return { isValid: errors.length === 0, errors };
}

// ─── Operaciones de inventario ──────────────────────────────────────────────

export function processItemSale(
  inventory: InventoryItem[],
  itemId: string
): { updatedInventory: InventoryItem[]; soldItem: InventoryItem | null } {
  let soldItem: InventoryItem | null = null;
  const updated = inventory.map(item => {
    if (item.id === itemId && item.stock > 0) {
      soldItem = { ...item };
      return { ...item, stock: item.stock - 1 };
    }
    return item;
  });
  return { updatedInventory: updated, soldItem };
}

export function processSupplierRestock(
  inventory: InventoryItem[],
  restockOrders: { itemId: string; quantity: number }[]
): InventoryItem[] {
  const restockMap = new Map(restockOrders.map(o => [o.itemId, o.quantity]));
  return inventory.map(item => {
    const qtyToAdd = restockMap.get(item.id) || 0;
    return qtyToAdd > 0 ? { ...item, stock: item.stock + qtyToAdd } : item;
  });
}

// ─── Piezas usadas en un servicio ───────────────────────────────────────────

/**
 * Normaliza la lista de piezas de un servicio: agrega duplicados, respeta
 * cantidades positivas y recorta al stock disponible.
 */
export function normalizePartUsage(parts: PartUsage[], inventory: InventoryItem[]): PartUsage[] {
  const byItem = new Map<string, PartUsage>();
  for (const part of parts) {
    if (!part.itemId || part.qty <= 0) continue;
    const existing = byItem.get(part.itemId);
    byItem.set(part.itemId, {
      itemId: part.itemId,
      name: part.name,
      qty: (existing?.qty ?? 0) + part.qty,
    });
  }
  const normalized: PartUsage[] = [];
  for (const part of byItem.values()) {
    const item = inventory.find(i => i.id === part.itemId);
    if (!item) continue; // el ítem fue borrado/desconocido
    normalized.push({ ...part, qty: Math.min(part.qty, item.stock) });
  }
  return normalized;
}

/**
 * Descuenta del inventario las piezas usadas en un servicio.
 * Las piezas van incluidas en el precio del servicio (no suman ganancia);
 * para ventas de mostrador existe VENDER (-1).
 */
export function processPartsUsage(
  inventory: InventoryItem[],
  parts: PartUsage[]
): InventoryItem[] {
  const usageMap = new Map(parts.map(p => [p.itemId, p.qty]));
  return inventory.map(item => {
    const qty = usageMap.get(item.id) || 0;
    if (qty <= 0) return item;
    return { ...item, stock: Math.max(0, item.stock - qty) };
  });
}

// ─── Notas del técnico ──────────────────────────────────────────────────────

export function appendQuickNote(currentNotes: string | undefined, tag: string): string {
  const notes = currentNotes || '';
  return notes ? `${notes} • ${tag}` : tag;
}

// ─── Presets por voz ────────────────────────────────────────────────────────

const VOICE_BRAND_KEYWORDS: { brands: string[]; presetModel: string }[] = [
  { brands: ['toyota'], presetModel: 'TOYOTA COROLLA' },
  { brands: ['honda'], presetModel: 'HONDA CIVIC' },
  { brands: ['nissan'], presetModel: 'NISSAN SENTRA' },
  { brands: ['ford'], presetModel: 'FORD F-150' },
  { brands: ['chevy', 'chevrolet'], presetModel: 'CHEVROLET CAMARO' },
  { brands: ['hyundai'], presetModel: 'HYUNDAI ELANTRA' },
  { brands: ['kia'], presetModel: 'KIA FORTE' },
  { brands: ['jeep'], presetModel: 'JEEP GRAND CHEROKEE' },
  { brands: ['ram'], presetModel: 'RAM 1500' },
  { brands: ['dodge', 'caravan'], presetModel: 'DODGE JOURNEY' },
  { brands: ['volkswagen', 'vw'], presetModel: 'VOLKSWAGEN JETTA' },
  { brands: ['mazda'], presetModel: 'MAZDA 3' },
  { brands: ['mitsubishi'], presetModel: 'MITSUBISHI OUTLANDER' },
  { brands: ['gmc', 'terrain'], presetModel: 'GMC TERRAIN' },
  { brands: ['buick'], presetModel: 'BUICK ENCORE' },
];

/**
 * Busca la ficha técnica cuyo modelo contiene la marca reconocida en el texto.
 * Evita dependencias de años hardcodeados ("2003 TOYOTA" vs "2005 TOYOTA").
 */
export function matchPresetByBrand(text: string, presets: CarPreset[]): CarPreset | null {
  const lower = text.toLowerCase();
  for (const { brands, presetModel } of VOICE_BRAND_KEYWORDS) {
    if (brands.some(b => lower.includes(b))) {
      return presets.find(p => p.model.includes(presetModel)) || null;
    }
  }
  return null;
}

// ─── Exportación CSV ────────────────────────────────────────────────────────

function csvEscape(value: string | number | undefined | null): string {
  const s = String(value ?? '');
  return `"${s.replace(/"/g, '""')}"`;
}

export function buildHistoryCsv(records: DiagnosticRecord[]): string {
  const header = 'ID,Fecha,Cliente,Vehiculo,Problema,NotasTecnico,Diagnostico,Estado,Monto,MetodoPago,PiezasUsadas';
  const rows = records.map(h =>
    [
      csvEscape(h.id),
      csvEscape(h.date),
      csvEscape(h.client),
      csvEscape(h.car),
      csvEscape(h.issue),
      csvEscape(h.notes),
      csvEscape(h.aiDiagnosis),
      csvEscape(h.status),
      csvEscape(h.amount != null ? h.amount.toFixed(2) : ''),
      csvEscape(h.paymentMethod || ''),
      csvEscape((h.partsUsed || []).map(p => `${p.name} x${p.qty}`).join('; ')),
    ].join(',')
  );
  return [header, ...rows].join('\n');
}

// ─── Analíticas derivadas del historial real ────────────────────────────────

const SERVICE_CATEGORIES: { label: string; keywords: string[] }[] = [
  { label: 'Pérdida Total de Llave', keywords: ['PERDIDA', 'PERDIÓ', 'ALL KEYS LOST'] },
  { label: 'Control / FOB', keywords: ['FOB', 'CONTROL', 'SMART KEY', 'PROXIMITY', 'REMOTE'] },
  { label: 'Programación / BCM', keywords: ['PROGRAMACIÓN', 'PROGRAMACION', 'BCM', 'NATS', 'PATS', 'PIN', 'INMOVILIZADOR', 'TRANSPONDER'] },
  { label: 'Apertura / Lockout', keywords: ['APERTURA', 'GANZÚA', 'GANZUA', 'LISHI', 'LOCKOUT', 'CERRADA'] },
  { label: 'Copia de Llave', keywords: ['COPIA', 'DUPLICADO'] },
];

export function classifyService(record: Pick<DiagnosticRecord, 'issue' | 'aiDiagnosis'>): string {
  const text = `${record.issue} ${record.aiDiagnosis}`.toUpperCase();
  for (const { label, keywords } of SERVICE_CATEGORIES) {
    if (keywords.some(k => text.includes(k))) return label;
  }
  return 'Otro';
}

export interface AnalyticsSummary {
  totalServices: number;
  totalRevenue: number;
  avgTicket: number;
  weekly: { dia: string; servicios: number; ingresos: number }[];
  categories: { categoria: string; cantidad: number; monto: number }[];
  topCategory: string;
}

const DAY_LABELS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function deriveAnalytics(history: DiagnosticRecord[], revenue: number): AnalyticsSummary {
  const totalServices = history.length;
  const totalRevenue = history.reduce((sum, r) => sum + (r.amount ?? 0), 0);
  const avgTicket = totalServices > 0 ? totalRevenue / totalServices : 0;

  // Servicios de los últimos 7 días (incluye hoy), en orden lunes→domingo no:
  // usamos el orden cronológico real de los últimos 7 días terminando hoy.
  const today = startOfDay(Date.now());
  const weekBuckets = new Map<number, { servicios: number; ingresos: number }>();
  for (let i = 6; i >= 0; i--) {
    weekBuckets.set(today - i * 86_400_000, { servicios: 0, ingresos: 0 });
  }
  for (const r of history) {
    const ts = r.timestampMs;
    if (typeof ts !== 'number') continue;
    const day = startOfDay(ts);
    const bucket = weekBuckets.get(day);
    if (bucket) {
      bucket.servicios += 1;
      bucket.ingresos += r.amount ?? 0;
    }
  }
  const weekly = [...weekBuckets.entries()].map(([day, b]) => ({
    dia: DAY_LABELS[new Date(day).getDay()],
    servicios: b.servicios,
    ingresos: Math.round(b.ingresos),
  }));

  const categoryMap = new Map<string, { cantidad: number; monto: number }>();
  for (const r of history) {
    const label = classifyService(r);
    const entry = categoryMap.get(label) || { cantidad: 0, monto: 0 };
    entry.cantidad += 1;
    entry.monto += r.amount ?? 0;
    categoryMap.set(label, entry);
  }
  const categories = [...categoryMap.entries()]
    .map(([categoria, v]) => ({ categoria, cantidad: v.cantidad, monto: Math.round(v.monto) }))
    .sort((a, b) => b.cantidad - a.cantidad);

  const topCategory = categories[0]?.categoria || '—';

  return {
    totalServices,
    totalRevenue: totalRevenue || revenue,
    avgTicket,
    weekly,
    categories,
    topCategory,
  };
}
