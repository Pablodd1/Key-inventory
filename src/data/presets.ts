import type { CarPreset } from '../lib/types';

// Fichas técnicas de cerrajería para los vehículos más comunes en Miami.
// Datos de referencia para profesionales; ante duda de año exacto, verificar
// por VIN antes de cortar/programar (ver tip de emergencia de cada ficha).

const TOYOTA: CarPreset[] = [
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
    model: '2012 TOYOTA CAMRY',
    chip: 'ID4D-H (Texas Crypto H)',
    keyType: 'Espada TOY44 / Control 3B',
    freq: '315 MHz',
    programMethod: 'OBD2 con Techstream / Autel / KM100. Añadir requiere llave maestra presente.',
    defaultIssue: 'COPIA DE LLAVE CAMRY - PROGRAMACIÓN CHIP H Y VERIFICACIÓN REMOTA.',
    lishiTool: 'Lishi TOY48 (2-in-1)',
    lockoutMethod: 'Lishi TOY48 en puerta de conductor o cuña + varilla por marco superior.',
    obdLocation: 'Bajo el tablero, a la izquierda de la columna de dirección.',
    emergencyTip: 'Camry híbrido 2012+: NO usar arranque de respaldo por 12V directo; respetar sistema híbrido.'
  },
  {
    model: '2016 TOYOTA RAV4',
    chip: 'ID4D-H (G/H Key)',
    keyType: 'Control 3B espada TOY48',
    freq: '315 MHz',
    programMethod: 'OBD2 con Techstream clonando H o generando por VIN (smart 2013+ requiere PIN).',
    defaultIssue: 'LLAVE RAV4 PERDIDA - GENERAR POR VIN Y PROGRAMAR CONTROL 315MHZ.',
    lishiTool: 'Lishi TOY48 (2-in-1)',
    lockoutMethod: 'Lishi TOY48 o bolsa de aire en marco superior con gancho largo.',
    obdLocation: 'Bajo el tablero del lado del conductor, junto a la consola.',
    emergencyTip: 'Modelos 2013+ con smart key requieren PIN por VIN vía NASTF/Toyota antes de programar.'
  },
  {
    model: '2011 TOYOTA SIENNA',
    chip: 'ID4D-H (G/H Key)',
    keyType: 'Remote Head 3B espada TOY48',
    freq: '315 MHz',
    programMethod: 'OBD2 (Techstream/Autel). Remoto se aprende por ciclos de puerta.',
    defaultIssue: 'MINIBÚS SIENNA - COPIA DE LLAVE Y PROGRAMACIÓN DE REMOTO.',
    lishiTool: 'Lishi TOY48 (2-in-1)',
    lockoutMethod: 'Puerta deslizante trasera con ganzúa TOY48 o varilla por ventana trasera entreabierta.',
    obdLocation: 'Bajo el tablero del conductor, a la derecha de la columna.',
    emergencyTip: 'Con energía apagada por batería, la puerta deslizante manual del lado pasajero suele quedar operable.'
  },
  {
    model: '2014 TOYOTA YARIS',
    chip: 'ID4C (G Chip)',
    keyType: 'Espada TOY43 / TOY44',
    freq: '315 MHz',
    programMethod: 'OBD2 con KM100 / IM508. Método manual no disponible en Yaris.',
    defaultIssue: 'YARIS SIN ARRANQUE - VERIFICAR CHIP G Y ANTENA DE INMOVILIZADOR.',
    lishiTool: 'Lishi TOY43 (2-in-1)',
    lockoutMethod: 'Ganzúa TOY43 en puerta de conductor.',
    obdLocation: 'Bajo el tablero, centro-izquierda.',
    emergencyTip: 'Yaris 2 puertas: la cerradura del lado pasajero no está esclavizada — probar ambas antes de forzar.'
  },
];

