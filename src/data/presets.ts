import type { CarPreset } from '../lib/types';

// Fichas técnicas de cerrajería para los modelos más comunes en Miami.
export const PRESET_CAR_MODELS: CarPreset[] = [
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
