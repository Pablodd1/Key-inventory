/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent, ChangeEvent, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Camera, 
  Mic, 
  MicOff, 
  Search, 
  User, 
  Car, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ScanLine, 
  X, 
  Download, 
  CreditCard, 
  Sparkles, 
  Plus, 
  Volume2, 
  Image as ImageIcon,
  RotateCcw,
  Printer,
  FileText,
  MapPin,
  Navigation,
  Send,
  KeyRound,
  Wrench,
  Zap,
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  Smartphone,
  TrendingUp,
  BarChart3,
  Radio,
  HelpCircle,
  Activity,
  Compass,
  ExternalLink,
  RefreshCw,
  Maximize2,
  ShieldCheck,
  LocateFixed,
  ShoppingCart,
  Truck,
  Copy,
  Check,
  PackageCheck,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { Html5QrcodeScanner } from 'html5-qrcode';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface CarPreset {
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

const PRESET_CAR_MODELS: CarPreset[] = [
  {
    model: '2005 TOYOTA COROLLA',
    chip: 'ID4C / ID4D (Texas Crypto)',
    keyType: 'Espada TOY43',
    freq: '315 MHz',
    programMethod: 'Manual (5 ciclos acelerador / 6 puerta) o Vía OBD2 con KM100 / IM608.',
    defaultIssue: 'LLAVE PERDIDA TOTAL - REQUIERE CHIP TRANSPONDER ID4C Y CORTE TOY43 EN SITIO.',
    lishiTool: 'Lishi TOY43 (2-in-1 / 8-Cut)',
    lockoutMethod: 'Ganzuado Lishi TOY43 en cerradura conductor (2 mins) o varilla flexible de alcance largo.',
    obdLocation: 'Bajo el tablero del conductor, lado izquierdo cerca del pedal de freno.',
    emergencyTip: 'Si no responde OBD2, usar método manual: insertar llave maestra 5 veces y abrir/cerrar puerta 6 veces.'
  },
  {
    model: '2010 HONDA CIVIC',
    chip: 'ID46 (Philips Crypto 2)',
    keyType: 'Espada HO01 / Control 3B',
    freq: '313.8 MHz',
    programMethod: 'PIN de 4 dígitos vía OBD2 con Autel IM608 / VVDI Key Tool Max.',
    defaultIssue: 'CONTROL DESCONFIGURADO - PROGRAMACIÓN DE FOB Y LECTURA DE PIN EN CARRETERA.',
    lishiTool: 'Lishi HON66 (2-in-1 High Security)',
    lockoutMethod: 'Decodificar cerradura de puerta con Lishi HON66. Cuidado con el embrague de protección Honda.',
    obdLocation: 'Centro inferior bajo la columna de dirección.',
    emergencyTip: 'Si la alarma de fábrica se activa al abrir la puerta, dejar la ignición en ON durante 2 minutos para silenciar.'
  },
  {
    model: '2012 NISSAN SENTRA',
    chip: 'ID46 (PCF7936)',
    keyType: 'Espada NSN14 / Smart Key',
    freq: '315 MHz',
    programMethod: 'Conversión BCM a PIN y reinicio de NATS 5/6 vía OBD2.',
    defaultIssue: 'LUZ NATS PARPADEA EN CARRETERA - RE-PROGRAMACIÓN DE BCM Y TRANSPONDER EN SITIO.',
    lishiTool: 'Lishi NSN14 (2-in-1)',
    lockoutMethod: 'Ganzúa Lishi NSN14 en puerta de conductor o cuña neumática superior.',
    obdLocation: 'Detrás de la tapa del compartimento guardaobjetos a la izquierda del volante.',
    emergencyTip: 'Convertir código BCM de 5 dígitos a PIN de 4 dígitos. Si NATS se bloquea, dejar ignición ON por 15 min.'
  },
  {
    model: '2008 FORD F-150',
    chip: 'ID63 (40-bit / H84)',
    keyType: 'Espada FO15 / Keyfob 3B',
    freq: '315 MHz',
    programMethod: 'Bypass PATS 3 (espera de 10 min o lectura directa EEPROM).',
    defaultIssue: 'AUXILIO DE COPIA / PÉRDIDA TOTAL - PROGRAMACIÓN PATS Y CORTADOR DE ESPADA FO15.',
    lishiTool: 'Lishi FO38 (2-in-1)',
    lockoutMethod: 'Ganzuado Lishi FO38 directo o cuña de aire con gancho en manija interna.',
    obdLocation: 'Debajo del tablero del lado del conductor, accesible directamente sin desarmar.',
    emergencyTip: 'Se requieren 2 llaves programadas para completar el ciclo PATS si fue pérdida total.'
  },
  {
    model: '2015 CHEVROLET CAMARO',
    chip: 'ID46 (Circle Plus / Passkey III+)',
    keyType: 'Navaja HU100 (4 Botones)',
    freq: '315 MHz',
    programMethod: 'Aprendizaje de 30 min (3 ciclos 10 min) o bypass directo OBD2.',
    defaultIssue: 'LLAVE NAVAJA DAÑADA / PERDIDA EN VÍA PÚBLICA - CHIP CIRCLE PLUS Y CORTE HU100.',
    lishiTool: 'Lishi HU100 (2-in-1 / 8-Cut)',
    lockoutMethod: 'Decodificar alturas de combinación con Lishi HU100 en puerta del conductor.',
    obdLocation: 'Esquina inferior izquierda del tablero del conductor.',
    emergencyTip: 'Sin scanner disponible en campo, el procedimiento manual de 3x10 minutos re-aprende la llave automáticamente.'
  },
  {
    model: '2018 HYUNDAI ELANTRA',
    chip: 'ID47 (Hitag3)',
    keyType: 'Smart Key Proximity HYN14R',
    freq: '433 MHz',
    programMethod: 'Extracción de PIN Code de 6 dígitos vía OBD2 leyendo VIN.',
    defaultIssue: 'SMART KEY PERDIDA EN ESTACIONAMIENTO - PROGRAMACIÓN PROXIMIDAD HYUNDAI ID47.',
    lishiTool: 'Lishi HY15 / HY22',
    lockoutMethod: 'Retirar tapón plástico de la manija del conductor y usar Ganzúa Lishi HY15.',
    obdLocation: 'Detrás del panel de fusibles interior al lado izquierdo bajo el volante.',
    emergencyTip: 'Para vehículos Proximity con batería de auto descargada, presionar el botón START con la esquina de la llave inteligente.'
  },
  {
    model: '2016 JEEP GRAND CHEROKEE',
    chip: 'Hitag AES / ID46',
    keyType: 'FOBIK / Proximity 5B',
    freq: '433 MHz',
    programMethod: 'Lectura de PIN en módulo RFHUB mediante cable CAN-BUS 12+8 / OBD2.',
    defaultIssue: 'CONTROL PROXIMIDAD DESCONFIGURADO - LECTURA PIN CODE Y BYPASS SGW EN SITIO.',
    lishiTool: 'Lishi CY24 (2-in-1)',
    lockoutMethod: 'Ganzuado cilindro con Lishi CY24 o bolsa de aire en marco superior.',
    obdLocation: 'Lado del conductor bajo la columna de dirección.',
    emergencyTip: 'Modelos con Bypass SGW Chrysler necesitan conectar el cable 12+8 directamente detrás del módulo RFHUB.'
  },
  {
    model: '2014 VOLKSWAGEN JETTA',
    chip: 'ID48 (Megamos Crypto / CAN)',
    keyType: 'Navaja HU66 (3 Botones)',
    freq: '315 MHz',
    programMethod: 'Lectura Component Security (CS) e Inmo 4th Gen vía OBD2.',
    defaultIssue: 'COPIA DE LLAVE NAVAJA IMMO4 - PRE-CABEZAL PREPARADO CS Y CORTE HU66 EN CAMIÓN.',
    lishiTool: 'Lishi HU66 (2-in-1 Gen 3)',
    lockoutMethod: 'Ganzuado Lishi HU66 en puerta de conductor (girar con tensión suave).',
    obdLocation: 'Ubicado bajo el tablero, recubierto de plástico púrpura/negro visible.',
    emergencyTip: 'Pre-preparar chip Super Transponder / ID48 con los 7 bytes de CS antes de iniciar aprendizaje OBD2.'
  }
];

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
  image?: string | null;
  notes?: string;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Toyota Corolla 98-05', type: 'LLAVE TRANSPONDER', stock: 12, price: 65, barcode: '123' },
  { id: '2', name: 'Honda Civic 01-10', type: 'CONTROL FOB (3B)', stock: 2, price: 85, barcode: '456' },
  { id: '3', name: 'Nissan Sentra 00-12', type: 'CHIP ID46', stock: 8, price: 45, barcode: '789' },
  { id: '4', name: 'Ford F-150 04-08', type: 'LLAVE CHIP H84', stock: 5, price: 70, barcode: '101' },
];

const INITIAL_HISTORY: DiagnosticRecord[] = [
  { 
    id: '1', 
    date: '26/10/2023 14:30', 
    client: 'CARLOS RUIZ', 
    car: '2005 TOYOTA COROLLA', 
    issue: 'LLAVE PERDIDA TOTAL', 
    aiDiagnosis: 'CHIP TRANSPONDER ID4C REQUERIDO. PROGRAMACIÓN MANUAL: INSERTAR LLAVE MAESTRA 5 VECES, ABRIR/CERRAR PUERTA 6 VECES.', 
    status: 'ÉXITO' 
  },
  { 
    id: '2', 
    date: '27/10/2023 10:15', 
    client: 'ANA GOMEZ', 
    car: '2010 HONDA CIVIC', 
    issue: 'CONTROL FOB DESCONFIGURADO', 
    aiDiagnosis: 'RE-SINCRONIZACIÓN DE CONTROL (3 BOTONES, 315MHZ): CICLAR IGNICIÓN A ON 4 VECES PRESIONANDO EL BOTÓN BLOQUEAR.', 
    status: 'ÉXITO' 
  },
  { 
    id: '3', 
    date: '27/10/2023 16:45', 
    client: 'LUIS MARTINEZ', 
    car: '2012 NISSAN SENTRA', 
    issue: 'NO ARRANCA, LUZ NATS PARPADEA', 
    aiDiagnosis: 'ANTENA DE INMOVILIZADOR O CHIP ID46 DAÑADO. REQUIERE CONEXIÓN OBD2 PARA LEER CÓDIGO BCM Y OBTENER PIN DE 4 DÍGITOS.', 
    status: 'REQUIERE ESCÁNER' 
  }
];

// Barcode Scanner Modal
function BarcodeScannerModal({ onScan, onClose }: { onScan: (text: string) => void, onClose: () => void }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );
    scanner.render(
      (decodedText) => {
        onScan(decodedText);
        scanner.clear().catch(console.error);
      },
      () => {
        // Suppress frame scan errors
      }
    );
    return () => {
      scanner.clear().catch(console.error);
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-950 border-4 border-[#FFFF00] p-4 relative shadow-[8px_8px_0px_#FFFF00]">
        <button 
          onClick={onClose} 
          className="absolute -top-6 -right-6 bg-red-500 text-white w-12 h-12 font-black border-4 border-black flex items-center justify-center hover:bg-red-400 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-black uppercase text-[#FFFF00] mb-4 text-center tracking-widest">Escanear Código de Barras</h3>
        <div id="reader" className="w-full bg-white text-black font-sans"></div>
      </div>
    </div>
  );
}