const HONDA: CarPreset[] = [
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
    model: '2013 HONDA ACCORD',
    chip: 'ID46 (Philips Crypto)',
    keyType: 'Espada HO03 / Control 3B',
    freq: '313.8 MHz',
    programMethod: 'OBD2 con IM608 (lectura de PIN automática en la mayoría de años).',
    defaultIssue: 'ACCORD Llave perdida - PROGRAMAR HO03 CON ID46.',
    lishiTool: 'Lishi HON66 (2-in-1)',
    lockoutMethod: 'Lishi HON66 en puerta conductor; carros 2013+ traen protectionsheet — usar herramienta con tope.',
    obdLocation: 'Debajo del tablero al lado izquierdo del volante.',
    emergencyTip: 'Accord 2013-2017 sin llave física en guantera: programar por OBD2 requiere el VIN del cliente (NASTF).'
  },
  {
    model: '2015 HONDA CR-V',
    chip: 'ID46 (Philips Crypto)',
    keyType: 'Control 3B HO03',
    freq: '313.8 MHz',
    programMethod: 'OBD2 con IM608 / T300. Soporta añadir llave sin PIN si hay una válida.',
    defaultIssue: 'CR-V COPIA DE CONTROL - CLONAR O PROGRAMAR ID46.',
    lishiTool: 'Lishi HON66 (2-in-1)',
    lockoutMethod: 'Lishi HON66 o cuña neumática + varilla en marco de puerta.',
    obdLocation: 'Bajo la consola central, lado conductor.',
    emergencyTip: 'CR-V con puertas traseras sin cerradura externa: decodificar siempre la del conductor.'
  },
  {
    model: '2012 HONDA ODYSSEY',
    chip: 'ID46 (Philips Crypto)',
    keyType: 'Control 3B HO01',
    freq: '313.8 MHz',
    programMethod: 'OBD2 con PIN por VIN o lectura directa con IM608.',
    defaultIssue: 'ODYSSEY MINIVAN - PROGRAMACIÓN DE FOB Y LLAVE.',
    lishiTool: 'Lishi HON66 (2-in-1)',
    lockoutMethod: 'Puerta trasera corrediza suele tener cerradura simple (HO01) más rápida de decodificar.',
    obdLocation: 'Bajo el tablero, lado izquierdo del volante.',
    emergencyTip: 'Con batería desconectada, la puerta corrediza puede abrirse manualmente desde el interior solamente.'
  },
];

const NISSAN: CarPreset[] = [
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
    model: '2013 NISSAN ALTIMA',
    chip: 'ID46 / 4A (Smart)',
    keyType: 'Smart Key 4B proximity',
    freq: '315 MHz',
    programMethod: 'PIN por BCM (NATS) vía OBD2; modelos 2013+ smart requieren adaptación de prox.',
    defaultIssue: 'ALTIMA SMART KEY PERDIDA - PROGRAMACIÓN PROXIMITY Y PIN BCM.',
    lishiTool: 'No aplica (proximity) — cuña + gancho',
    lockoutMethod: 'Cuña neumática en marco superior y gancho en manija interna. Cuidado con sensor de ocupación.',
    obdLocation: 'Bajo la cubierta del tablero, lado del conductor.',
    emergencyTip: 'Altima 2013-2015: si la batería del fob está muerta, tocar el botón START con la esquina del fob.'
  },
  {
    model: '2015 NISSAN VERSA',
    chip: 'ID46 (NATS)',
    keyType: 'Espada NSN14 / NI04T',
    freq: '315 MHz',
    programMethod: 'OBD2 con PIN BCM (5 díg → 4 díg) o clonar ID46 en XHORSE XT27A.',
    defaultIssue: 'VERSA NO ARRANCA - REPROGRAMAR O CLONAR TRANSPONDER.',
    lishiTool: 'Lishi NSN14 (2-in-1)',
    lockoutMethod: 'Ganzúa NSN14 en puerta de conductor.',
    obdLocation: 'Centro bajo del tablero.',
    emergencyTip: 'Versa Note y Versa sedán comparten NATS pero no espada: confirmar perfil NI04T vs NSN14 antes de cortar.'
  },
  {
    model: '2016 NISSAN ROGUE',
    chip: 'ID46 / 4A (Smart)',
    keyType: 'Smart Key 4B',
    freq: '315 MHz',
    programMethod: 'PIN por BCM vía OBD2 con IM608 / NSPC-001.',
    defaultIssue: 'ROGUE PROXIMITY DESCONFIGURADO - REPROGRAMAR SMART KEY.',
    lishiTool: 'No aplica (proximity) — cuña + gancho',
    lockoutMethod: 'Cuña superior + varilla larga; presión en sensor de puerta para no dañar moldura.',
    obdLocation: 'Bajo el tablero del conductor.',
    emergencyTip: 'Rogue 2014+: al perder ambas llaves, requiere PIN y borrado total de llaves previas.'
  },
];

