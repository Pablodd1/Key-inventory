import type { AppData, Client, DiagnosticRecord, InventoryItem } from './types';

// Datos de demostración para probar todos los flujos de la app:
// alertas de stock, pedido a proveedor, historial con búsqueda, analíticas
// de 7 días, tickets y cobros por distintos métodos.
// `now` es inyectable para poder testear.

const DAY = 86_400_000;

function daysAgo(now: number, days: number, hour: number, minute: number): number {
  const d = new Date(now - days * DAY);
  d.setHours(hour, minute, 0, 0);
  // Nunca generar marcas futuras (p. ej. servicio "hoy 3 PM" cargado a las 9 AM)
  return Math.min(d.getTime(), now);
}

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleString('es-US');
}

const DEMO_CLIENTS: { first: string; last: string; phone: string; car: string; issue: string; notes?: string }[] = [
  { first: 'CARLOS', last: 'RUIZ', phone: '305-555-0142', car: '2005 TOYOTA COROLLA', issue: 'LLAVE PERDIDA TOTAL EN ESTACIONAMIENTO', notes: 'Cilindro conductor algo oxidado' },
  { first: 'ANA', last: 'GOMEZ', phone: '786-555-0198', car: '2010 HONDA CIVIC', issue: 'CONTROL FOB DESCONFIGURADO, NO ABRE' },
  { first: 'LUIS', last: 'MARTINEZ', phone: '305-555-0177', car: '2012 NISSAN SENTRA', issue: 'NO ARRANCA, LUZ NATS PARPADEA', notes: 'Batería 12.1V — cargar antes de programar' },
  { first: 'MARÍA', last: 'FERNÁNDEZ', phone: '954-555-0123', car: '2008 FORD F-150', issue: 'COPIA DE LLAVE CHIP H84' },
  { first: 'JORGE', last: 'PEREZ', phone: '305-555-0164', car: '2015 CHEVROLET CAMARO', issue: 'LLAVE NAVAJA DAÑADA, REQUIERE HU100' },
  { first: 'YESENIA', last: 'TORRES', phone: '786-555-0155', car: '2018 HYUNDAI ELANTRA', issue: 'SMART KEY PERDIDA EN MALL' },
  { first: 'ROBERT', last: 'JOHNSON', phone: '305-555-0111', car: '2016 JEEP GRAND CHEROKEE', issue: 'FOBIK PROXIMIDAD NO RESPONDE' },
  { first: 'DANIELA', last: 'MORales'.toUpperCase(), phone: '305-555-0188', car: '2014 VOLKSWAGEN JETTA', issue: 'COPIA NAVAJA IMMO4 CON CHIP ID48' },
];

const DEMO_INVENTORY: { name: string; type: string; stock: number; price: number }[] = [
  { name: 'Toyota Corolla 98-05', type: 'LLAVE TRANSPONDER', stock: 12, price: 65 },
  { name: 'Honda Civic 01-10', type: 'CONTROL FOB (3B)', stock: 2, price: 85 },
  { name: 'Nissan Sentra 00-12', type: 'CHIP ID46', stock: 8, price: 45 },
  { name: 'Ford F-150 04-14', type: 'LLAVE CHIP H84', stock: 5, price: 70 },
  { name: 'Chevrolet Camaro 10-15', type: 'LLAVE NAVAJA HU100', stock: 1, price: 95 },
  { name: 'Hyundai Elantra 17-20', type: 'CONTROL SMART KEY (4B)', stock: 3, price: 140 },
  { name: 'VW Jetta 11-18', type: 'CHIP ID48', stock: 6, price: 55 },
  { name: 'Jeep Grand Cherokee 11-16', type: 'FOBIK PROXIMIDAD 5B', stock: 2, price: 120 },
  { name: 'Lishi HU66 (2-in-1 Gen 3)', type: 'HERRAMIENTA LISHI', stock: 4, price: 180 },
  { name: 'Lishi TOY43 (2-in-1 8-Cut)', type: 'HERRAMIENTA LISHI', stock: 7, price: 175 },
];

