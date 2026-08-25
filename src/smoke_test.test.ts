import { describe, it, expect, beforeEach } from 'vitest';

// Pure domain logic tests for Auto-Locksmith ERP

interface InventoryItem {
  id: string;
  name: string;
  type: string;
  stock: number;
  price: number;
  barcode: string;
}

interface DiagnosticRecord {
  id: string;
  date: string;
  client: string;
  car: string;
  issue: string;
  aiDiagnosis: string;
  status: string;
  notes?: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  carInfo: string;
  issue: string;
  timestamp: string;
  location?: string;
  notes?: string;
}

// Helper validation functions
export function validateClientInput(data: Partial<Client>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data.firstName?.trim()) errors.push('First name is required');
  if (!data.lastName?.trim()) errors.push('Last name is required');
  if (!data.carInfo?.trim()) errors.push('Vehicle make/model is required');
  if (data.phone && !/^[0-9+\s\-()]{7,20}$/.test(data.phone.trim())) {
    errors.push('Invalid phone number format');
  }
  return { isValid: errors.length === 0, errors };
}

export function validateInventoryItem(item: Partial<InventoryItem>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!item.name?.trim()) errors.push('Item name is required');
  if (typeof item.stock !== 'number' || isNaN(item.stock) || item.stock < 0) {
    errors.push('Stock must be a non-negative number');
  }
  if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
    errors.push('Price must be greater than zero');
  }
  return { isValid: errors.length === 0, errors };
}

export function processItemSale(inventory: InventoryItem[], itemId: string): { updatedInventory: InventoryItem[]; soldItem: InventoryItem | null } {
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

describe('Miami Auto-Key ERP - Core Smoke & Domain Tests', () => {
  let sampleInventory: InventoryItem[];

  beforeEach(() => {
    sampleInventory = [
      { id: '1', name: 'Toyota Corolla 98-05', type: 'LLAVE TRANSPONDER', stock: 12, price: 65, barcode: '123' },
      { id: '2', name: 'Honda Civic 01-10', type: 'CONTROL FOB (3B)', stock: 2, price: 85, barcode: '456' },
      { id: '3', name: 'Nissan Sentra 00-12', type: 'CHIP ID46', stock: 1, price: 45, barcode: '789' }
    ];
  });

  describe('1. Input Validation Guardrails', () => {
    it('validates client intake and prevents empty submissions', () => {
      const emptyCheck = validateClientInput({});
      expect(emptyCheck.isValid).toBe(false);
      expect(emptyCheck.errors).toContain('First name is required');
      expect(emptyCheck.errors).toContain('Last name is required');
      expect(emptyCheck.errors).toContain('Vehicle make/model is required');

      const validCheck = validateClientInput({
        firstName: 'Carlos',
        lastName: 'Mendez',
        carInfo: '2018 Honda Civic',
        phone: '305-555-0199'
      });
      expect(validCheck.isValid).toBe(true);
      expect(validCheck.errors.length).toBe(0);
    });

    it('validates inventory creation with negative stock/price protection', () => {
      const invalidItem = validateInventoryItem({ name: 'Key FOB', stock: -5, price: 0 });
      expect(invalidItem.isValid).toBe(false);
      expect(invalidItem.errors.length).toBe(2);

      const validItem = validateInventoryItem({ name: 'Ford H84 Key', stock: 10, price: 55 });
      expect(validItem.isValid).toBe(true);
    });
  });

  describe('2. Core Inventory Operations & Stock Audit', () => {
    it('decrements stock on physical item sale', () => {
      const { updatedInventory, soldItem } = processItemSale(sampleInventory, '2');
      expect(soldItem).not.toBeNull();
      expect(soldItem?.name).toBe('Honda Civic 01-10');
      
      const item2 = updatedInventory.find(i => i.id === '2');
      expect(item2?.stock).toBe(1);
    });

    it('prevents selling when stock is zero', () => {
      const depletedInventory = [{ id: '99', name: 'Chip ID48', type: 'CHIP', stock: 0, price: 40, barcode: '999' }];
      const { updatedInventory, soldItem } = processItemSale(depletedInventory, '99');
      expect(soldItem).toBeNull();
      expect(updatedInventory[0].stock).toBe(0);
    });

    it('correctly applies wholesale restock quantities to existing inventory', () => {
      const restocked = processSupplierRestock(sampleInventory, [
        { itemId: '2', quantity: 15 },
        { itemId: '3', quantity: 20 }
      ]);

      expect(restocked.find(i => i.id === '2')?.stock).toBe(17); // 2 + 15
      expect(restocked.find(i => i.id === '3')?.stock).toBe(21); // 1 + 20
      expect(restocked.find(i => i.id === '1')?.stock).toBe(12); // untouched
    });
  });

  describe('3. Technician Field Notes & Observations', () => {
    it('appends quick diagnostic observation tags without overwriting existing notes', () => {
      const client: Client = {
        id: 'c1',
        firstName: 'Elena',
        lastName: 'Rios',
        phone: '786-222-3344',
        email: 'elena@example.com',
        carInfo: '2005 VW Golf',
        issue: 'Llave perdida total',
        timestamp: '2026-08-25 10:00',
        notes: 'Cilindro puerta algo oxidado'
      };

      const tagToAdd = 'Corte Lishi HU66';
      const updatedNotes = client.notes ? `${client.notes} • ${tagToAdd}` : tagToAdd;
      
      expect(updatedNotes).toBe('Cilindro puerta algo oxidado • Corte Lishi HU66');
    });
  });
});