const FORD: CarPreset[] = [
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
    model: '2013 FORD ESCAPE',
    chip: 'ID4D-60 / 80-bit (PATS)',
    keyType: 'Remote Head 4B espada HU101',
    freq: '315 MHz',
    programMethod: 'OBD2 con Forscan / KM100 (PIN gratis en la mayoría de modelos Ford).',
    defaultIssue: 'ESCAPE LLAVE PERDIDA - GENERAR HU101 Y PROGRAMAR PATS.',
    lishiTool: 'Lishi HU101 (2-in-1)',
    lockoutMethod: 'Lishi HU101 en puerta de conductor (sidewinder, girar suave).',
    obdLocation: 'Bajo la guantera, lado del pasajero en algunos años.',
    emergencyTip: 'Escape 2013+ usa espada lateral HU101: no intentar corte convencional, requiere trazador.'
  },
  {
    model: '2012 FORD FOCUS',
    chip: 'ID4D (PATS 4C-60)',
    keyType: 'Remote Head 4B espada HU101',
    freq: '315 MHz',
    programMethod: 'OBD2 (Forscan / Autel). Modelos 2012+ requieren 2 llaves para añadir tercera.',
    defaultIssue: 'FOCUS COPIA DE LLAVE REMOTE HEAD.',
    lishiTool: 'Lishi HU101 (2-in-1)',
    lockoutMethod: 'Lishi HU101 o cuña + varilla por marco.',
    obdLocation: 'Centro bajo del tablero.',
    emergencyTip: 'Focus eléctrico (Focus EV): buscar botón de emergencia dentro de guantera antes de hacer Ganzúa.'
  },
  {
    model: '2014 FORD EXPLORER',
    chip: 'ID4D-80 (PATS) / IA 4B',
    keyType: 'Intelligent Access 4B HU101',
    freq: '315 MHz',
    programMethod: 'OBD2 con PIN (Forscan). Borrado de llaves previas recomendado en pérdida total.',
    defaultIssue: 'EXPLORER IA KEY PERDIDA - PROGRAMACIÓN DE PROXIMIDAD.',
    lishiTool: 'No aplica (proximity) — cuña + gancho',
    lockoutMethod: 'Cuña en marco superior; cuidado con el sensor de puerta en manija capacitiva.',
    obdLocation: 'Bajo el tablero del conductor.',
    emergencyTip: 'Explorer 2013+ con teclado de puerta (keypad) en el marco: se puede usar código de fábrica si el cliente lo tiene.'
  },
];

const CHEVROLET: CarPreset[] = [
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
    model: '2014 CHEVROLET SILVERADO',
    chip: 'ID46 (Circle Plus)',
    keyType: 'Espada HU100K (navaja fija)',
    freq: '315 MHz',
    programMethod: 'OBD2 (Autel / JMD). Añadir requiere una llave válida o bypass de 10 min.',
    defaultIssue: 'SILVERADO PÉRDIDA DE LLAVE - HU100K Y PROGRAMACIÓN B10.',
    lishiTool: 'Lishi HU100 (2-in-1)',
    lockoutMethod: 'Lishi HU100 en puerta de conductor.',
    obdLocation: 'Bajo el tablero, a la izquierda de la columna de dirección.',
    emergencyTip: 'Silverado 2014-2018 comparte ficha con GMC Sierra — mismo chip y espada.'
  },
  {
    model: '2013 CHEVROLET CRUZE',
    chip: 'ID46 (Circle Plus)',
    keyType: 'Espada flip HU100',
    freq: '315 MHz',
    programMethod: 'OBD2 con bypass de 10 min o PIN por VIN.',
    defaultIssue: 'CRUZE LLAVE PERDIDA - PROGRAMAR CIRCLE PLUS.',
    lishiTool: 'Lishi HU100 (2-in-1)',
    lockoutMethod: 'Lishi HU100 en puerta conductor o cuña + gancho.',
    obdLocation: 'Detrás de la tapa del cenicero/consola, bajo los controles del clima.',
    emergencyTip: 'Cruze 2011-2015 con keyless: si el fob no responde, la llave física sale presionando el botón lateral.'
  },
  {
    model: '2014 CHEVROLET MALIBU',
    chip: 'ID46 (Circle Plus)',
    keyType: 'Standard/flip HU100 (PEPS 4B)',
    freq: '315 MHz',
    programMethod: 'OBD2 (Autel). PEPS 2014+ requiere reset de módulo en pérdida total.',
    defaultIssue: 'MALIBU FOB PEPS DESCONFIGURADO.',
    lishiTool: 'Lishi HU100 (2-in-1)',
    lockoutMethod: 'Lishi HU100 o cuña + gancho.',
    obdLocation: 'Bajo el tablero del conductor, detrás de la cubierta.',
    emergencyTip: 'Malibu híbrido: desconectar 12V provoca bloqueo de BCM — usar puente de memoria antes de cortar energía.'
  },
];