const DEMO_SERVICES: { clientIdx: number; day: number; hour: number; amount: number; method: 'efectivo' | 'zelle' | 'tarjeta'; issue?: string; diag: string; status: string; notes?: string }[] = [
  { clientIdx: 0, day: 6, hour: 9, amount: 220, method: 'efectivo', diag: 'CHIP ID4C PROGRAMADO VÍA MÉTODO MANUAL (5 ACELERADOR / 6 PUERTA). CORTE TOY43 EN SITIO.', status: 'ÉXITO' },
  { clientIdx: 1, day: 6, hour: 14, amount: 95, method: 'zelle', diag: 'RE-SINCRONIZACIÓN DE FOB 313.8MHZ: CICLAR IGNICIÓN 4 VECES + BLOQUEAR. FUNCIONando CONFIRMADO.', status: 'ÉXITO' },
  { clientIdx: 2, day: 5, hour: 10, amount: 180, method: 'tarjeta', diag: 'LECTURA BCM VÍA OBD2, PIN 4 DÍGITOS OBTENIDO. TRANSPONDER ID46 RE-APRENDIDO.', status: 'ÉXITO', notes: 'Batería cargada a 12.5V antes de programar' },
  { clientIdx: 3, day: 5, hour: 16, amount: 75, method: 'efectivo', diag: 'COPIA H84 CON BYPASS PATS 3 (ESPERA 10 MIN). SEGUNDA LLAVE VERIFICADA.', status: 'ÉXITO' },
  { clientIdx: 4, day: 4, hour: 11, amount: 210, method: 'tarjeta', diag: 'NAVAJA HU100 CORTADA, CHIP CIRCLE PLUS APRENDIDO CON CICLO 3x10 MIN.', status: 'ÉXITO' },
  { clientIdx: 5, day: 4, hour: 15, amount: 350, method: 'tarjeta', diag: 'SMART KEY PROXIMIDAD ID47: PIN 6 DÍGITOS POR VIN, PROGRAMACIÓN OK.', status: 'ÉXITO', notes: 'Cliente perdió las 2 llaves — pérdida total' },
  { clientIdx: 6, day: 3, hour: 9, amount: 265, method: 'zelle', diag: 'LECTURA PIN RFHUB CON CABLE 12+8 (SGW). FOBIK PROXIMIDAD PROGRAMADO.', status: 'ÉXITO' },
  { clientIdx: 7, day: 3, hour: 13, amount: 130, method: 'efectivo', diag: 'PRE-CABEZAL ID48 CON 7 BYTES CS PREPARADO. CORTE HU66 Y APRENDIZAJE IMMO4.', status: 'ÉXITO' },
  { clientIdx: 0, day: 2, hour: 10, amount: 150, method: 'efectivo', issue: 'APERTURA SIN LLAVE (LOCKOUT)', diag: 'GANZUADO LISHI TOY43 EN 3 MINUTOS. SIN DAÑOS EN CILINDRO.', status: 'ÉXITO' },
  { clientIdx: 1, day: 2, hour: 17, amount: 85, method: 'tarjeta', issue: 'BATERÍA DE CONTROL FOB AGOTADA', diag: 'REEMPLAZO DE BATERÍA CR1616 Y VERIFICACIÓN DE RF EN FRECUENCIÓMETRO.', status: 'ÉXITO' },
  { clientIdx: 3, day: 1, hour: 12, amount: 190, method: 'tarjeta', issue: 'LLAVE F-150 NO ARRANCA', diag: 'PATS REQUIERE 2 LLAVES PROGRAMADAS — SE PROGRAMÓ SEGUNDA LLAVE Y SE VERIFICÓ ARRANQUE.', status: 'ÉXITO' },
  { clientIdx: 5, day: 1, hour: 16, amount: 65, method: 'efectivo', issue: 'DUPLICADO DE LLAVE MECÁNICA', diag: 'CORTE DE ESPADA POR CÓDIGO EN MÁQUINA PORTÁTIL.', status: 'ÉXITO' },
  { clientIdx: 6, day: 0, hour: 9, amount: 0, method: 'efectivo', issue: 'JEEP NO RESPONDE A PROGRAMACIÓN', diag: 'SGW BLOQUEADO — SE SOLICITÓ CABLE 12+8 ADICIONAL AL PROVEEDOR.', status: 'REQUIERE ESCÁNER', notes: 'Reagendar cuando llegue cable SGW' },
  { clientIdx: 2, day: 0, hour: 11, amount: 240, method: 'tarjeta', issue: 'PROGRAMACIÓN DE 2 LLAVES SENTRA', diag: 'REINICIO NATS 5, AMBAS LLAVES APRENDIDAS Y PROBADAS EN ARRANQUE.', status: 'ÉXITO' },
  { clientIdx: 7, day: 0, hour: 15, amount: 115, method: 'zelle', issue: 'REPARACIÓN DE NAVAJA JETTA', diag: 'REEMPLAZO DE CARCASA Y MICRO. CHIP ORIGINAL CONSERVADO.', status: 'ÉXITO' },
];

export function createDemoData(now: number = Date.now()): AppData {
  const clients: Client[] = DEMO_CLIENTS.map((c, i) => ({
    id: `demo-client-${i + 1}`,
    firstName: c.first,
    lastName: c.last,
    phone: c.phone,
    email: '',
    carInfo: c.car,
    issue: c.issue,
    timestamp: fmtDate(daysAgo(now, Math.max(0, DEMO_SERVICES.filter(s => s.clientIdx === i)[0]?.day ?? 1), 10, 30)),
    timestampMs: daysAgo(now, Math.max(0, DEMO_SERVICES.filter(s => s.clientIdx === i)[0]?.day ?? 1), 10, 30),
    notes: c.notes,
  }));

  const inventory: InventoryItem[] = DEMO_INVENTORY.map((item, i) => ({
    id: `demo-item-${i + 1}`,
    name: item.name,
    type: item.type,
    stock: item.stock,
    price: item.price,
    barcode: String(4000 + i * 37),
  }));

  const history: DiagnosticRecord[] = DEMO_SERVICES.map((s, i) => {
    const client = clients[s.clientIdx];
    return {
      id: `demo-rec-${i + 1}`,
      date: fmtDate(daysAgo(now, s.day, s.hour, 15 + i)),
      timestampMs: daysAgo(now, s.day, s.hour, 15 + i),
      client: `${client.firstName} ${client.lastName}`,
      car: client.carInfo,
      issue: s.issue || client.issue,
      aiDiagnosis: s.diag.toUpperCase(),
      status: s.status,
      notes: s.notes,
      amount: s.amount,
      paymentMethod: s.method,
    };
  }).sort((a, b) => (b.timestampMs ?? 0) - (a.timestampMs ?? 0));

  const servicesRevenue = DEMO_SERVICES.reduce((sum, s) => sum + s.amount, 0);
  const partsRevenue = 260; // ventas de inventario del período

  return {
    clients,
    inventory,
    history,
    revenue: servicesRevenue + partsRevenue,
  };
}