// Camera Capture Modal Component
function CameraCaptureModal({ onCapture, onClose }: { onCapture: (dataUrl: string) => void, onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let currentStream: MediaStream | null = null;
    async function startCamera() {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        setStream(currentStream);
        if (videoRef.current) {
          videoRef.current.srcObject = currentStream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setCameraError("No se pudo acceder a la cámara. Puedes subir una imagen desde tus archivos.");
      }
    }
    startCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      onCapture(dataUrl);
      onClose();
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onCapture(event.target.result as string);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-zinc-950 border-4 border-[#FFFF00] p-6 relative shadow-[8px_8px_0px_#FFFF00] flex flex-col">
        <button 
          onClick={onClose} 
          className="absolute -top-6 -right-6 bg-red-500 text-white w-12 h-12 font-black border-4 border-black flex items-center justify-center hover:bg-red-400 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-xl font-black uppercase text-[#FFFF00] mb-4 text-center tracking-widest flex items-center justify-center gap-2">
          <Camera className="w-6 h-6" /> Capturar Foto AI (Llave / Tablero)
        </h3>

        {cameraError ? (
          <div className="p-6 bg-zinc-900 border-2 border-red-500 text-center mb-4">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-red-400 uppercase mb-4">{cameraError}</p>
          </div>
        ) : (
          <div className="relative aspect-video bg-black border-2 border-zinc-700 overflow-hidden mb-4 flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-dashed border-[#FFFF00]/50 pointer-events-none flex items-center justify-center">
              <span className="text-[10px] bg-black/80 px-2 py-1 text-[#FFFF00] font-black uppercase tracking-widest">Alinee la llave o inmovilizador</span>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          {!cameraError && (
            <button 
              onClick={takeSnapshot} 
              className="flex-1 bg-[#FFFF00] text-black font-black uppercase py-4 text-lg hover:bg-white transition-colors shadow-[4px_4px_0px_#fff] flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" /> Tomar Foto
            </button>
          )}

          <label className="flex-1 bg-zinc-800 text-white font-black uppercase py-4 text-lg border-2 border-zinc-600 hover:border-white transition-colors text-center cursor-pointer flex items-center justify-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#FFFF00]" /> Subir Archivo
            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}

// Add Inventory Modal Component
function AddInventoryModal({ onAdd, onClose }: { onAdd: (item: Omit<InventoryItem, 'id'>) => void, onClose: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('LLAVE TRANSPONDER');
  const [stock, setStock] = useState(10);
  const [price, setPrice] = useState(50);
  const [barcode, setBarcode] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAdd({
      name,
      type,
      stock: Number(stock),
      price: Number(price),
      barcode: barcode || Math.floor(100 + Math.random() * 900).toString()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md bg-zinc-950 border-4 border-[#FFFF00] p-6 relative shadow-[8px_8px_0px_#FFFF00]">
        <button 
          onClick={onClose} 
          className="absolute -top-6 -right-6 bg-red-500 text-white w-12 h-12 font-black border-4 border-black flex items-center justify-center hover:bg-red-400 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-xl font-black uppercase text-[#FFFF00] mb-6 text-center tracking-widest">Agregar Nuevo Item</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-[#FFFF00] uppercase mb-1">Modelo de Vehículo / Llave</label>
            <input 
              type="text" 
              required
              value={name} 
              onChange={e => setName(e.target.value)}
              placeholder="EJ. CHEVROLET CAMARO 10-15"
              className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-bold uppercase focus:border-[#FFFF00] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#FFFF00] uppercase mb-1">Tipo de Componente</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value)}
              className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-bold uppercase focus:border-[#FFFF00] focus:outline-none"
            >
              <option value="LLAVE TRANSPONDER">LLAVE TRANSPONDER</option>
              <option value="CONTROL FOB (3B)">CONTROL FOB (3B)</option>
              <option value="CONTROL SMART KEY (4B)">CONTROL SMART KEY (4B)</option>
              <option value="CHIP ID46">CHIP ID46</option>
              <option value="CHIP ID48">CHIP ID48</option>
              <option value="LLAVE CHIP H84">LLAVE CHIP H84</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-[#FFFF00] uppercase mb-1">Stock Inicial</label>
              <input 
                type="number" 
                min="1"
                value={stock} 
                onChange={e => setStock(Number(e.target.value))}
                className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-bold uppercase focus:border-[#FFFF00] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-[#FFFF00] uppercase mb-1">Precio ($USD)</label>
              <input 
                type="number" 
                min="5"
                value={price} 
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-bold uppercase focus:border-[#FFFF00] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-[#FFFF00] uppercase mb-1">Código de Barras (Opcional)</label>
            <input 
              type="text" 
              value={barcode} 
              onChange={e => setBarcode(e.target.value)}
              placeholder="EJ. 8899"
              className="w-full bg-black border-2 border-zinc-700 p-3 text-white font-bold uppercase focus:border-[#FFFF00] focus:outline-none"
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#FFFF00] text-black font-black uppercase py-4 text-lg hover:bg-white transition-colors shadow-[4px_4px_0px_#fff] mt-4"
          >
            Guardar en Inventario
          </button>
        </form>
      </div>
    </div>
  );
}

function getStatusBadge(status: string) {
  const upper = status.toUpperCase();
  if (upper.includes('ÉXITO') || upper.includes('COMPLETADO') || upper.includes('OK')) {
    return (
      <span className="bg-emerald-500 text-black px-3 py-1 text-xs font-black tracking-widest flex items-center gap-1.5 border border-emerald-400">
        <CheckCircle className="w-3.5 h-3.5" /> {status}
      </span>
    );
  }
  if (upper.includes('ESCÁNER') || upper.includes('PROCESO') || upper.includes('PENDIENTE')) {
    return (
      <span className="bg-amber-400 text-black px-3 py-1 text-xs font-black tracking-widest flex items-center gap-1.5 border border-amber-300">
        <Clock className="w-3.5 h-3.5" /> {status}
      </span>
    );
  }
  return (
    <span className="bg-red-600 text-white px-3 py-1 text-xs font-black tracking-widest flex items-center gap-1.5 border border-red-500">
      <AlertTriangle className="w-3.5 h-3.5" /> {status}
    </span>
  );
}

function PrintTicketModal({ record, onClose }: { record: DiagnosticRecord; onClose: () => void }) {
  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    let text = `*MIAMI AUTO-KEY - TICKET DE SERVICIO MÓVIL*\n\n` +
      `*Ticket #:* ${record.id ? record.id.slice(-6) : '000001'}\n` +
      `*Fecha:* ${record.date}\n` +
      `*Cliente:* ${record.client}\n` +
      `*Vehículo:* ${record.car}\n` +
      `*Trabajo:* ${record.issue}\n` +
      `*Diagnóstico:* ${record.aiDiagnosis}\n`;
    if (record.notes) {
      text += `*Notas de Campo:* ${record.notes}\n`;
    }
    text += `*Total Cobrado:* $150.00 USD\n\n` +
      `_¡Gracias por confiar en nuestros cerrajeros móviles! Garantía de 30 días en chips y mandos._`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-md bg-white text-black p-6 border-4 border-black font-mono shadow-[12px_12px_0px_#FFFF00] relative">
        <button 
          onClick={onClose} 
          className="absolute -top-3 -right-3 bg-red-600 text-white w-9 h-9 font-black border-2 border-black flex items-center justify-center hover:bg-red-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Thermal Receipt Content */}
        <div className="text-center border-b-2 border-dashed border-black pb-4 mb-4">
          <h2 className="text-xl font-black uppercase tracking-tight">MIAMI AUTO-KEY ERP</h2>
          <p className="text-xs font-bold uppercase">Cerrajería Automotive & Diagnóstico Móvil</p>
          <p className="text-[10px] text-zinc-600">Miami, FL • Tel: (305) 555-KEYS</p>
          <div className="mt-3 text-xs font-bold border-t border-black pt-2 flex justify-between">
            <span>TICKET #: {record.id ? record.id.slice(-6) : '000001'}</span>
            <span>FECHA: {record.date}</span>
          </div>
        </div>

        <div className="space-y-3 text-xs mb-6">
          <div className="flex justify-between border-b border-zinc-200 pb-1">
            <span className="font-bold">CLIENTE:</span>
            <span className="font-black text-right uppercase">{record.client}</span>
          </div>
          <div className="flex justify-between border-b border-zinc-200 pb-1">
            <span className="font-bold">VEHÍCULO:</span>
            <span className="font-black text-right uppercase">{record.car}</span>
          </div>
          <div className="border-b border-zinc-200 pb-2">
            <span className="font-bold block mb-0.5">FALLA REPORTADA:</span>
            <p className="text-zinc-800 font-semibold uppercase">{record.issue}</p>
          </div>
          <div className="border-b border-zinc-200 pb-2 bg-zinc-50 p-2 border border-zinc-300">
            <span className="font-bold block mb-0.5 text-black">DIAGNÓSTICO / TRABAJO REALIZADO:</span>
            <p className="text-zinc-900 font-semibold italic uppercase">{record.aiDiagnosis}</p>
          </div>
          {record.notes && (
            <div className="border-b border-zinc-200 pb-2 bg-amber-50 p-2 border border-amber-300">
              <span className="font-bold block mb-0.5 text-amber-950">NOTAS DEL TÉCNICO:</span>
              <p className="text-amber-950 font-semibold uppercase">{record.notes}</p>
            </div>
          )}
          <div className="flex justify-between items-center text-sm font-black pt-2 border-t-2 border-black">
            <span>TOTAL COBRADO:</span>
            <span className="text-lg">$150.00 USD</span>
          </div>
          <div className="text-center pt-2">
            <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
              record.status === 'ÉXITO' || record.status === 'COMPLETADO' 
                ? 'bg-black text-white' 
                : 'bg-zinc-300 text-black border border-black'
            }`}>
              ESTADO: {record.status}
            </span>
          </div>
        </div>

        <div className="text-center text-[10px] text-zinc-600 border-t border-dashed border-black pt-3 mb-6">
          ¡Gracias por confiar en Miami Auto-Key!
          <br />Garantía de 30 días en programación de transponders.
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button 
              onClick={handlePrint} 
              className="flex-1 bg-black text-[#FFFF00] font-black uppercase py-3 text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors border-2 border-black"
            >
              <Printer className="w-4 h-4" /> Imprimir Ticket
            </button>
            <button 
              onClick={handleShareWhatsApp} 
              className="flex-1 bg-emerald-600 text-white font-black uppercase py-3 text-xs flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors border-2 border-black"
            >
              <Send className="w-4 h-4" /> WhatsApp Cliente
            </button>
          </div>
          <button 
            onClick={onClose} 
            className="w-full bg-zinc-200 text-black font-black uppercase py-2 text-xs hover:bg-zinc-300 transition-colors border-2 border-black"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

function FieldGuideModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'lishi' | 'obd' | 'pin' | 'rf'>('lishi');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-3xl bg-zinc-950 text-white p-6 border-4 border-[#FFFF00] shadow-[12px_12px_0px_#FFFF00] relative my-8">
        <button 
          onClick={onClose} 
          className="absolute -top-3 -right-3 bg-red-600 text-white w-9 h-9 font-black border-2 border-black flex items-center justify-center hover:bg-red-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b-4 border-zinc-800 pb-4 mb-6">
          <Wrench className="w-8 h-8 text-[#FFFF00]" />
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-[#FFFF00]">Guía Rápida de Campo - Cerrajería Móvil</h2>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Manual de Auxilio Vial para Cerrajeros en Sitio</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-6">
          <button 
            type="button"
            onClick={() => setActiveTab('lishi')}
            className={`py-2.5 px-3 text-xs font-black uppercase tracking-wider border-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'lishi' ? 'bg-[#FFFF00] text-black border-[#FFFF00]' : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Aperturas (Lishi)
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('obd')}
            className={`py-2.5 px-3 text-xs font-black uppercase tracking-wider border-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'obd' ? 'bg-[#FFFF00] text-black border-[#FFFF00]' : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" /> Equipos OBD2
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('pin')}
            className={`py-2.5 px-3 text-xs font-black uppercase tracking-wider border-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'pin' ? 'bg-[#FFFF00] text-black border-[#FFFF00]' : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> BCM a PIN Code
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('rf')}
            className={`py-2.5 px-3 text-xs font-black uppercase tracking-wider border-2 transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'rf' ? 'bg-[#FFFF00] text-black border-[#FFFF00]' : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" /> Transponder / RF
          </button>
        </div>

        {/* Tab Contents */}
        <div className="bg-black border-2 border-zinc-800 p-5 space-y-4 text-xs">
          {activeTab === 'lishi' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#FFFF00] uppercase tracking-wider border-b border-zinc-800 pb-2">Procedimiento Estándar de Decodificación Lishi (2-en-1)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-3 border border-zinc-800">
                  <span className="font-black text-[#FFFF00] block mb-1">1. LIMPIEZA DEL CILINDRO</span>
                  <p className="text-zinc-300">Aplicar limpiador en aerosol en la cerradura del conductor. Insertar Ganzúa Lishi suavemente hasta tocar fondo sin forzar el tensor.</p>
                </div>
                <div className="bg-zinc-950 p-3 border border-zinc-800">
                  <span className="font-black text-[#FFFF00] block mb-1">2. TENSIÓN Y BÚSQUEDA DE PERNOS</span>
                  <p className="text-zinc-300">Aplicar ligera tensión constante. Probar las posiciones (1 al 8) buscando el perno rígido o "duro". Presionar hasta sentir el "click" de liberación.</p>
                </div>
                <div className="bg-zinc-950 p-3 border border-zinc-800">
                  <span className="font-black text-[#FFFF00] block mb-1">3. LECTURA DE ALTURAS DE CORTE</span>
                  <p className="text-zinc-300">Girar cilindro 90°. Leer el valor de cada perno alineando el indicador sobre las líneas graduadas (1, 2, 3, 4). Anotar la combinación de corte.</p>
                </div>
                <div className="bg-zinc-950 p-3 border border-zinc-800">
                  <span className="font-black text-[#FFFF00] block mb-1">4. CORTADORA PORTÁTIL EN CAMIÓN</span>
                  <p className="text-zinc-300">Ingresar los códigos decodificados en la máquina de corte automática (Xhorse Condor / SEC-E9) seleccionando el perfil de espada correspondiente.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'obd' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#FFFF00] uppercase tracking-wider border-b border-zinc-800 pb-2">Secuencia de Programación OBD2 en Sitio (KM100 / IM608 / VVDI)</h3>
              <div className="space-y-3">
                <div className="bg-zinc-950 p-3 border border-zinc-800 flex gap-3 items-start">
                  <span className="bg-[#FFFF00] text-black font-black px-2 py-0.5 text-xs shrink-0">P0</span>
                  <div>
                    <span className="font-black text-white block">VERIFICACIÓN DE VOLTAJE DE BATERÍA</span>
                    <p className="text-zinc-400">Asegurar voltaje mayor a 12.5V. Si la batería está débil, conectar arrancador de respaldo antes de iniciar la programación del inmovilizador.</p>
                  </div>
                </div>
                <div className="bg-zinc-950 p-3 border border-zinc-800 flex gap-3 items-start">
                  <span className="bg-[#FFFF00] text-black font-black px-2 py-0.5 text-xs shrink-0">P1</span>
                  <div>
                    <span className="font-black text-white block">CONEXIÓN OBD2 & SELECCIÓN DE MARCA</span>
                    <p className="text-zinc-400">Conectar scanner al puerto OBD2 del vehículo. Seleccionar Auto-Detect VIN o búsqueda manual de modelo/año.</p>
                  </div>
                </div>
                <div className="bg-zinc-950 p-3 border border-zinc-800 flex gap-3 items-start">
                  <span className="bg-[#FFFF00] text-black font-black px-2 py-0.5 text-xs shrink-0">P2</span>
                  <div>
                    <span className="font-black text-white block">LECTURA DE PIN CODE O BYPASS SECURITY</span>
                    <p className="text-zinc-400">Seleccionar "Read PIN / Immokey". Si es Chrysler/Dodge 2018+, conectar cable Bypass SGW 12+8 a la red CAN.</p>
                  </div>
                </div>
                <div className="bg-zinc-950 p-3 border border-zinc-800 flex gap-3 items-start">
                  <span className="bg-[#FFFF00] text-black font-black px-2 py-0.5 text-xs shrink-0">P3</span>
                  <div>
                    <span className="font-black text-white block">APRENDIZAJE DE CHIP Y CONTROL FOB</span>
                    <p className="text-zinc-400">Seguir instrucciones en pantalla (poner ignición ON/OFF). Al finalizar, probar arranque y encendido de motor.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pin' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#FFFF00] uppercase tracking-wider border-b border-zinc-800 pb-2">Referencia de Conversión BCM / PIN Code</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-zinc-950 p-3 border border-zinc-800">
                  <span className="font-black text-[#FFFF00] block">NISSAN NATS 5/6:</span>
                  <p className="text-zinc-300">Leer etiqueta de 5 dígitos del módulo BCM debajo del tablero. Convertir a PIN de 4 dígitos usando calculadora o Autel IM608.</p>
                </div>
                <div className="bg-zinc-950 p-3 border border-zinc-800">
                  <span className="font-black text-[#FFFF00] block">HYUNDAI / KIA:</span>
                  <p className="text-zinc-300">Extracción de PIN Code de 6 dígitos mediante lectura OBD2 o por código VIN en modelos pre-2017 / post-2017.</p>
                </div>
                <div className="bg-zinc-950 p-3 border border-zinc-800">
                  <span className="font-black text-[#FFFF00] block">CHRYSLER / JEEP / RAM:</span>
                  <p className="text-zinc-300">PIN Code de 4 dígitos extraído del módulo RFHUB o BCM. Requiere conector SGW 12+8 en modelos 2018+.</p>
                </div>
                <div className="bg-zinc-950 p-3 border border-zinc-800">
                  <span className="font-black text-[#FFFF00] block">VOLKSWAGEN IMMO4:</span>
                  <p className="text-zinc-300">Extracción de 7 Bytes de Component Security (CS) y PIN Code directamente del tablero o ECU de motor.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rf' && (
            <div className="space-y-4">
              <h3 className="text-sm font-black text-[#FFFF00] uppercase tracking-wider border-b border-zinc-800 pb-2">Frecuenciómetro & Clonación de Transponders</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-zinc-950 p-3 border border-zinc-800">
                  <span className="font-black text-[#FFFF00] block">FRECUENCIAS AMÉRICA (315 MHz vs 433 MHz):</span>
                  <p className="text-zinc-300">Apoyar control remoto sobre la bobina del frecuenciómetro en el camión. Verificar modulación FSK/ASK antes de cortar la espada.</p>
                </div>
                <div className="bg-zinc-950 p-3 border border-zinc-800">
                  <span className="font-black text-[#FFFF00] block">SUPER TRANSPONDER XHORSE (XT27A):</span>
                  <p className="text-zinc-300">Chip universal re-programable en campo compatible con ID11, ID12, ID13, ID46, ID47, ID48, ID4C, ID4D, ID70, ID8C.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            type="button"
            onClick={onClose} 
            className="bg-[#FFFF00] text-black font-black uppercase px-6 py-3 text-xs hover:bg-white transition-colors border-2 border-black"
          >
            Entendido / Cerrar Guía
          </button>
        </div>
      </div>
    </div>
  );
}

const WEEKLY_SERVICE_TRENDS = [
  { dia: 'LUN', duplicados: 5, aperturas: 3, programaciones: 4, ingresos: 1800 },
  { dia: 'MAR', duplicados: 7, aperturas: 2, programaciones: 6, ingresos: 2250 },
  { dia: 'MIÉ', duplicados: 4, aperturas: 5, programaciones: 3, ingresos: 1800 },
  { dia: 'JUE', duplicados: 8, aperturas: 4, programaciones: 7, ingresos: 2850 },
  { dia: 'VIE', duplicados: 10, aperturas: 6, programaciones: 8, ingresos: 3600 },
  { dia: 'SÁB', duplicados: 12, aperturas: 8, programaciones: 10, ingresos: 4500 },
  { dia: 'DOM', duplicados: 6, aperturas: 9, programaciones: 5, ingresos: 3000 },
];

const CATEGORY_BREAKDOWN = [
  { categoria: 'Duplicado Espada', cantidad: 42, monto: 6300 },
  { categoria: 'Smart Key Proximidad', cantidad: 28, monto: 7000 },
  { categoria: 'Apertura Lishi (Lockout)', cantidad: 35, monto: 3500 },
  { categoria: 'Programación BCM / NATS', cantidad: 19, monto: 2850 },
];

function DashboardAnalyticsChart() {
  const [chartType, setChartType] = useState<'trends' | 'categories'>('trends');

  return (
    <div className="mt-8 bg-zinc-950 border-4 border-zinc-800 p-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b-2 border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#FFFF00]" />
            <h3 className="text-xl font-black uppercase text-[#FFFF00] tracking-tighter">
              Análisis de Negocio & Tendencias de Servicio
            </h3>
          </div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
            Volumen de Servicios e Ingresos Semanales del Taller Móvil
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            type="button"
            onClick={() => setChartType('trends')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-black uppercase border-2 flex items-center justify-center gap-2 transition-colors ${
              chartType === 'trends' ? 'bg-[#FFFF00] text-black border-[#FFFF00]' : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Tendencia Semanal
          </button>
          <button 
            type="button"
            onClick={() => setChartType('categories')}
            className={`flex-1 md:flex-none px-4 py-2 text-xs font-black uppercase border-2 flex items-center justify-center gap-2 transition-colors ${
              chartType === 'categories' ? 'bg-[#FFFF00] text-black border-[#FFFF00]' : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Por Categoría
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="bg-black p-3.5 border-2 border-zinc-800">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Trabajos Esta Semana</span>
          <p className="text-xl font-black text-white uppercase mt-0.5">124 SERVICIOS</p>
          <span className="text-[10px] text-emerald-400 font-bold uppercase mt-1 block">↑ 18% vs semana pasada</span>
        </div>
        <div className="bg-black p-3.5 border-2 border-zinc-800">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Ingreso Semanal Est.</span>
          <p className="text-xl font-black text-[#FFFF00] uppercase mt-0.5">$19,800.00 USD</p>
          <span className="text-[10px] text-emerald-400 font-bold uppercase mt-1 block">Prom. $150.00 / Servicio</span>
        </div>
        <div className="bg-black p-3.5 border-2 border-zinc-800">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Servicio Más Solicitado</span>
          <p className="text-sm font-black text-white uppercase mt-0.5 truncate">Smart Key & Proximidad</p>
          <span className="text-[10px] text-zinc-400 font-bold uppercase mt-1 block">35% del volumen total</span>
        </div>
        <div className="bg-black p-3.5 border-2 border-zinc-800">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Tiempo Promedio Sitio</span>
          <p className="text-xl font-black text-white uppercase mt-0.5">22 MINUTOS</p>
          <span className="text-[10px] text-amber-400 font-bold uppercase mt-1 block">Ganzuado + Programación</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-[280px] w-full bg-black p-2 border-2 border-zinc-800 pt-4">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'trends' ? (
            <BarChart data={WEEKLY_SERVICE_TRENDS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="dia" stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 'bold' }} />
              <YAxis stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 'bold' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#FFFF00', borderWidth: '2px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value: any, name: any) => {
                  const labels: Record<string, string> = {
                    duplicados: 'Duplicados de Llave',
                    aperturas: 'Aperturas sin Llave',
                    programaciones: 'Programación Transponder',
                    ingresos: 'Ingresos Total ($)'
                  };
                  return [name === 'ingresos' ? `$${value} USD` : `${value} Trabajos`, labels[name] || name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#fff' }} />
              <Bar dataKey="duplicados" name="Duplicados" fill="#FFFF00" radius={[4, 4, 0, 0]} />
              <Bar dataKey="aperturas" name="Aperturas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="programaciones" name="Programación" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={CATEGORY_BREAKDOWN} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis type="number" stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 'bold' }} />
              <YAxis dataKey="categoria" type="category" stroke="#a1a1aa" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} width={120} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#FFFF00', borderWidth: '2px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value: any, name: any) => [name === 'monto' ? `$${value} USD` : `${value} Unidades`, name === 'monto' ? 'Ingreso Generado' : 'Cantidad Realizada']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#fff' }} />
              <Bar dataKey="cantidad" name="Cantidad Realizada" fill="#FFFF00" radius={[0, 4, 4, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function VoiceHelpModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-950 text-white p-6 border-4 border-[#FFFF00] shadow-[12px_12px_0px_#FFFF00] relative my-8">
        <button 
          onClick={onClose} 
          className="absolute -top-3 -right-3 bg-red-600 text-white w-9 h-9 font-black border-2 border-black flex items-center justify-center hover:bg-red-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b-4 border-zinc-800 pb-4 mb-6">
          <Radio className="w-8 h-8 text-[#FFFF00] animate-pulse" />
          <div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-[#FFFF00]">Comandos de Voz Manos Libres (Español)</h2>
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Opere el ERP sin tocar la pantalla mientras trabaja en el vehículo</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-black p-4 border-2 border-zinc-800">
            <h3 className="font-black text-[#FFFF00] uppercase text-sm mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4" /> Navegación Principal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="bg-zinc-900 p-2.5 border border-zinc-700">
                <span className="text-[#FFFF00] font-black block">"Nuevo cliente" / "Ingreso"</span>
                <span className="text-zinc-400 text-[10px]">Abre el formulario de registro</span>
              </div>
              <div className="bg-zinc-900 p-2.5 border border-zinc-700">
                <span className="text-[#FFFF00] font-black block">"Ir a dashboard" / "Panel"</span>
                <span className="text-zinc-400 text-[10px]">Abre inventario y diagnósticos</span>
              </div>
              <div className="bg-zinc-900 p-2.5 border border-zinc-700">
                <span className="text-[#FFFF00] font-black block">"Ir a historial"</span>
                <span className="text-zinc-400 text-[10px]">Muestra historial de servicios</span>
              </div>
            </div>
          </div>

          <div className="bg-black p-4 border-2 border-zinc-800">
            <h3 className="font-black text-[#FFFF00] uppercase text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Acciones Rápidas & Herramientas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-zinc-900 p-2.5 border border-zinc-700">
                <span className="text-[#FFFF00] font-black block">"Guía de campo" / "Abrir guía"</span>
                <span className="text-zinc-400 text-[10px]">Abre el manual Lishi/OBD2 en sitio</span>
              </div>
              <div className="bg-zinc-900 p-2.5 border border-zinc-700">
                <span className="text-[#FFFF00] font-black block">"Cobrar" / "Procesar pago"</span>
                <span className="text-zinc-400 text-[10px]">Inicia el cobro de $150 USD</span>
              </div>
              <div className="bg-zinc-900 p-2.5 border border-zinc-700">
                <span className="text-[#FFFF00] font-black block">"Escanear" / "Código QR"</span>
                <span className="text-zinc-400 text-[10px]">Abre escáner de llaves/barras</span>
              </div>
              <div className="bg-[#FFFF00] text-black p-2.5 border border-black font-bold">
                <span className="font-black block text-xs">"Nueva pieza" / "Añadir item"</span>
                <span className="text-zinc-800 text-[10px]">Abre diálogo de inventario</span>
              </div>
            </div>
          </div>

          <div className="bg-black p-4 border-2 border-zinc-800">
            <h3 className="font-black text-[#FFFF00] uppercase text-sm mb-3 flex items-center gap-2">
              <Car className="w-4 h-4" /> Fichas Técnicas por Marca de Auto
            </h3>
            <p className="text-zinc-400 mb-2">Diga el nombre de la marca para cargar automáticamente las especificaciones técnicas de cerrajería:</p>
            <div className="flex flex-wrap gap-1.5">
              {['"Toyota"', '"Honda"', '"Nissan"', '"Ford"', '"Chevrolet"', '"Hyundai"', '"Jeep"', '"Volkswagen"'].map((brand, idx) => (
                <span key={idx} className="bg-zinc-900 border border-zinc-700 text-[#FFFF00] px-2.5 py-1 font-black text-[11px] uppercase">
                  {brand}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-amber-950/40 p-3 border border-amber-600/50 text-amber-200">
            <span className="text-amber-400 font-black block uppercase text-[11px]">💡 Nota de Uso Dictado:</span>
            Cualquier otra frase que no coincida con un comando de navegación se agregará automáticamente como descripción del problema del cliente o reporte técnico.
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            type="button"
            onClick={onClose} 
            className="bg-[#FFFF00] text-black font-black uppercase px-6 py-3 text-xs hover:bg-white transition-colors border-2 border-black"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

interface GeocodeResult {
  lat: number;
  lon: number;
  displayName: string;
  status: 'loading' | 'success' | 'error' | 'idle';
}

function MiniLocationMap({ 
  location, 
  clientName, 
  carInfo
}: { 
  location: string; 
  clientName?: string; 
  carInfo?: string;
}) {
  const [geoResult, setGeoResult] = useState<GeocodeResult>({
    lat: 25.7617,
    lon: -80.1918,
    displayName: location || 'Miami, FL',
    status: 'idle'
  });
  const [showFullMapModal, setShowFullMapModal] = useState(false);

  const geocodeAddress = useCallback((addressToGeocode: string) => {
    if (!addressToGeocode || addressToGeocode.trim().length < 3) {
      setGeoResult({
        lat: 25.7617,
        lon: -80.1918,
        displayName: 'Miami, FL (Coordenadas Base HQ)',
        status: 'idle'
      });
      return;
    }

    setGeoResult(prev => ({ ...prev, status: 'loading' }));

    const query = (addressToGeocode.toLowerCase().includes('fl') || addressToGeocode.toLowerCase().includes('miami'))
      ? addressToGeocode
      : `${addressToGeocode}, Miami, FL`;

    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`, {
      headers: {
        'Accept': 'application/json'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          setGeoResult({
            lat,
            lon,
            displayName: data[0].display_name,
            status: 'success'
          });
        } else {
          setGeoResult({
            lat: 25.7617,
            lon: -80.1918,
            displayName: addressToGeocode,
            status: 'error'
          });
        }
      })
      .catch(err => {
        console.error("Geocoding error:", err);
        setGeoResult({
          lat: 25.7617,
          lon: -80.1918,
          displayName: addressToGeocode,
          status: 'error'
        });
      });
  }, []);

  useEffect(() => {
    geocodeAddress(location);
  }, [location, geocodeAddress]);

  const distanceMiles = useMemo(() => {
    if (!geoResult.lat || !geoResult.lon) return '4.5';
    const R = 3958.8;
    const dLat = (geoResult.lat - 25.7617) * Math.PI / 180;
    const dLon = (geoResult.lon - (-80.1918)) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(25.7617 * Math.PI / 180) * Math.cos(geoResult.lat * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = R * c;
    return dist > 0.1 ? dist.toFixed(1) : '0.8';
  }, [geoResult.lat, geoResult.lon]);

  const etaMinutes = useMemo(() => {
    const dist = parseFloat(distanceMiles);
    return Math.max(5, Math.round(dist * 2.2 + 6));
  }, [distanceMiles]);

  const delta = 0.005;
  const bbox = `${geoResult.lon - delta},${geoResult.lat - delta},${geoResult.lon + delta},${geoResult.lat + delta}`;
  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${geoResult.lat},${geoResult.lon}`;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${geoResult.lat},${geoResult.lon}`;
  const wazeUrl = `https://waze.com/ul?ll=${geoResult.lat},${geoResult.lon}&navigate=yes`;
  const appleMapsUrl = `https://maps.apple.com/?daddr=${geoResult.lat},${geoResult.lon}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Hola! Soy el técnico cerrajero de Miami Auto-Key. Voy en camino a atender tu ${carInfo || 'vehículo'} en ${location}. ETA aproximado: ${etaMinutes} minutos.`)}`;

  return (
    <div className="bg-black border-2 border-[#FFFF00] p-3 text-white">
      {/* Header & Status Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 mb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#FFFF00] animate-bounce shrink-0" />
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-[#FFFF00] block">
              Mapa de Ubicación & Geocodificación GPS
            </span>
            <span className="text-[10px] text-zinc-400 font-bold uppercase truncate max-w-[280px] block">
              {location}
            </span>
          </div>
        </div>

        {/* Geocoding Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {geoResult.status === 'loading' && (
            <span className="bg-amber-500 text-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider animate-pulse flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> Geocodificando...
            </span>
          )}
          {geoResult.status === 'success' && (
            <span className="bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> GPS Verificado
            </span>
          )}
          {geoResult.status === 'error' && (
            <span className="bg-zinc-800 text-amber-400 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border border-amber-600/40">
              Coordenadas Aproximadas (Miami)
            </span>
          )}

          <button
            type="button"
            onClick={() => geocodeAddress(location)}
            className="text-zinc-400 hover:text-[#FFFF00] transition-colors p-1"
            title="Recargar Geocodificación"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Map Box & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* OpenStreetMap Dynamic Iframe Container */}
        <div className="md:col-span-2 relative bg-zinc-950 border border-zinc-800 overflow-hidden group min-h-[160px]">
          <iframe 
            title="Mapa de Ubicación"
            width="100%" 
            height="100%" 
            src={embedUrl}
            className="w-full h-[160px] md:h-[180px] border-0 grayscale invert opacity-90 contrast-125 group-hover:grayscale-0 group-hover:invert-0 transition-all duration-300"
          />
          
          {/* Overlay Pin Tag */}
          <div className="absolute top-2 left-2 bg-black/90 text-[#FFFF00] px-2 py-1 border border-[#FFFF00] text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <LocateFixed className="w-3 h-3 text-red-500 animate-ping" />
            <span>Vehículo Varado</span>
          </div>

          <button 
            type="button"
            onClick={() => setShowFullMapModal(true)}
            className="absolute bottom-2 right-2 bg-black text-white hover:text-[#FFFF00] p-1.5 border border-zinc-700 text-[10px] font-black uppercase flex items-center gap-1"
            title="Ampliar Mapa"
          >
            <Maximize2 className="w-3.5 h-3.5" /> Ampliar
          </button>
        </div>

        {/* GPS Metrics & Launch Buttons */}
        <div className="flex flex-col justify-between space-y-2 text-xs">
          <div className="space-y-1.5 bg-zinc-950 p-2.5 border border-zinc-800">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400 font-bold uppercase">Coordenadas Exactas:</span>
              <span className="text-white font-mono font-bold">{geoResult.lat.toFixed(4)}°, {geoResult.lon.toFixed(4)}°</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400 font-bold uppercase">Distancia desde Taller:</span>
              <span className="text-[#FFFF00] font-black">{distanceMiles} Millas</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-zinc-400 font-bold uppercase">Tiempo Estimado ETA:</span>
              <span className="text-emerald-400 font-black">~{etaMinutes} Mins</span>
            </div>
          </div>

          {/* Direct Navigation Links */}
          <div className="grid grid-cols-2 gap-1.5">
            <a 
              href={googleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#FFFF00] text-black font-black p-2 text-[10px] uppercase flex items-center justify-center gap-1 hover:bg-white transition-colors border border-black"
            >
              <Navigation className="w-3.5 h-3.5" /> Google Maps
            </a>
            <a 
              href={wazeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-sky-500 text-white font-black p-2 text-[10px] uppercase flex items-center justify-center gap-1 hover:bg-sky-400 transition-colors border border-sky-600"
            >
              <Compass className="w-3.5 h-3.5" /> Waze GPS
            </a>
            <a 
              href={appleMapsUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-zinc-800 text-white font-black p-2 text-[10px] uppercase flex items-center justify-center gap-1 hover:bg-zinc-700 transition-colors border border-zinc-600"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Apple Maps
            </a>
            <a 
              href={whatsappUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-emerald-600 text-white font-black p-2 text-[10px] uppercase flex items-center justify-center gap-1 hover:bg-emerald-500 transition-colors border border-emerald-700"
            >
              <Send className="w-3.5 h-3.5" /> WhatsApp ETA
            </a>
          </div>
        </div>
      </div>

      {/* Full Map Modal */}
      {showFullMapModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md">
          <div className="w-full max-w-4xl h-[85vh] bg-zinc-950 border-4 border-[#FFFF00] p-4 flex flex-col relative">
            <button 
              onClick={() => setShowFullMapModal(false)}
              className="absolute -top-3 -right-3 bg-red-600 text-white w-9 h-9 font-black border-2 border-black flex items-center justify-center hover:bg-red-500"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex justify-between items-center pb-3 border-b-2 border-zinc-800 mb-3">
              <div>
                <h3 className="text-lg font-black text-[#FFFF00] uppercase">Mapa Interactivo GPS - Vehículo Varado</h3>
                <p className="text-xs text-zinc-400 font-bold uppercase">{location} ({clientName || 'Cliente'})</p>
              </div>
              <div className="flex gap-2">
                <a 
                  href={googleMapsUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-[#FFFF00] text-black px-4 py-2 font-black text-xs uppercase flex items-center gap-2 hover:bg-white"
                >
                  <Navigation className="w-4 h-4" /> Abrir Navegación Google
                </a>
              </div>
            </div>
            <div className="flex-1 w-full bg-black border-2 border-zinc-800">
              <iframe 
                title="Mapa de Ubicación Completo"
                width="100%" 
                height="100%" 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${geoResult.lon - 0.015},${geoResult.lat - 0.01},${geoResult.lon + 0.015},${geoResult.lat + 0.01}&layer=mapnik&marker=${geoResult.lat},${geoResult.lon}`}
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SupplierOrderModal({ 
  lowStockItems, 
  allInventory, 
  onClose, 
  onConfirmRestock 
}: { 
  lowStockItems: InventoryItem[]; 
  allInventory: InventoryItem[]; 
  onClose: () => void; 
  onConfirmRestock: (restockMap: Record<string, number>) => void; 
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    lowStockItems.forEach(item => {
      initial[item.id] = 10;
    });
    return initial;
  });

  const [notes, setNotes] = useState('Entregar con prioridad urgente para Taller Móvil. Enviar guía de rastreo por WhatsApp.');
  const [supplierName, setSupplierName] = useState('Distribuidora Cerrajera Florida Keys & Transponders');
  const [copied, setCopied] = useState(false);
  const [selectedExtraItemId, setSelectedExtraItemId] = useState<string>('');

  const handleAddExtraItem = (itemId: string) => {
    if (!itemId) return;
    setQuantities(prev => ({
      ...prev,
      [itemId]: prev[itemId] || 10
    }));
    setSelectedExtraItemId('');
  };

  const handleQuantityChange = (id: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(1, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const handleManualQuantity = (id: string, val: string) => {
    const parsed = parseInt(val, 10);
    setQuantities(prev => ({
      ...prev,
      [id]: isNaN(parsed) || parsed < 1 ? 1 : parsed
    }));
  };

  const handleRemoveItem = (id: string) => {
    setQuantities(prev => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const orderItemsList = Object.keys(quantities).map(id => {
    const item = allInventory.find(i => i.id === id);
    return {
      item,
      qty: quantities[id] || 0
    };
  }).filter(entry => entry.item !== undefined) as { item: InventoryItem; qty: number }[];

  const totalEstimatedCost = orderItemsList.reduce((sum, entry) => {
    const wholesalePrice = Math.round(entry.item.price * 0.6);
    return sum + (wholesalePrice * entry.qty);
  }, 0);

  const generateFormattedOrderText = () => {
    const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    let text = `📦 *ORDEN DE REPOSICIÓN DE INVENTARIO - MIAMI AUTO-KEY ERP*\n`;
    text += `*Proveedor:* ${supplierName}\n`;
    text += `*Fecha de Pedido:* ${dateStr}\n\n`;
    text += `*LISTA DE PRODUCTOS Y CANTIDADES SOLICITADAS:*\n`;
    orderItemsList.forEach(({ item, qty }, idx) => {
      const wholesale = Math.round(item.price * 0.6);
      text += `${idx + 1}. *${item.name}* [${item.type}]\n`;
      text += `   - Stock Actual: ${item.stock} u. | *Pedido Solicitado: ${qty} u.*\n`;
      text += `   - Costo Est. Mayorista C/U: $${wholesale} USD | Subtotal: $${wholesale * qty} USD\n`;
    });
    text += `\n💰 *TOTAL ESTIMADO INVERSIÓN RESTOCK:* $${totalEstimatedCost.toFixed(2)} USD\n`;
    if (notes) {
      text += `📝 *Instrucciones:* ${notes}\n`;
    }
    text += `\n_Favor confirmar disponibilidad y tiempo de entrega en Miami, FL._`;
    return text;
  };

  const handleCopy = () => {
    const text = generateFormattedOrderText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendWhatsApp = () => {
    const text = generateFormattedOrderText();
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleConfirmOrder = () => {
    onConfirmRestock(quantities);
  };

  const availableItemsToAdd = allInventory.filter(i => !(i.id in quantities));

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/90 p-3 md:p-6 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-zinc-950 text-white p-4 md:p-6 border-4 border-[#FFFF00] shadow-[12px_12px_0px_#FFFF00] relative my-6">
        <button 
          onClick={onClose} 
          className="absolute -top-3 -right-3 bg-red-600 text-white w-9 h-9 font-black border-2 border-black flex items-center justify-center hover:bg-red-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-4 border-zinc-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-[#FFFF00] text-black p-2 border-2 border-black animate-pulse">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-[#FFFF00]">
                  Generar Pedido a Proveedor
                </h2>
                <span className="bg-red-600 text-white font-black text-xs px-2 py-0.5 border border-black uppercase">
                  {lowStockItems.length} Ítems con Stock &lt; 3
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">
                Orden de Compra Pre-llenada para Reposición de Insumos Cerrajeros
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSendWhatsApp}
              className="flex-1 sm:flex-none bg-emerald-600 text-white px-4 py-2.5 font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-emerald-500 border-2 border-black transition-colors"
            >
              <Send className="w-4 h-4" /> Enviar WhatsApp
            </button>
            <button
              onClick={handleCopy}
              className="flex-1 sm:flex-none bg-zinc-800 text-white px-4 py-2.5 font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-zinc-700 border-2 border-zinc-600 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copiado!' : 'Copiar Texto'}
            </button>
          </div>
        </div>

        {/* Supplier Info & Notes Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 bg-black p-4 border-2 border-zinc-800">
          <div className="md:col-span-2">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
              Nombre / Empresa del Proveedor
            </label>
            <input 
              type="text" 
              value={supplierName}
              onChange={e => setSupplierName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 p-2 text-xs font-bold text-white uppercase focus:border-[#FFFF00] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
              Añadir Otro Ítem al Pedido
            </label>
            <select
              value={selectedExtraItemId}
              onChange={e => handleAddExtraItem(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 p-2 text-xs font-bold text-[#FFFF00] uppercase focus:border-[#FFFF00] focus:outline-none"
            >
              <option value="">+ Seleccionar de Catálogo...</option>
              {availableItemsToAdd.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} (Stock: {item.stock})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-3 mb-6 max-h-[320px] overflow-y-auto pr-1">
          {orderItemsList.length === 0 ? (
            <div className="bg-black p-8 text-center border-2 border-dashed border-zinc-800">
              <PackageCheck className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-black uppercase text-zinc-400">No hay ítems en la lista de pedido.</p>
              <p className="text-xs text-zinc-600 mt-1">Seleccione un ítem del menú superior para agregarlo al pedido.</p>
            </div>
          ) : (
            orderItemsList.map(({ item, qty }) => {
              const wholesale = Math.round(item.price * 0.6);
              const subtotal = wholesale * qty;
              const isCriticallyLow = item.stock < 3;

              return (
                <div 
                  key={item.id} 
                  className={`bg-black p-3.5 border-2 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 ${
                    isCriticallyLow ? 'border-red-600/80 bg-red-950/20' : 'border-zinc-800'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-white uppercase">{item.name}</span>
                      {isCriticallyLow && (
                        <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 uppercase tracking-wider animate-pulse">
                          ⚠️ Stock Crítico ({item.stock} u.)
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400 mt-1">
                      <span>Tipo: <strong className="text-[#FFFF00]">{item.type}</strong></span>
                      <span>Stock Actual: <strong className={isCriticallyLow ? 'text-red-400 font-bold' : 'text-white'}>{item.stock} u.</strong></span>
                      <span>Costo Est. Mayorista: <strong className="text-emerald-400">${wholesale} USD</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 bg-zinc-900 p-1 border border-zinc-700">
                      <button 
                        type="button"
                        onClick={() => handleQuantityChange(item.id, -1)}
                        className="bg-black text-white w-7 h-7 font-black flex items-center justify-center hover:bg-zinc-800"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        min="1"
                        value={qty}
                        onChange={e => handleManualQuantity(item.id, e.target.value)}
                        className="w-12 bg-black text-center font-black text-sm text-[#FFFF00] border-0 focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => handleQuantityChange(item.id, 1)}
                        className="bg-black text-white w-7 h-7 font-black flex items-center justify-center hover:bg-zinc-800"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase block">Subtotal</span>
                      <span className="text-sm font-black text-[#FFFF00]">${subtotal} USD</span>
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-zinc-500 hover:text-red-500 p-1 transition-colors"
                      title="Quitar del pedido"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Total Cost & Instructions */}
        <div className="bg-zinc-900 p-4 border-2 border-zinc-800 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">
              Instrucciones / Notas Especiales para el Proveedor
            </label>
            <input 
              type="text" 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full bg-black border border-zinc-700 p-2 text-xs font-bold text-white uppercase focus:border-[#FFFF00] focus:outline-none"
              placeholder="EJ. ENTREGAR DIRECTAMENTE EN EL TALLER MÓVIL..."
            />
          </div>

          <div className="bg-black p-3 border-2 border-[#FFFF00] text-right shrink-0 w-full md:w-auto">
            <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">Inversión Estimada en Reposición</span>
            <span className="text-2xl font-black text-[#FFFF00] uppercase">${totalEstimatedCost.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-3 border-t-2 border-zinc-800">
          <button 
            type="button"
            onClick={onClose} 
            className="w-full sm:w-auto bg-zinc-900 text-zinc-400 hover:text-white px-6 py-3 font-black text-xs uppercase border border-zinc-700 transition-colors"
          >
            Cancelar
          </button>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button 
              type="button"
              onClick={handleSendWhatsApp}
              className="bg-emerald-600 text-white font-black uppercase px-5 py-3 text-xs flex items-center justify-center gap-2 hover:bg-emerald-500 transition-colors border-2 border-black"
            >
              <Send className="w-4 h-4" /> Enviar por WhatsApp
            </button>

            <button 
              type="button"
              onClick={handleConfirmOrder}
              disabled={orderItemsList.length === 0}
              className="bg-[#FFFF00] disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black uppercase px-6 py-3 text-xs flex items-center justify-center gap-2 hover:bg-white transition-colors border-2 border-black shadow-[2px_2px_0px_#000]"
            >
              <PackageCheck className="w-4 h-4" /> Confirmar Recepción (+Stock)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'intake' | 'dashboard' | 'history'>('intake');
  
  // LocalStorage-backed state with resilient fallbacks
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem('miami_autokey_clients');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('miami_autokey_inventory');
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY;
    } catch {
      return INITIAL_INVENTORY;
    }
  });

  const [history, setHistory] = useState<DiagnosticRecord[]>(() => {
    try {
      const saved = localStorage.getItem('miami_autokey_history');
      return saved ? JSON.parse(saved) : INITIAL_HISTORY;
    } catch {
      return INITIAL_HISTORY;
    }
  });

  const [activeClient, setActiveClient] = useState<Client | null>(() => {
    try {
      const saved = localStorage.getItem('miami_autokey_active_client');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [revenue, setRevenue] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('miami_autokey_revenue');
      return saved ? JSON.parse(saved) : 1450.50;
    } catch {
      return 1450.50;
    }
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [lastCreatedRecord, setLastCreatedRecord] = useState<DiagnosticRecord | null>(null);
  const [selectedTicketRecord, setSelectedTicketRecord] = useState<DiagnosticRecord | null>(null);

  const [scannerOpen, setScannerOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [addInventoryOpen, setAddInventoryOpen] = useState(false);

  // Diagnostic state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  // Sync state changes to localStorage for roadside offline persistence
  useEffect(() => {
    try {
      localStorage.setItem('miami_autokey_clients', JSON.stringify(clients));
    } catch (e) {
      console.error('Storage sync error (clients):', e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem('miami_autokey_inventory', JSON.stringify(inventory));
    } catch (e) {
      console.error('Storage sync error (inventory):', e);
    }
  }, [inventory]);

  useEffect(() => {
    try {
      localStorage.setItem('miami_autokey_history', JSON.stringify(history));
    } catch (e) {
      console.error('Storage sync error (history):', e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem('miami_autokey_revenue', JSON.stringify(revenue));
    } catch (e) {
      console.error('Storage sync error (revenue):', e);
    }
  }, [revenue]);

  useEffect(() => {
    try {
      if (activeClient) {
        localStorage.setItem('miami_autokey_active_client', JSON.stringify(activeClient));
      } else {
        localStorage.removeItem('miami_autokey_active_client');
      }
    } catch (e) {
      console.error('Storage sync error (activeClient):', e);
    }
  }, [activeClient]);

  // Hands-Free Voice Control state
  const [isVoiceModeEnabled, setIsVoiceModeEnabled] = useState(false);
  const isVoiceModeEnabledRef = useRef(false);
  const activeClientRef = useRef<Client | null>(activeClient);
  const [voiceToastMessage, setVoiceToastMessage] = useState<string | null>(null);
  const [showVoiceHelpModal, setShowVoiceHelpModal] = useState(false);

  useEffect(() => {
    activeClientRef.current = activeClient;
  }, [activeClient]);

  // Auto-dismiss voice toast notification
  useEffect(() => {
    if (voiceToastMessage) {
      const timer = setTimeout(() => {
        setVoiceToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [voiceToastMessage]);

  // Stripe / Payment modal
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const [showFieldGuideModal, setShowFieldGuideModal] = useState(false);
  const [showSupplierOrderModal, setShowSupplierOrderModal] = useState(false);

  const lowStockItems = useMemo(() => inventory.filter(item => item.stock < 3), [inventory]);

  const handleConfirmRestock = (restockMap: Record<string, number>) => {
    setInventory(prev => prev.map(item => {
      if (item.id in restockMap) {
        return {
          ...item,
          stock: item.stock + restockMap[item.id]
        };
      }
      return item;
    }));
    setShowSupplierOrderModal(false);
    setVoiceToastMessage(`✅ REPOSICIÓN COMPLETADA: Se ha incrementado el stock de los ítems ordenados.`);
  };

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    carInfo: '',
    issue: '',
    location: ''
  });

  const [selectedPreset, setSelectedPreset] = useState<CarPreset | null>(null);

  const handlePresetSelect = (modelName: string) => {
    const preset = PRESET_CAR_MODELS.find(p => p.model === modelName);
    if (preset) {
      setSelectedPreset(preset);
      setFormData(prev => ({
        ...prev,
        carInfo: preset.model,
        issue: `[FICHA TÉCNICA: Chip ${preset.chip} | Espada ${preset.keyType} | Freq ${preset.freq}]\n${preset.defaultIssue}`
      }));
    } else {
      setSelectedPreset(null);
    }
  };

  // Voice Command Processor
  const processVoiceCommand = (rawTranscript: string) => {
    if (!rawTranscript) return;
    const text = rawTranscript.toLowerCase().trim();
    let handledCommand = false;

    // Navigation Commands
    if (text.includes('nuevo cliente') || text.includes('crear cliente') || text.includes('formulario') || text.includes('ir a cliente') || text.includes('ingreso')) {
      setView('intake');
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Ir a "Nuevo Cliente"`);
      handledCommand = true;
    } else if (text.includes('dashboard') || text.includes('panel') || text.includes('inventario') || text.includes('ver inventario') || text.includes('ir a panel')) {
      setView('dashboard');
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Ir a "Dashboard e Inventario"`);
      handledCommand = true;
    } else if (text.includes('historial') || text.includes('ver historial') || text.includes('ir a historial') || text.includes('registros')) {
      setView('history');
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Ir a "Historial de Servicios"`);
      handledCommand = true;
    } 
    // Modals & Action Commands
    else if (text.includes('guía de campo') || text.includes('abrir guía') || text.includes('guía') || text.includes('manual')) {
      setShowFieldGuideModal(true);
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Abrir "Guía de Campo"`);
      handledCommand = true;
    } else if (text.includes('cerrar guía') || text.includes('cerrar manual')) {
      setShowFieldGuideModal(false);
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Cerrar "Guía de Campo"`);
      handledCommand = true;
    } else if (text.includes('nueva pieza') || text.includes('añadir inventario') || text.includes('nuevo item') || text.includes('agregar pieza')) {
      setAddInventoryOpen(true);
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Abrir "Añadir Inventario"`);
      handledCommand = true;
    } else if (text.includes('generar pedido') || text.includes('pedido proveedor') || text.includes('pedido de compra') || text.includes('reabastecer') || text.includes('orden de compra')) {
      setShowSupplierOrderModal(true);
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Abrir "Generar Pedido Proveedor"`);
      handledCommand = true;
    } else if (text.includes('cobrar') || text.includes('procesar pago') || text.includes('stripe')) {
      handleStripePayment();
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: "Cobrar Servicio $150 USD"`);
      handledCommand = true;
    } else if (text.includes('escanear') || text.includes('escáner') || text.includes('código qr') || text.includes('escanear qr')) {
      setScannerOpen(true);
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Abrir "Escáner QR"`);
      handledCommand = true;
    }
    // Presets
    else if (text.includes('toyota')) {
      handlePresetSelect('2003 TOYOTA COROLLA');
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Ficha Seleccionada "Toyota Corolla"`);
      handledCommand = true;
    } else if (text.includes('honda')) {
      handlePresetSelect('2010 HONDA CIVIC');
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Ficha Seleccionada "Honda Civic"`);
      handledCommand = true;
    } else if (text.includes('nissan')) {
      handlePresetSelect('2012 NISSAN SENTRA');
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Ficha Seleccionada "Nissan Sentra"`);
      handledCommand = true;
    } else if (text.includes('ford')) {
      handlePresetSelect('2008 FORD F-150');
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Ficha Seleccionada "Ford F-150"`);
      handledCommand = true;
    } else if (text.includes('chevy') || text.includes('chevrolet')) {
      handlePresetSelect('2015 CHEVROLET CAMARO');
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Ficha Seleccionada "Chevrolet Camaro"`);
      handledCommand = true;
    } else if (text.includes('hyundai')) {
      handlePresetSelect('2018 HYUNDAI ELANTRA');
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Ficha Seleccionada "Hyundai Elantra"`);
      handledCommand = true;
    } else if (text.includes('jeep')) {
      handlePresetSelect('2016 JEEP GRAND CHEROKEE');
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Ficha Seleccionada "Jeep Grand Cherokee"`);
      handledCommand = true;
    } else if (text.includes('volkswagen') || text.includes('vw')) {
      handlePresetSelect('2014 VOLKSWAGEN JETTA');
      setVoiceToastMessage(`🎙️ COMANDO DE VOZ: Ficha Seleccionada "Volkswagen Jetta"`);
      handledCommand = true;
    }

    // Dictation into form if not a navigation command
    if (!handledCommand && rawTranscript) {
      setFormData(prev => ({
        ...prev,
        issue: prev.issue ? `${prev.issue} | ${rawTranscript.toUpperCase()}` : rawTranscript.toUpperCase()
      }));

      if (activeClientRef.current) {
        const currentActive = activeClientRef.current;
        const updatedIssue = currentActive.issue 
          ? `${currentActive.issue} | ${rawTranscript.toUpperCase()}` 
          : rawTranscript.toUpperCase();
        const updatedClient: Client = { ...currentActive, issue: updatedIssue };
        setActiveClient(updatedClient);
        setClients(prev => prev.map(c => c.id === currentActive.id ? updatedClient : c));
      }
      setVoiceToastMessage(`🎙️ DICTADO AGREGADO: "${rawTranscript.toUpperCase()}"`);
    }
  };

  // Speech Recognition setup
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    isVoiceModeEnabledRef.current = isVoiceModeEnabled;
  }, [isVoiceModeEnabled]);

  useEffect(() => {
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionClass) {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'es-US'; // Default Spanish (Miami)

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          processVoiceCommand(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        // Auto-restart if continuous hands-free mode is enabled
        if (isVoiceModeEnabledRef.current) {
          setTimeout(() => {
            try {
              recognitionRef.current?.start();
            } catch (e) {
              console.error("Auto restart speech error:", e);
            }
          }, 400);
        }
      };

      recognitionRef.current = recognition;

      return () => {
        try {
          recognition.abort();
        } catch (e) {
          console.error("Speech abort error:", e);
        }
      };
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const toggleSpeechRecognition = () => {
    if (!speechSupported) {
      alert("El navegador no soporta reconocimiento de voz directo. Puedes escribir el problema manualmente.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error("Start speech failed:", e);
      }
    }
  };

  const toggleVoiceMode = () => {
    if (!speechSupported) {
      alert("El navegador no soporta reconocimiento de voz directo.");
      return;
    }
    const nextMode = !isVoiceModeEnabled;
    setIsVoiceModeEnabled(nextMode);
    isVoiceModeEnabledRef.current = nextMode;

    if (nextMode) {
      try {
        recognitionRef.current?.start();
        setVoiceToastMessage('🎙️ MODO MANOS LIBRES ACTIVADO: Escuchando órdenes en español...');
      } catch (e) {
        console.error("Start speech mode error:", e);
      }
    } else {
      try {
        recognitionRef.current?.stop();
        setVoiceToastMessage('🎙️ MODO MANOS LIBRES PAUSADO');
      } catch (e) {
        console.error("Stop speech mode error:", e);
      }
    }
  };

  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: Date.now().toString(),
      ...formData,
      timestamp: new Date().toLocaleString()
    };
    setClients(prev => [...prev, newClient]);
    setActiveClient(newClient);
    setView('dashboard');
  };

  const handleSkip = () => {
    const defaultClient: Client = {
      id: Date.now().toString(),
      firstName: 'CLIENTE',
      lastName: 'GENÉRICO',
      phone: 'N/A',
      email: 'N/A',
      carInfo: formData.carInfo || 'VEHÍCULO NO ESPECIFICADO',
      issue: formData.issue || 'DIAGNÓSTICO RÁPIDO Y PROGRAMACIÓN DE LLAVE',
      timestamp: new Date().toLocaleString()
    };
    setActiveClient(defaultClient);
    setView('dashboard');
  };

  const handleUpdateClientNotes = (newNotes: string) => {
    if (!activeClient) return;
    const updatedClient: Client = { ...activeClient, notes: newNotes };
    setActiveClient(updatedClient);
    setClients(prev => prev.map(c => c.id === activeClient.id ? updatedClient : c));
  };

  const handleAppendQuickNote = (tag: string) => {
    if (!activeClient) return;
    const currentNotes = activeClient.notes || '';
    const updatedNotes = currentNotes ? `${currentNotes} • ${tag}` : tag;
    handleUpdateClientNotes(updatedNotes);
  };

  const handleSell = (id: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id && item.stock > 0) {
        setRevenue(r => r + item.price);
        return { ...item, stock: item.stock - 1 };
      }
      return item;
    }));
  };

  const handleAddInventory = (newItem: Omit<InventoryItem, 'id'>) => {
    const itemWithId: InventoryItem = {
      id: Date.now().toString(),
      ...newItem
    };
    setInventory(prev => [itemWithId, ...prev]);
  };

  const handleStripePayment = () => {
    const serviceCost = 150.00;
    setRevenue(r => r + serviceCost);

    const recordClient = activeClient 
      ? `${activeClient.firstName} ${activeClient.lastName}` 
      : 'CLIENTE MOSTRADOR';
    const recordCar = activeClient?.carInfo || 'VEHÍCULO NO ESPECIFICADO';
    const recordIssue = activeClient?.issue || 'DIAGNÓSTICO Y COPIA DE LLAVE';

    const newHistoryRecord: DiagnosticRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      client: recordClient,
      car: recordCar,
      issue: recordIssue,
      notes: activeClient?.notes,
      aiDiagnosis: capturedImage 
        ? 'IMAGEN CAPTURADA: CHIP TRANSPONDER E INMOVILIZADOR COMPATIBLE IDENTIFICADOS. CÓDIGO GENERADO EXITOSAMENTE.'
        : 'DIAGNÓSTICO MAESTRO REALIZADO. CÓDIGO BCM Y TRANSPONDER PROGRAMADOS SIN ADAPTACIONES EXTRA.',
      status: 'ÉXITO',
      image: capturedImage
    };

    setHistory(prev => [newHistoryRecord, ...prev]);
    setLastCreatedRecord(newHistoryRecord);
    setShowPaymentSuccess(true);
  };

  const exportCSV = () => {
    const headers = ["ID,Fecha,Cliente,Vehiculo,Problema,NotasTecnico,Diagnostico,Estado\n"];
    const rows = history.map(h => 
      `"${h.id}","${h.date}","${h.client}","${h.car}","${h.issue.replace(/"/g, '""')}","${(h.notes || '').replace(/"/g, '""')}","${h.aiDiagnosis.replace(/"/g, '""')}","${h.status}"`
    );
    const blob = new Blob([headers.concat(rows.join("\n")).join("")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Miami_AutoKey_Historial_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reorderCount = inventory.filter(i => i.stock <= 3).length;

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.barcode === searchQuery
  );

  const filteredHistory = history.filter(record => 
    record.client.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
    record.car.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
    record.issue.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
    record.aiDiagnosis.toLowerCase().includes(historySearchQuery.toLowerCase())
  );

  const handleScan = (decodedText: string) => {
    setSearchQuery(decodedText);
    setScannerOpen(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-black text-white font-sans overflow-hidden selection:bg-[#FFFF00] selection:text-black">
      {scannerOpen && <BarcodeScannerModal onScan={handleScan} onClose={() => setScannerOpen(false)} />}
      {cameraOpen && <CameraCaptureModal onCapture={(imgUrl) => setCapturedImage(imgUrl)} onClose={() => setCameraOpen(false)} />}
      {addInventoryOpen && <AddInventoryModal onAdd={handleAddInventory} onClose={() => setAddInventoryOpen(false)} />}

      {/* Stripe Payment Success Modal */}
      {showPaymentSuccess && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#FFFF00] text-black border-8 border-black p-8 max-w-md w-full text-center shadow-[12px_12px_0px_#fff]">
            <CheckCircle className="w-20 h-20 mx-auto mb-4 text-black animate-bounce" />
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">¡Pago Procesado!</h2>
            <p className="text-xl font-bold uppercase tracking-wider mb-2">Servicio de $150.00 USD Cobrado con Éxito</p>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-800 mb-6">Registrado en Historial y Ganancia Actualizada</p>

            <div className="flex flex-col gap-3">
              {lastCreatedRecord && (
                <button
                  onClick={() => setSelectedTicketRecord(lastCreatedRecord)}
                  className="w-full bg-black text-[#FFFF00] py-3.5 px-4 font-black uppercase text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-zinc-900 transition-colors border-2 border-black"
                >
                  <Printer className="w-5 h-5" /> Imprimir Ticket de Servicio
                </button>
              )}
              <button
                onClick={() => {
                  setShowPaymentSuccess(false);
                  setCapturedImage(null);
                  setActiveClient(null);
                }}
                className="w-full bg-white text-black py-3 px-4 font-black uppercase text-sm tracking-wider border-2 border-black hover:bg-zinc-100 transition-colors"
              >
                Cerrar y Continuar
              </button>
            </div>
          </div>
        </div>
      )}

      {showFieldGuideModal && (
        <FieldGuideModal onClose={() => setShowFieldGuideModal(false)} />
      )}

      {selectedTicketRecord && (
        <PrintTicketModal 
          record={selectedTicketRecord} 
          onClose={() => setSelectedTicketRecord(null)} 
        />
      )}

      {showVoiceHelpModal && (
        <VoiceHelpModal onClose={() => setShowVoiceHelpModal(false)} />
      )}
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-8 py-4 bg-[#FFFF00] text-black border-b-4 border-black shrink-0">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-5xl font-black leading-none tracking-tighter uppercase">Miami Auto-Key ERP</h1>
          <span className="text-[10px] md:text-xs font-black tracking-[0.2em] mt-1">CERRAJERÍA AUTOMOTRIZ & AUXILIO VIAL EN SITIO</span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <button 
            type="button"
            onClick={() => setShowFieldGuideModal(true)}
            className="bg-black text-[#FFFF00] px-3 md:px-4 py-2 text-xs md:text-sm font-black uppercase tracking-wider flex items-center gap-2 border-2 border-black hover:bg-zinc-900 transition-colors shadow-[2px_2px_0px_#fff]"
          >
            <Wrench className="w-4 h-4 text-[#FFFF00]" /> <span className="hidden sm:inline">Guía Rápida de Campo</span><span className="sm:hidden">Guía Campo</span>
          </button>
          <div className="text-right">
            <p className="text-[9px] md:text-[10px] font-black opacity-70 uppercase tracking-widest">Ganancia Total</p>
            <p className="text-xl md:text-3xl font-black">${revenue.toFixed(2)}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[9px] md:text-[10px] font-black opacity-70 uppercase tracking-widest">Reordenar</p>
            <p className={`text-xl md:text-3xl font-black ${reorderCount > 0 ? 'text-red-600 underline' : ''}`}>
              {reorderCount.toString().padStart(2, '0')} ITEMS
            </p>
          </div>
        </div>
      </header>

      {/* Hands-Free Voice Command Control Bar */}
      <div className="bg-zinc-950 border-b-2 border-zinc-800 px-4 md:px-8 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleVoiceMode}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider flex items-center gap-2 border-2 transition-all ${
              isVoiceModeEnabled 
                ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.8)]' 
                : 'bg-zinc-900 text-[#FFFF00] border-zinc-700 hover:bg-zinc-800'
            }`}
          >
            {isVoiceModeEnabled ? <Mic className="w-4 h-4 text-white animate-spin" /> : <MicOff className="w-4 h-4 text-zinc-400" />}
            {isVoiceModeEnabled ? 'MANOS LIBRES: ACTIVADO' : 'ACTIVAR MANOS LIBRES'}
          </button>

          <span className="text-xs font-bold uppercase text-zinc-300 hidden md:flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${isVoiceModeEnabled ? 'text-red-500 animate-ping' : 'text-zinc-500'}`} />
            {isVoiceModeEnabled ? 'Escuchando órdenes de voz en sitio...' : 'Comandos de Voz: "Nuevo cliente", "Ir a dashboard", "Ir a historial", "Cobrar"'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {voiceToastMessage && (
            <div className="bg-[#FFFF00] text-black font-black text-xs px-3 py-1 border border-black uppercase tracking-wider animate-bounce">
              {voiceToastMessage}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowVoiceHelpModal(true)}
            className="text-[11px] font-black uppercase tracking-widest text-[#FFFF00] hover:underline flex items-center gap-1 bg-zinc-900 px-2.5 py-1 border border-zinc-800"
          >
            <HelpCircle className="w-3.5 h-3.5" /> Comandos de Voz
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {view === 'intake' ? (
          <section className="flex-1 overflow-y-auto p-4 md:p-8 flex items-center justify-center">
            <div className="w-full max-w-3xl bg-zinc-950 border-4 border-[#FFFF00] p-6 md:p-10 relative shadow-[8px_8px_0px_#FFFF00]">
              <div className="absolute -top-6 left-6 md:left-8 bg-black px-4 py-2 border-4 border-[#FFFF00]">
                <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter text-[#FFFF00]">Ingreso de Vehículo / Cliente</h2>
              </div>
              
              <form onSubmit={handleRegister} className="mt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-[#FFFF00] uppercase tracking-widest mb-2">Nombre</label>
                    <input 
                      type="text" 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className="w-full bg-black border-4 border-zinc-800 p-4 font-bold focus:border-[#FFFF00] focus:outline-none transition-colors text-white uppercase"
                      placeholder="EJ. JUAN"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#FFFF00] uppercase tracking-widest mb-2">Apellido</label>
                    <input 
                      type="text" 
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className="w-full bg-black border-4 border-zinc-800 p-4 font-bold focus:border-[#FFFF00] focus:outline-none transition-colors text-white uppercase"
                      placeholder="EJ. PEREZ"
                    />
                  </div>
                </div>

                {/* Location / Roadside Service Field */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-black text-[#FFFF00] uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#FFFF00]" /> Ubicación del Vehículo Varado (Auxilio Vial)
                    </label>
                    {formData.location && (
                      <div className="flex gap-2">
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.location)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-[#FFFF00] text-black px-2 py-0.5 text-[10px] font-black uppercase flex items-center gap-1 hover:bg-white transition-colors"
                        >
                          <Navigation className="w-3 h-3" /> Navegar GPS
                        </a>
                        <a 
                          href={`https://wa.me/?text=${encodeURIComponent(`Hola! Soy el cerrajero de Miami Auto-Key. Voy en camino a tu ubicación (${formData.location}) para atender tu ${formData.carInfo || 'vehículo'}. Llego pronto.`)}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-black uppercase flex items-center gap-1 hover:bg-emerald-500 transition-colors"
                        >
                          <Send className="w-3 h-3" /> Aviso ETA WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-black border-4 border-zinc-800 p-3.5 font-bold focus:border-[#FFFF00] focus:outline-none transition-colors text-white uppercase text-sm"
                    placeholder="EJ. 8300 NW 36TH ST, DORAL, FL (ESTACIONAMIENTO SHOPPING CENTER)"
                  />
                  {formData.location && (
                    <div className="mt-3">
                      <MiniLocationMap 
                        location={formData.location} 
                        clientName={`${formData.firstName} ${formData.lastName}`}
                        carInfo={formData.carInfo}
                      />
                    </div>
                  )}
                </div>

                {/* Car Selection Dropdown & Auto Specs */}
                <div className="p-4 bg-zinc-900 border-2 border-[#FFFF00]">
                  <label className="block text-xs font-black text-[#FFFF00] uppercase tracking-widest mb-2 flex justify-between items-center">
                    <span>Seleccionar Modelo Predefinido (Ficha Técnica Rápida)</span>
                    <span className="text-[10px] text-zinc-400 font-normal">Base de datos de cerrajería</span>
                  </label>
                  <select
                    value={selectedPreset?.model || ''}
                    onChange={e => handlePresetSelect(e.target.value)}
                    className="w-full bg-black border-2 border-[#FFFF00] p-3 text-sm font-black text-white uppercase focus:outline-none cursor-pointer"
                  >
                    <option value="">-- SELECCIONAR MODELO DESDE BASE DE DATOS TÉCNICA --</option>
                    {PRESET_CAR_MODELS.map(preset => (
                      <option key={preset.model} value={preset.model}>
                        {preset.model} - Chip {preset.chip} ({preset.freq})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Technical Spec Card when preset selected */}
                {selectedPreset && (
                  <div className="bg-black border-2 border-[#FFFF00] p-4 space-y-3">
                    <div className="flex justify-between items-center text-[#FFFF00] font-black border-b border-zinc-800 pb-2">
                      <span className="text-xs uppercase tracking-widest flex items-center gap-2">
                        <Car className="w-4 h-4" /> Especificaciones Técnicas de Cerrajería Móvil
                      </span>
                      <span className="bg-[#FFFF00] text-black px-2 py-0.5 text-[10px] font-black">
                        {selectedPreset.model}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold uppercase text-zinc-300">
                      <div className="bg-zinc-950 p-2.5 border border-zinc-800">
                        <span className="text-[#FFFF00] block text-[10px] font-black">CHIP TRANSPONDER:</span>
                        {selectedPreset.chip}
                      </div>
                      <div className="bg-zinc-950 p-2.5 border border-zinc-800">
                        <span className="text-[#FFFF00] block text-[10px] font-black">PERFIL ESPADA / LLAVE:</span>
                        {selectedPreset.keyType}
                      </div>
                      <div className="bg-zinc-950 p-2.5 border border-zinc-800">
                        <span className="text-[#FFFF00] block text-[10px] font-black">FRECUENCIA RF:</span>
                        {selectedPreset.freq}
                      </div>
                      <div className="bg-zinc-950 p-2.5 border border-zinc-800">
                        <span className="text-[#FFFF00] block text-[10px] font-black">GANZÚA LISHI RECOMENDADA:</span>
                        {selectedPreset.lishiTool}
                      </div>
                      <div className="bg-zinc-950 p-2.5 border border-zinc-800 md:col-span-2">
                        <span className="text-[#FFFF00] block text-[10px] font-black">UBICACIÓN PUERTO OBD2:</span>
                        {selectedPreset.obdLocation}
                      </div>
                      <div className="bg-zinc-950 p-2.5 border border-zinc-800 md:col-span-2">
                        <span className="text-[#FFFF00] block text-[10px] font-black">MÉTODO APERTURA SIN LLAVE (LOCKOUT):</span>
                        {selectedPreset.lockoutMethod}
                      </div>
                      <div className="bg-zinc-950 p-2.5 border border-zinc-800 md:col-span-2">
                        <span className="text-[#FFFF00] block text-[10px] font-black">MÉTODO PROGRAMACIÓN OBD2:</span>
                        {selectedPreset.programMethod}
                      </div>
                      <div className="bg-amber-950/40 p-2.5 border border-amber-600/50 md:col-span-2 text-amber-200">
                        <span className="text-amber-400 block text-[10px] font-black">TIP MÓVIL EN CAMIÓN / AUXILIO:</span>
                        {selectedPreset.emergencyTip}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-[#FFFF00] uppercase tracking-widest mb-2">Teléfono</label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-black border-4 border-zinc-800 p-4 font-bold focus:border-[#FFFF00] focus:outline-none transition-colors text-white uppercase"
                      placeholder="305-555-0199"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#FFFF00] uppercase tracking-widest mb-2">Vehículo (Año/Marca/Modelo)</label>
                    <input 
                      type="text" 
                      value={formData.carInfo}
                      onChange={e => {
                        setFormData({...formData, carInfo: e.target.value});
                        if (selectedPreset && e.target.value !== selectedPreset.model) {
                          setSelectedPreset(null);
                        }
                      }}
                      className="w-full bg-black border-4 border-zinc-800 p-4 font-bold focus:border-[#FFFF00] focus:outline-none transition-colors text-white uppercase"
                      placeholder="EJ. 2005 TOYOTA COROLLA"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-black text-[#FFFF00] uppercase tracking-widest">Problema / Razón de Visita</label>
                    <button
                      type="button"
                      onClick={toggleSpeechRecognition}
                      className={`flex items-center gap-1.5 px-3 py-1 text-xs font-black uppercase tracking-widest border-2 transition-all ${
                        isListening 
                          ? 'bg-red-600 text-white border-red-500 animate-pulse' 
                          : 'bg-[#FFFF00] text-black border-black hover:bg-white'
                      }`}
                    >
                      {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                      {isListening ? 'GRABANDO...' : 'DICTAR VOZ'}
                    </button>
                  </div>
                  <textarea 
                    value={formData.issue}
                    onChange={e => setFormData({...formData, issue: e.target.value})}
                    className="w-full bg-black border-4 border-zinc-800 p-4 font-bold focus:border-[#FFFF00] focus:outline-none transition-colors text-white uppercase min-h-[120px] resize-none"
                    placeholder="LLAVE PERDIDA, NECESITA COPIA Y PROGRAMACIÓN DE CHIP TRANSPONDER..."
                  ></textarea>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6 pt-4 border-t-4 border-zinc-900">
                  <button type="submit" className="flex-1 bg-[#FFFF00] text-black font-black uppercase text-lg md:text-xl py-5 hover:bg-white transition-colors shadow-[4px_4px_0px_#fff]">
                    Registrar y Continuar
                  </button>
                  <button type="button" onClick={handleSkip} className="flex-1 bg-zinc-900 text-white font-black uppercase text-lg md:text-xl py-5 border-4 border-zinc-700 hover:border-white transition-colors">
                    Saltar (Diagnóstico Rápido)
                  </button>
                </div>
              </form>
            </div>
          </section>
        ) : view === 'dashboard' ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Flashing Low Stock Alert Banner */}
            {lowStockItems.length > 0 && (
              <div className="bg-red-950/90 border-b-4 border-red-600 text-white p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_4px_20px_rgba(220,38,38,0.5)] animate-pulse shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-red-600 text-white p-2 border-2 border-black animate-bounce shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black uppercase tracking-wider text-red-300 text-sm md:text-base">
                        ⚠️ ALERTA DE STOCK CRÍTICO (&lt;3 UNIDADES)
                      </span>
                      <span className="bg-red-600 text-white font-black text-xs px-2 py-0.5 border border-black uppercase tracking-widest">
                        {lowStockItems.length} {lowStockItems.length === 1 ? 'ÍTEM AFECTADO' : 'ÍTEMS AFECTADOS'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-bold uppercase mt-0.5">
                      Reposición requerida: {lowStockItems.map(i => `${i.name} (${i.stock} u.)`).join(' • ')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowSupplierOrderModal(true)}
                  className="w-full sm:w-auto bg-[#FFFF00] text-black font-black uppercase text-xs md:text-sm px-4 py-2.5 border-2 border-black flex items-center justify-center gap-2 hover:bg-white transition-colors shadow-[3px_3px_0px_#000] shrink-0"
                >
                  <ShoppingCart className="w-4 h-4 text-black" />
                  Generar Pedido Proveedor
                </button>
              </div>
            )}

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* Left Pane: Inventory */}
              <section className="w-full md:w-[420px] border-r-4 border-[#FFFF00] flex flex-col shrink-0 bg-zinc-950">
                <div className="p-4 md:p-6 border-b-4 border-zinc-800 bg-black">
                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                        Inventario
                        {lowStockItems.length > 0 && (
                          <span className="bg-red-600 text-white font-black text-[10px] px-1.5 py-0.5 border border-black animate-pulse">
                            {lowStockItems.length} ALERTA
                          </span>
                        )}
                      </h2>
                      <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest mt-1">Miami Oldies</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setShowSupplierOrderModal(true)}
                        className="bg-red-600 text-white px-2.5 py-2 font-black text-xs uppercase hover:bg-red-500 transition-colors border-2 border-black flex items-center gap-1 animate-pulse"
                        title="Generar Pedido Proveedor"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="hidden sm:inline">Pedido Proveedor</span>
                      </button>
                      <button 
                        onClick={() => setAddInventoryOpen(true)}
                        className="bg-[#FFFF00] text-black p-2 hover:bg-white transition-colors border-2 border-black"
                        title="Agregar Nuevo Item"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFFF00]" />
                      <input 
                        type="text" 
                        placeholder="FILTRAR INVENTARIO..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border-2 border-zinc-700 pl-10 pr-4 py-2.5 font-black uppercase text-white focus:border-[#FFFF00] focus:outline-none text-xs"
                      />
                    </div>
                    <button onClick={() => setScannerOpen(true)} className="bg-[#FFFF00] text-black px-4 flex items-center justify-center hover:bg-white transition-colors border-2 border-[#FFFF00]" title="Escanear Código de Barras">
                      <ScanLine className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto divide-y-4 divide-zinc-900">
                  {filteredInventory.map(item => {
                    const isLow = item.stock < 3;
                    return (
                      <div 
                        key={item.id} 
                        className={`p-4 md:p-5 flex justify-between items-center transition-colors ${
                          isLow 
                            ? 'bg-red-950/30 hover:bg-red-900/40 border-l-8 border-red-600' 
                            : 'bg-black hover:bg-zinc-900 border-l-8 border-[#FFFF00]'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-base font-black uppercase leading-tight">{item.name}</p>
                            {isLow && (
                              <span className="bg-red-600 text-white font-black text-[9px] px-1.5 py-0.5 uppercase tracking-wider animate-pulse border border-black">
                                STOCK CRÍTICO
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#FFFF00] font-bold tracking-widest mt-1.5">{item.type}</p>
                          <p className="text-sm font-black mt-1">${item.price} USD</p>
                        </div>
                        <div className="text-right flex flex-col items-end shrink-0 ml-2">
                          <p className={`text-2xl md:text-3xl font-black ${isLow ? 'text-red-500 italic animate-pulse' : ''}`}>
                            {item.stock.toString().padStart(2, '0')}
                          </p>
                          <button 
                            onClick={() => handleSell(item.id)}
                            disabled={item.stock === 0}
                            className="mt-2 bg-[#FFFF00] disabled:bg-zinc-700 disabled:text-zinc-500 text-black text-[10px] px-3 py-1.5 font-black uppercase tracking-widest hover:bg-white transition-colors"
                          >
                            {item.stock === 0 ? 'AGOTADO' : 'VENDER (-1)'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

            {/* Right Pane: Diagnostic & Voice/Camera */}
            <section className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto bg-black">
              {/* Active Client Banner */}
              {activeClient && (
                <div className="bg-zinc-900 border-4 border-zinc-700 p-4 mb-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[#FFFF00] flex items-center justify-center shrink-0">
                        <User className="text-black w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#FFFF00] uppercase tracking-widest">Cliente Activo</p>
                        <p className="text-lg md:text-xl font-black uppercase">{activeClient.firstName} {activeClient.lastName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black uppercase text-[#FFFF00]">{activeClient.carInfo}</p>
                      <p className="text-xs text-zinc-400 font-bold uppercase line-clamp-1">{activeClient.issue || 'SIN DESCRIPCIÓN'}</p>
                    </div>
                  </div>

                  {/* Geocoded Mini Map for Active Client Location */}
                  {activeClient.location && (
                    <MiniLocationMap 
                      location={activeClient.location} 
                      clientName={`${activeClient.firstName} ${activeClient.lastName}`}
                      carInfo={activeClient.carInfo}
                    />
                  )}

                  {/* Dedicated Technician Notes Input Field */}
                  <div className="bg-black p-3.5 border-2 border-zinc-700 space-y-2">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#FFFF00]" />
                        <label 
                          htmlFor="technician-notes-input"
                          className="text-xs font-black uppercase text-[#FFFF00] tracking-wider cursor-pointer"
                        >
                          Notas y Observaciones del Técnico
                        </label>
                        {activeClient.notes && (
                          <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-600 px-1.5 py-0.5 font-black uppercase tracking-wider flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-400" /> Guardado en Ficha
                          </span>
                        )}
                      </div>
                      {activeClient.notes && (
                        <button
                          type="button"
                          onClick={() => handleUpdateClientNotes('')}
                          className="text-[10px] text-zinc-500 hover:text-red-400 uppercase font-black transition-colors"
                        >
                          Limpiar Notas
                        </button>
                      )}
                    </div>

                    <textarea
                      id="technician-notes-input"
                      rows={2}
                      value={activeClient.notes || ''}
                      onChange={(e) => handleUpdateClientNotes(e.target.value)}
                      placeholder="Escriba notas específicas del vehículo (ej: 'Cilindro HU66 desgastado, chip ID48 virgen, corte Lishi, batería 12.4V, inmovilizador bloqueado...')..."
                      className="w-full bg-zinc-950 border-2 border-zinc-800 focus:border-[#FFFF00] p-2.5 text-xs md:text-sm font-bold text-white uppercase focus:outline-none resize-y placeholder:text-zinc-600 rounded-none leading-relaxed transition-colors"
                    />

                    {/* Quick Roadside Observation Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Atajos Rápidos:</span>
                      {[
                        'Chip ID48 Virgen',
                        'Corte Lishi HU66',
                        'Batería Baja (11.8V)',
                        'Ignición Desgastada',
                        'Inmo Sincronizado',
                        'Alarma Desactivada',
                        'Control Remoto OK'
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAppendQuickNote(tag)}
                          className="text-[10px] bg-zinc-900 text-zinc-300 hover:text-black hover:bg-[#FFFF00] border border-zinc-700 px-2 py-0.5 font-black uppercase transition-colors"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button 
                  onClick={() => setCameraOpen(true)}
                  className="flex-1 bg-[#FFFF00] text-black py-5 border-b-8 border-yellow-600 flex flex-col md:flex-row items-center justify-center gap-3 hover:bg-white transition-colors shadow-[4px_4px_0px_#fff]"
                >
                  <Camera className="w-7 h-7" />
                  <span className="font-black text-base md:text-lg uppercase tracking-tighter">Tomar Foto AI</span>
                </button>
                <button 
                  onClick={toggleSpeechRecognition}
                  className={`flex-1 py-5 border-b-8 flex flex-col md:flex-row items-center justify-center gap-3 transition-colors ${
                    isListening 
                      ? 'bg-red-600 text-white border-red-800 animate-pulse' 
                      : 'bg-zinc-900 text-white border-zinc-700 hover:bg-zinc-800'
                  }`}
                >
                  {isListening ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-[#FFFF00]" />}
                  <span className="font-black text-base md:text-lg uppercase tracking-tighter">
                    {isListening ? 'Escuchando...' : 'Describir Voz'}
                  </span>
                </button>
              </div>

              {/* Main AI Diagnostic Viewport */}
              <div className="flex-1 border-4 border-dashed border-zinc-700 p-6 md:p-8 flex flex-col relative bg-zinc-950 min-h-[300px]">
                <div className="absolute -top-4 left-6 bg-black px-2">
                  <span className="text-[#FFFF00] font-black uppercase tracking-widest text-xs md:text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Diagnóstico del Maestro Mecánico
                  </span>
                </div>
                
                {/* Captured Image Preview if any */}
                {capturedImage && (
                  <div className="mb-6 p-4 bg-black border-2 border-[#FFFF00] flex items-center gap-4">
                    <img src={capturedImage} alt="Captured Key/Module" className="w-24 h-24 object-cover border border-zinc-700" />
                    <div>
                      <span className="text-xs font-black uppercase text-[#FFFF00] tracking-widest">Análisis de Imagen AI</span>
                      <p className="text-lg font-black uppercase">Llave Transponder & Chip Reconocidos</p>
                      <button 
                        onClick={() => setCapturedImage(null)}
                        className="text-xs font-bold text-red-500 uppercase underline mt-1"
                      >
                        Eliminar Imagen
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-6 mt-2">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 shrink-0 bg-[#FFFF00] flex items-center justify-center text-black font-black text-lg">01</div>
                    <div>
                      <p className="text-lg md:text-xl font-bold italic leading-tight uppercase text-white">
                        {activeClient?.carInfo ? `Analizando inmovilizador para: ${activeClient.carInfo}` : 'Seleccione o ingrese un vehículo para iniciar lectura OBD2/Chip.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-10 h-10 shrink-0 bg-white flex items-center justify-center text-black font-black text-lg">02</div>
                    <div>
                      <p className="text-lg md:text-xl font-bold leading-tight uppercase text-white">
                        {activeClient?.issue ? `Reporte de falla: "${activeClient.issue}"` : 'Use "Tomar Foto AI" o "Describir Voz" para alimentar el modelo.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 opacity-70">
                    <div className="w-10 h-10 shrink-0 bg-zinc-800 flex items-center justify-center text-[#FFFF00] font-black text-lg">03</div>
                    <div>
                      <p className="text-lg md:text-xl font-bold leading-tight uppercase text-zinc-300">
                        {capturedImage 
                          ? 'Procedimiento listo: Programar Chip ID46/ID4C vía puerto OBD2 con KM100 / IM608.' 
                          : 'Esperando datos adicionales de entrada...'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col md:flex-row justify-between items-start md:items-end border-t-4 border-zinc-900 pt-6 gap-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase text-zinc-500 tracking-widest">Vehículo Seleccionado</span>
                    <span className="text-xl md:text-2xl font-black uppercase text-[#FFFF00]">
                      {activeClient?.carInfo || 'TOYOTA COROLLA 2003 CE'}
                    </span>
                  </div>
                  <button 
                    onClick={handleStripePayment}
                    className="w-full md:w-auto bg-green-500 hover:bg-green-400 text-black px-8 py-4 font-black text-xl uppercase tracking-tighter shadow-[4px_4px_0px_#fff] transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-6 h-6" /> Cobrar con Stripe ($150)
                  </button>
                </div>
              </div>

              {/* Recharts Analytics Dashboard */}
              <DashboardAnalyticsChart />
            </section>
          </div>
        </div>
      ) : view === 'history' ? (
          <section className="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-950 flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-[#FFFF00]">Historial y Aprendizaje AI</h2>
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 mt-1">Exporta datos para entrenar modelos locales</p>
              </div>
              <button 
                onClick={exportCSV}
                className="bg-[#FFFF00] text-black px-6 py-3 font-black uppercase tracking-widest shadow-[4px_4px_0px_#fff] hover:bg-white transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> Exportar CSV
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="mb-6 bg-black border-2 border-zinc-800 p-4 flex flex-col md:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#FFFF00]" />
                <input 
                  type="text" 
                  placeholder="FILTRAR HISTORIAL POR CLIENTE, VEHÍCULO O FALLA..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border-2 border-zinc-700 pl-10 pr-4 py-2.5 font-black uppercase text-white focus:border-[#FFFF00] focus:outline-none text-sm placeholder:text-zinc-500"
                />
              </div>
              {historySearchQuery && (
                <button 
                  onClick={() => setHistorySearchQuery('')}
                  className="w-full md:w-auto bg-zinc-800 text-zinc-300 hover:text-white px-4 py-2.5 text-xs font-black uppercase border border-zinc-700 shrink-0 transition-colors"
                >
                  Limpiar Filtro
                </button>
              )}
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y-4 divide-zinc-900 border-4 border-zinc-800 bg-black">
              {filteredHistory.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 font-bold uppercase">
                  No se encontraron registros que coincidan con "{historySearchQuery}"
                </div>
              ) : (
                filteredHistory.map((record) => (
                  <div key={record.id} className="p-6 md:p-8 hover:bg-zinc-900/80 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-zinc-800 text-white px-3 py-1 text-xs font-black tracking-widest">{record.date}</span>
                        {/* Color-Coded Status Indicator */}
                        {getStatusBadge(record.status)}
                      </div>
                      <span className="text-sm font-black uppercase text-[#FFFF00]">{record.car}</span>
                    </div>
                    <p className="text-xl font-black uppercase mb-1">{record.client}</p>
                    <p className="text-sm font-bold uppercase text-zinc-400 mb-2">Problema: {record.issue}</p>
                    
                    {record.notes && (
                      <div className="mb-3 bg-zinc-950 border border-zinc-700 p-2.5 flex items-start gap-2">
                        <FileText className="w-4 h-4 text-[#FFFF00] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-black uppercase text-[#FFFF00] tracking-wider block">Observaciones del Técnico:</span>
                          <p className="text-xs font-bold text-zinc-300 uppercase">{record.notes}</p>
                        </div>
                      </div>
                    )}
                    
                    {record.image && (
                      <div className="mb-4">
                        <img src={record.image} alt="Recorded asset" className="w-24 h-24 object-cover border-2 border-[#FFFF00]" />
                      </div>
                    )}

                    <div className="border-l-4 border-[#FFFF00] pl-4 bg-zinc-950 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-black uppercase text-[#FFFF00] tracking-widest mb-1">Diagnóstico IA Guardado</p>
                        <p className="font-bold italic uppercase leading-relaxed text-zinc-300">{record.aiDiagnosis}</p>
                      </div>
                      <button 
                        onClick={() => setSelectedTicketRecord(record)}
                        className="shrink-0 bg-white text-black hover:bg-[#FFFF00] font-black uppercase px-4 py-2 text-xs flex items-center gap-2 border-2 border-black transition-colors"
                      >
                        <Printer className="w-4 h-4" /> Imprimir Ticket
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        ) : null}
      </main>

      {/* Supplier Order Modal */}
      {showSupplierOrderModal && (
        <SupplierOrderModal 
          lowStockItems={lowStockItems}
          allInventory={inventory}
          onClose={() => setShowSupplierOrderModal(false)}
          onConfirmRestock={handleConfirmRestock}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="h-16 bg-black border-t-4 border-[#FFFF00] flex shrink-0 z-50">
        <button 
          onClick={() => setView('dashboard')} 
          className={`flex-1 flex items-center justify-center font-black uppercase tracking-widest text-xs md:text-sm transition-colors ${
            view === 'dashboard' ? 'bg-[#FFFF00] text-black' : 'text-white hover:bg-zinc-900'
          }`}
        >
          Panel Control
        </button>
        <button 
          onClick={() => setView('intake')} 
          className={`flex-1 flex items-center justify-center font-black uppercase tracking-widest text-xs md:text-sm transition-colors ${
            view === 'intake' ? 'bg-[#FFFF00] text-black' : 'text-white hover:bg-zinc-900'
          }`}
        >
          Nuevo Cliente
        </button>
        <button 
          onClick={() => setView('history')} 
          className={`flex-1 flex items-center justify-center font-black uppercase tracking-widest text-xs md:text-sm transition-colors ${
            view === 'history' ? 'bg-[#FFFF00] text-black' : 'text-white hover:bg-zinc-900'
          }`}
        >
          Historial ({history.length})
        </button>
      </nav>
    </div>
  );
}