const HYUNDAI: CarPreset[] = [
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
    model: '2015 HYUNDAI SONATA',
    chip: 'ID46 (Mando) / ID47 (Smart)',
    keyType: 'Laser HY15 / Smart 4B',
    freq: '433 MHz',
    programMethod: 'PIN 6 dígitos por OBD2 (Smart) o clonar ID46 (remote head).',
    defaultIssue: 'SONATA LLAVE LASER PERDIDA - CORTE HY15 Y PROGRAMACIÓN.',
    lishiTool: 'Lishi HY22 (2-in-1)',
    lockoutMethod: 'Lishi HY22 en puerta de conductor (perfil laser de 10 cortes).',
    obdLocation: 'Bajo el tablero del conductor.',
    emergencyTip: 'Sonata 2015+ smart: programación requiere PIN de 6 dígitos; clonación ID46 solo para remote head.'
  },
  {
    model: '2016 HYUNDAI TUCSON',
    chip: 'ID47 (Smart)',
    keyType: 'Smart Key 4B HY14',
    freq: '433 MHz',
    programMethod: 'OBD2 con PIN 6 dígitos vía leer VIN (2016+ algunos requieren pin online).',
    defaultIssue: 'TUCSON SMART KEY DESCONFIGURADA - REPROGRAMACIÓN.',
    lishiTool: 'No aplica (proximity) — cuña + gancho',
    lockoutMethod: 'Cuña + gancho en marco; tapón de llave física en manija del conductor.',
    obdLocation: 'Bajo el tablero, lado del conductor.',
    emergencyTip: 'Tucson 2016+ bloquea adaptadores genéricos: usar cable OBD dedicado Hyundai/Kia o pin online.'
  },
];

const KIA: CarPreset[] = [
  {
    model: '2014 KIA FORTE',
    chip: 'ID46 (Mando)',
    keyType: 'Laser HY15',
    freq: '433 MHz',
    programMethod: 'Clonar ID46 (XT27A) o programar por OBD2 con PIN.',
    defaultIssue: 'FORTE LLAVE LASER PERDIDA - CLONAR O PROGRAMAR ID46.',
    lishiTool: 'Lishi HY22 (2-in-1)',
    lockoutMethod: 'Lishi HY22 en puerta de conductor.',
    obdLocation: 'Bajo el tablero del conductor.',
    emergencyTip: 'Forte 2014-2018 comparte plataforma con Elantra: mismo chip y perfil HY15/HY22.'
  },
  {
    model: '2016 KIA OPTIMA',
    chip: 'ID47 (Smart)',
    keyType: 'Smart Key 4B',
    freq: '433 MHz',
    programMethod: 'OBD2 con PIN 6 dígitos (leer por VIN o calculadora Kia).',
    defaultIssue: 'OPTIMA SMART KEY PERDIDA - PROGRAMAR PROXIMITY.',
    lishiTool: 'No aplica (proximity) — cuña + gancho',
    lockoutMethod: 'Cuña + gancho por marco superior.',
    obdLocation: 'Bajo el tablero del conductor.',
    emergencyTip: 'Optima 2016+ con botón START: si el fob no detecta, tocar START con el fob directamente.'
  },
  {
    model: '2015 KIA SOUL',
    chip: 'ID46 (Mando)',
    keyType: 'Laser HY17',
    freq: '433 MHz',
    programMethod: 'Clonar ID46 o programar por OBD2 (PIN 6 dígitos).',
    defaultIssue: 'SOUL COPIA DE LLAVE LASER HY17.',
    lishiTool: 'Lishi HY17 (2-in-1)',
    lockoutMethod: 'Lishi HY17 en puerta de conductor.',
    obdLocation: 'Bajo la cubierta izquierda del tablero.',
    emergencyTip: 'Soul EV: sistema de alto voltaje — no cortar ni perforar cerca de la batería bajo los asientos.'
  },
];

const JEEP: CarPreset[] = [
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
    model: '2015 JEEP WRANGLER',
    chip: 'ID46 (Sentry / FOBIK)',
    keyType: 'FOBIK IKT 3B',
    freq: '433 MHz',
    programMethod: 'OBD2 con PIN por VIN (Chrysler). Procedimiento simple de añadir.',
    defaultIssue: 'WRANGLER FOBIK PERDIDA - PROGRAMACIÓN SENTRY KEY.',
    lishiTool: 'Lishi CY21 (2-in-1)',
    lockoutMethod: 'Candado de la rueda de repuesto en la parte trasera suele usar la misma llave — acceso alternativo.',
    obdLocation: 'Bajo la guantera, lado del pasajero.',
    emergencyTip: 'Wrangler con techo blando: acceso por cremallera del techo es más rápido que la ganzúa.'
  },
];

