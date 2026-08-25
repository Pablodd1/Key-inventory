export interface CarPreset {
  model: string;
  chip: string;
  keyType: string;
  freq: string;
  programMethod: string;
  defaultIssue: string;
  lishiTool: string;
  lockoutMethod: string;
  obdLocation: string;
  emergencyTip: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  carInfo: string;
  issue: string;
  timestamp: string;
  timestampMs?: number;
  location?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: string;
  stock: number;
  price: number;
  barcode: string;
  /** Miniatura JPEG (~200px) para identificar la pieza visualmente */
  photo?: string;
}

/** Pieza de inventario consumida durante un servicio */
export interface PartUsage {
  itemId: string;
  name: string;
  qty: number;
}

export type PaymentMethod = 'tarjeta' | 'efectivo' | 'zelle';

export interface DiagnosticRecord {
  id: string;
  date: string;
  timestampMs?: number;
  client: string;
  car: string;
  issue: string;
  aiDiagnosis: string;
  status: string;
  image?: string | null;
  notes?: string;
  amount?: number;
  paymentMethod?: PaymentMethod;
  stripeSessionId?: string;
  partsUsed?: PartUsage[];
}

export interface AppData {
  clients: Client[];
  inventory: InventoryItem[];
  history: DiagnosticRecord[];
  revenue: number;
}
