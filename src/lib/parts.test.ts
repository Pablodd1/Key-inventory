import { describe, it, expect } from 'vitest';
import { processPartsUsage, normalizePartUsage } from './domain';
import type { InventoryItem, PartUsage } from './types';

const inventory: InventoryItem[] = [
  { id: 'i1', name: 'Chip ID46', type: 'CHIP', stock: 5, price: 45, barcode: '1' },
  { id: 'i2', name: 'Lishi HU66', type: 'HERRAMIENTA', stock: 1, price: 180, barcode: '2' },
  { id: 'i3', name: 'FOB Honda', type: 'FOB', stock: 0, price: 85, barcode: '3' },
];

describe('Piezas usadas en un servicio', () => {
  it('descuenta las cantidades del stock correcto', () => {
    const parts: PartUsage[] = [
      { itemId: 'i1', name: 'Chip ID46', qty: 2 },
      { itemId: 'i2', name: 'Lishi HU66', qty: 1 },
    ];
    const updated = processPartsUsage(inventory, parts);
    expect(updated.find(i => i.id === 'i1')?.stock).toBe(3);
    expect(updated.find(i => i.id === 'i2')?.stock).toBe(0);
    expect(updated.find(i => i.id === 'i3')?.stock).toBe(0); // sin uso
  });

  it('no baja de cero aunque la lista pida más del stock', () => {
    const updated = processPartsUsage(inventory, [{ itemId: 'i2', name: 'Lishi HU66', qty: 5 }]);
    expect(updated.find(i => i.id === 'i2')?.stock).toBe(0);
  });

  it('normaliza duplicados y recorta al stock disponible', () => {
    const raw: PartUsage[] = [
      { itemId: 'i1', name: 'Chip ID46', qty: 1 },
      { itemId: 'i1', name: 'Chip ID46', qty: 2 },
      { itemId: 'i2', name: 'Lishi HU66', qty: 7 },
      { itemId: 'inexistente', name: 'X', qty: 1 },
      { itemId: 'i3', name: 'FOB Honda', qty: 3 },
    ];
    const normalized = normalizePartUsage(raw, inventory);
    expect(normalized).toEqual([
      { itemId: 'i1', name: 'Chip ID46', qty: 3 },
      { itemId: 'i2', name: 'Lishi HU66', qty: 1 },
      { itemId: 'i3', name: 'FOB Honda', qty: 0 }, // stock 0 → recortado a 0
    ]);
  });

  it('descarta piezas con cantidad cero o ítems desconocidos', () => {
    const normalized = normalizePartUsage(
      [
        { itemId: 'i1', name: 'Chip ID46', qty: 0 },
        { itemId: 'otro', name: 'X', qty: 2 },
      ],
      inventory
    );
    expect(normalized).toEqual([]);
  });
});