const DODGE_RAM: CarPreset[] = [
  {
    model: '2015 RAM 1500',
    chip: 'ID46 (FOBIK)',
    keyType: 'FOBIK 3B / Y159 chip',
    freq: '433 MHz',
    programMethod: 'OBD2 con PIN por VIN (Chrysler/NASTF). Borrado de FOBIKs previos recomendado.',
    defaultIssue: 'RAM 1500 FOBIK PERDIDA - PROGRAMAR CON PIN POR VIN.',
    lishiTool: 'Lishi CY24 (2-in-1)',
    lockoutMethod: 'Ganzúa CY24 en puerta de conductor o bolsa de aire en marco.',
    obdLocation: 'Bajo el tablero del conductor.',
    emergencyTip: 'RAM 2013+: si el cliente tiene el código de la puerta (keypad), evitar la ganzúa por completo.'
  },
  {
    model: '2013 DODGE JOURNEY',
    chip: 'ID46 (FOBIK)',
    keyType: 'FOBIK IKT 3B',
    freq: '433 MHz',
    programMethod: 'OBD2 con PIN Chrysler (por VIN o lectura RFHUB).',
    defaultIssue: 'JOURNEY FOBIK DESCONFIGURADO - REPROGRAMACIÓN.',
    lishiTool: 'Lishi CY24 (2-in-1)',
    lockoutMethod: 'Ganzúa CY24 o cuña + varilla por ventana trasera.',
    obdLocation: 'Centro bajo del tablero.',
    emergencyTip: 'Journey con llave de encendido física + FOBIK: verificar si falla el WIN module antes de programar.'
  },
  {
    model: '2013 DODGE GRAND CARAVAN',
    chip: 'ID46 (FOBIK)',
    keyType: 'FOBIK IKT 6B',
    freq: '433 MHz',
    programMethod: 'OBD2 con PIN por VIN (Chrysler).',
    defaultIssue: 'GRAND CARAVAN FOBIK PERDIDA - PROGRAMAR PROXIMITY.',
    lishiTool: 'Lishi CY24 (2-in-1)',
    lockoutMethod: 'Puerta corrediza trasera: ganzúa CY24 o varilla por ventana.',
    obdLocation: 'Bajo el tablero del conductor.',
    emergencyTip: 'Caravan con sistema de puerta manos-libres: el sensor bajo la carrocería puede activarse por error — desactivar antes.'
  },
];

const VOLKSWAGEN: CarPreset[] = [
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
  },
  {
    model: '2015 VOLKSWAGEN GOLF',
    chip: 'ID48 (Megamos / CAN)',
    keyType: 'Navaja HU66 (3 Botones)',
    freq: '315 MHz',
    programMethod: 'OBD2 con lectura CS (Inmo 4). Golf 2015+ MQB requiere ID88/Aristo.',
    defaultIssue: 'GOLF LLAVE NAVAJA PERDIDA - PROGRAMACIÓN IMMO4.',
    lishiTool: 'Lishi HU66 (2-in-1 Gen 3)',
    lockoutMethod: 'Ganzúa HU66 en puerta de conductor.',
    obdLocation: 'Bajo el tablero, lado izquierdo.',
    emergencyTip: 'Golf/GTI 2015+ (MQB): chip ID88 con crypto largo — usar VVDI/Autel con soporte MQB o llave preparada.'
  },
];

const MAZDA_MITSUBISHI: CarPreset[] = [
  {
    model: '2014 MAZDA 3',
    chip: 'ID4D (Texas Crypto 63/67)',
    keyType: 'Espada MZ31 / flip laser HU101',
    freq: '315 MHz',
    programMethod: 'OBD2 con Autel / KM100 (PIN Mazda). Añadir requiere llave válida.',
    defaultIssue: 'MAZDA 3 COPIA DE LLAVE - PROGRAMAR TRANSPONDER 4D.',
    lishiTool: 'Lishi MZ32 (2-in-1)',
    lockoutMethod: 'Ganzúa MZ32 en puerta de conductor.',
    obdLocation: 'Bajo la cubierta izquierda del tablero.',
    emergencyTip: 'Mazda 2014+: modelos con advanced keyless requieren fob completo, no solo espada con chip.'
  },
  {
    model: '2016 MAZDA CX-5',
    chip: 'ID4D (Texas Crypto)',
    keyType: 'Smart Key 4B (prox)',
    freq: '315 MHz',
    programMethod: 'OBD2 con PIN Mazda / register prox con IM608.',
    defaultIssue: 'CX-5 SMART KEY PERDIDA - PROGRAMACIÓN PROXIMITY.',
    lishiTool: 'No aplica (proximity) — cuña + gancho',
    lockoutMethod: 'Cuña + varilla por marco; manija con llave física de respaldo.',
    obdLocation: 'Bajo el tablero del conductor.',
    emergencyTip: 'CX-5 con motor Skyactiv: no desconectar batería sin puente — reloj/BCM requieren reinicio.'
  },
  {
    model: '2013 MITSUBISHI OUTLANDER',
    chip: 'ID46 (Mitsubishi)',
    keyType: 'Remote Head MIT8A',
    freq: '315 MHz',
    programMethod: 'OBD2 con PIN Mitsubishi (VIN) o clonar ID46.',
    defaultIssue: 'OUTLANDER REMOTE HEAD PERDIDA - PROGRAMAR O CLONAR.',
    lishiTool: 'Lishi MIT8 (2-in-1)',
    lockoutMethod: 'Ganzúa MIT8 en puerta de conductor.',
    obdLocation: 'Bajo el tablero del conductor.',
    emergencyTip: 'Outlander Sport comparte ficha; Outlander PHEV requiere procedimiento híbrido especial.'
  },
];

const GM_OTHER: CarPreset[] = [
  {
    model: '2014 GMC TERRAIN',
    chip: 'ID46 (Circle Plus)',
    keyType: 'Standard / flip HU100',
    freq: '315 MHz',
    programMethod: 'OBD2 (Autel). Mismo procedimiento que Chevrolet/GMC Circle+.',
    defaultIssue: 'TERRAIN LLAVE PERDIDA - PROGRAMAR CIRCLE PLUS.',
    lishiTool: 'Lishi HU100 (2-in-1)',
    lockoutMethod: 'Lishi HU100 en puerta de conductor.',
    obdLocation: 'Bajo el tablero, lado del conductor.',
    emergencyTip: 'Terrain 2013+ con apagado automático: mantener puerta abierta puede bloquear programación OBD2.'
  },
  {
    model: '2013 BUICK ENCORE',
    chip: 'ID46 (Circle Plus)',
    keyType: 'Standard / flip HU100',
    freq: '315 MHz',
    programMethod: 'OBD2 (Autel / JMD). PIN por VIN si es pérdida total.',
    defaultIssue: 'ENCORE COPIA DE LLAVE - HU100 + CIRCLE PLUS.',
    lishiTool: 'Lishi HU100 (2-in-1)',
    lockoutMethod: 'Lishi HU100 o cuña + gancho.',
    obdLocation: 'Bajo la guantera.',
    emergencyTip: 'Encore 2013+: sistema BUICK con sensor en manija — usar tope en la varilla para no dañar.'
  },
];

export const PRESET_CAR_MODELS: CarPreset[] = [
  ...TOYOTA,
  ...HONDA,
  ...NISSAN,
  ...FORD,
  ...CHEVROLET,
  ...HYUNDAI,
  ...KIA,
  ...JEEP,
  ...DODGE_RAM,
  ...VOLKSWAGEN,
  ...MAZDA_MITSUBISHI,
  ...GM_OTHER,
];

/** Marca (para agrupar el selector por marca) derivada del nombre del modelo. */
export function presetBrand(preset: CarPreset): string {
  const brand = preset.model.split(' ').slice(1, -1).find(w =>
    /^(TOYOTA|HONDA|NISSAN|FORD|CHEVROLET|HYUNDAI|KIA|JEEP|DODGE|RAM|VOLKSWAGEN|MAZDA|MITSUBISHI|GMC|BUICK)$/i.test(w)
  );
  return brand || 'OTROS';
}

/** Orden estable de marcas para el selector. */
export const PRESET_BRAND_ORDER: string[] = [
  'TOYOTA', 'HONDA', 'NISSAN', 'FORD', 'CHEVROLET',
  'HYUNDAI', 'KIA', 'JEEP', 'DODGE', 'RAM',
  'VOLKSWAGEN', 'MAZDA', 'MITSUBISHI', 'GMC', 'BUICK',
];
