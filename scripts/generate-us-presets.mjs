import fs from 'fs';
import path from 'path';

const srcDir = 'C:/Users/jasme/Downloads/us-car-models-data';
const outFile = 'C:/Users/jasme/Downloads/Key-inventory/src/data/usPresets.generated.ts';

// Existing models to avoid duplication (normalize to MAKE MODEL without year)
const existingModels = new Set([
  'TOYOTA COROLLA','TOYOTA CAMRY','TOYOTA RAV4','TOYOTA SIENNA','TOYOTA YARIS',
  'HONDA CIVIC','HONDA ACCORD','HONDA CR-V','HONDA ODYSSEY',
  'NISSAN SENTRA','NISSAN ALTIMA','NISSAN VERSA','NISSAN ROGUE',
  'FORD F-150','FORD ESCAPE','FORD FOCUS','FORD EXPLORER',
  'CHEVROLET CAMARO','CHEVROLET SILVERADO','CHEVROLET CRUZE','CHEVROLET MALIBU',
  'HYUNDAI ELANTRA','HYUNDAI SONATA','HYUNDAI TUCSON',
  'KIA FORTE','KIA OPTIMA','KIA SOUL',
  'JEEP GRAND CHEROKEE','JEEP WRANGLER',
  'RAM 1500','DODGE JOURNEY','DODGE GRAND CARAVAN',
  'VOLKSWAGEN JETTA','VOLKSWAGEN GOLF',
  'MAZDA 3','MAZDA CX-5','MITSUBISHI OUTLANDER',
  'GMC TERRAIN','BUICK ENCORE',
  // variants with extra words
  'MAZDA 3','BUICK ENCORE','GMC TERRAIN'
]);

// Make -> locksmith profile mapping (generic but useful)
const MAKE_PROFILES = {
  'ACURA': { chip:'ID46 (Philips Crypto)', keyType:'Espada HO01 / Smart', freq:'313.8 MHz', lishi:'Lishi HON66 (2-in-1)', obd:'Bajo el tablero del conductor, lado izquierdo.' },
  'ALFA ROMEO': { chip:'ID48 (Megamos Crypto)', keyType:'Navaja HU66', freq:'433 MHz', lishi:'Lishi HU66 (2-in-1 Gen 3)', obd:'Bajo el tablero del conductor.' },
  'ASTON MARTIN': { chip:'ID46 / Hitag2', keyType:'Smart Key 315MHz', freq:'315 MHz', lishi:'Lishi HU101 (2-in-1)', obd:'Bajo el tablero, lado del conductor. Verificar por VIN (edición limitada).' },
  'AUDI': { chip:'ID48 (Megamos / MQB)', keyType:'Navaja HU66 / Smart', freq:'315 MHz', lishi:'Lishi HU66 (2-in-1 Gen 3)', obd:'Bajo el tablero, unidad BCM lado conductor.' },
  'BENTLEY': { chip:'ID48', keyType:'Smart Key', freq:'433 MHz', lishi:'No aplica — cuña + gancho (alto valor, extrema precaución)', obd:'Consultar dealer — BCM protegido.' },
  'BMW': { chip:'CAS3/CAS4 / FEM/BDC (Hitag)', keyType:'Smart Key HU100R', freq:'315 MHz', lishi:'Lishi HU100R (2-in-1)', obd:'Bajo el tablero, lado del conductor cerca del pedal de freno. Requiere PIN por VIN (BMW).' },
  'BUICK': { chip:'ID46 (Circle Plus)', keyType:'Flip HU100', freq:'315 MHz', lishi:'Lishi HU100 (2-in-1)', obd:'Bajo el tablero del conductor.' },
  'CADILLAC': { chip:'ID46 (Circle Plus / PEPS)', keyType:'Smart Key 5B', freq:'315 MHz', lishi:'Lishi HU100 (2-in-1)', obd:'Bajo el tablero del conductor, módulo PEPS.' },
  'CHEVROLET': { chip:'ID46 (Circle Plus)', keyType:'Navaja HU100 / Smart', freq:'315 MHz', lishi:'Lishi HU100 (2-in-1)', obd:'Bajo el tablero del conductor.' },
  'CHRYSLER': { chip:'ID46 (FOBIK)', keyType:'FOBIK 4B', freq:'433 MHz', lishi:'Lishi CY24 (2-in-1)', obd:'Módulo RFHUB — cable 12+8 detrás del estéreo (SGW).' },
  'DODGE': { chip:'ID46 (FOBIK)', keyType:'FOBIK 4B', freq:'433 MHz', lishi:'Lishi CY24 (2-in-1)', obd:'Módulo RFHUB con bypass SGW.' },
  'FIAT': { chip:'ID46 / 4A', keyType:'Flip SIP22', freq:'433 MHz', lishi:'Lishi SIP22 (2-in-1)', obd:'Bajo el tablero del conductor.' },
  'FORD': { chip:'ID4D-80 / PATS (HU101)', keyType:'Remote Head HU101 / Smart', freq:'315 MHz', lishi:'Lishi HU101 (2-in-1)', obd:'Debajo del tablero del conductor.' },
  'GENESIS': { chip:'ID47 (Hitag3)', keyType:'Smart Key', freq:'433 MHz', lishi:'Lishi HY22 (2-in-1)', obd:'Fusiblera interior lado conductor, PIN 6 dígitos por VIN.' },
  'GMC': { chip:'ID46 (Circle Plus)', keyType:'Flip HU100', freq:'315 MHz', lishi:'Lishi HU100 (2-in-1)', obd:'Bajo el tablero del conductor.' },
  'HONDA': { chip:'ID46 / ID47 (según año)', keyType:'Espada HO01 / Smart', freq:'313.8 MHz', lishi:'Lishi HON66 (2-in-1)', obd:'Centro inferior bajo columna de dirección.' },
  'HYUNDAI': { chip:'ID47 (Hitag3)', keyType:'Smart Key HY14', freq:'433 MHz', lishi:'Lishi HY22 (2-in-1)', obd:'Detrás de fusiblera interior izquierdo, PIN 6 dígitos.' },
  'INFINITI': { chip:'ID46 / 4A Smart', keyType:'Smart Key 4B', freq:'315 MHz', lishi:'Lishi NSN14 / Smart', obd:'BCM bajo tablero, PIN 4 dígitos.' },
  'JAGUAR': { chip:'ID48 / Smart', keyType:'Smart Key', freq:'433 MHz', lishi:'No aplica — cuña + gancho', obd:'BCM protegido, consultar dealer.' },
  'JEEP': { chip:'Hitag AES / FOBIK', keyType:'FOBIK / Proximity', freq:'433 MHz', lishi:'Lishi CY24 (2-in-1)', obd:'Módulo RFHUB con cable 12+8 si tiene SGW.' },
  'KIA': { chip:'ID47 (Hitag3)', keyType:'Smart Key', freq:'433 MHz', lishi:'Lishi HY22 (2-in-1)', obd:'Fusiblera interior, PIN 6 dígitos.' },
  'LAND ROVER': { chip:'ID48 / Smart', keyType:'Smart Key', freq:'433 MHz', lishi:'No aplica — cuña + gancho', obd:'BCM lado pasajero, protegido.' },
  'LEXUS': { chip:'ID46 / ID74 (G/H)', keyType:'Smart Key', freq:'315 MHz', lishi:'Lishi TOY48 (2-in-1)', obd:'Bajo tablero del conductor, PIN por VIN (Toyota/Lexus).' },
  'LINCOLN': { chip:'ID4D-80 (PATS)', keyType:'Intelligent Access 4B', freq:'315 MHz', lishi:'Lishi HU101 (2-in-1)', obd:'Módulo RFA bajo tablero.' },
  'MASERATI': { chip:'ID46', keyType:'Smart Key', freq:'433 MHz', lishi:'No aplica — cuña + gancho', obd:'Consultar dealer.' },
  'MAZDA': { chip:'ID4D (Texas Crypto)', keyType:'Flip laser HU101 / Smart', freq:'315 MHz', lishi:'Lishi MZ32 (2-in-1)', obd:'Bajo tablero del conductor.' },
  'MERCEDES-BENZ': { chip:'NEC / BGA (EZS)', keyType:'Smart Key HU64', freq:'315 MHz', lishi:'Lishi HU64 (2-in-1)', obd:'EIS bajo volante — programar por IR/OBD con VVDI/Xhorse.' },
  'MERCURY': { chip:'ID4D PATS', keyType:'H72 / HU101', freq:'315 MHz', lishi:'Lishi HU101 (2-in-1)', obd:'Bajo tablero del conductor.' },
  'MINI': { chip:'CAS / BDC', keyType:'Smart Key', freq:'315 MHz', lishi:'Lishi HU100R (2-in-1)', obd:'BCM bajo guantera, requerirá PIN BMW/MINI.' },
  'MITSUBISHI': { chip:'ID46', keyType:'Remote Head MIT8A', freq:'315 MHz', lishi:'Lishi MIT8 (2-in-1)', obd:'Bajo tablero del conductor.' },
  'NISSAN': { chip:'ID46 (PCF7936) / 4A', keyType:'NSN14 / Smart 4B', freq:'315 MHz', lishi:'Lishi NSN14 (2-in-1)', obd:'BCM tras tapa guantera, PIN 4 dígitos.' },
  'PORSCHE': { chip:'Megamos AES', keyType:'Smart Key', freq:'433 MHz', lishi:'No aplica — cuña + gancho', obd:'BCM protegido, dealer.' },
  'RAM': { chip:'ID46 (FOBIK)', keyType:'FOBIK 3B', freq:'433 MHz', lishi:'Lishi CY24 (2-in-1)', obd:'RFHUB con bypass SGW.' },
  'SUBARU': { chip:'4D-62 / G chip', keyType:'Espada DAT17 / Smart', freq:'315 MHz', lishi:'Lishi DAT17 (2-in-1)', obd:'Bajo tablero del conductor, PIN por VIN (Subaru SSM).' },
  'TESLA': { chip:'BLE / NFC (App/Card)', keyType:'Smart Access (sin espada)', freq:'BLE 2.4 GHz', lishi:'No aplica — sin cilindro mecánico; cuña + gancho solo emergencia', obd:'No OBD — programar vía app Tesla.' },
  'TOYOTA': { chip:'ID46 / ID74 (G/H) / ID47 (Smart)', keyType:'Espada TOY43/TOY48 / Smart', freq:'315 MHz', lishi:'Lishi TOY43/TOY48', obd:'Bajo tablero del conductor.' },
  'VOLKSWAGEN': { chip:'ID48 (Megamos / MQB)', keyType:'Navaja HU66', freq:'315 MHz', lishi:'Lishi HU66 (2-in-1 Gen 3)', obd:'BCM bajo tablero, Component Security.' },
  'VOLVO': { chip:'ID48 / 4A Smart', keyType:'Smart Key', freq:'315 MHz', lishi:'Lishi HU56 (2-in-1)', obd:'CEM bajo guantera, programar con VDASH/PIN.' },
};

function getProfile(make) {
  const key = make.toUpperCase().trim();
  return MAKE_PROFILES[key] || {
    chip:'ID46 / ID47 (según año — verificar por VIN)',
    keyType:'Llave transponder / Smart (según versión)',
    freq:'315 MHz',
    lishi:`${key} — Verificar perfil Lishi por año/VIN`,
    obd:'Bajo el tablero del conductor (verificar por año específico).'
  };
}

// Read CSVs: use 2018-2024 to get recent popular models, deduplicate by MAKE+MODEL
const years = [2018,2019,2020,2021,2022,2023,2024];
const seen = new Set(); // MAKE||MODEL uppercase key
const entries = []; // {year, make, model}

for (const y of years) {
  const p = path.join(srcDir, `${y}.csv`);
  if (!fs.existsSync(p)) continue;
  const txt = fs.readFileSync(p, 'utf8');
  const lines = txt.split(/\r?\n/);
  // header year,make,model,body_styles
  for (let i=1;i<lines.length;i++) {
    const line=lines[i].trim();
    if(!line) continue;
    // naive CSV: "year,make,model,body" but body_styles contains quoted commas. Instead split first 3 fields.
    // format: YEAR,MAKE,MODEL,"[...]"  -> we need to parse make/model with commas? make/model no commas.
    // Use regex: ^(\d+),([^,]+),([^,]+),
    const m = line.match(/^(\d+),([^,]+),([^,]+),/);
    if(!m) continue;
    const year = parseInt(m[1],10);
    let make = m[2].trim().replace(/^"|"$/g,'');
    let model = m[3].trim().replace(/^"|"$/g,'');
    if(!make || !model) continue;
    // Normalize: uppercase make/model
    const key = `${make.toUpperCase()}|${model.toUpperCase()}`;
    if (seen.has(key)) continue;
    // Filter out very rare or duplicates with existing presets
    const simpleKey = `${make.toUpperCase()} ${model.toUpperCase()}`;
    if (existingModels.has(simpleKey)) continue;
    // Also skip if model contains slash or is too long weird
    if (model.length>30) continue;
    // Keep only if make+model combo seen first time (prefer newest year first? we iterate 2018->2024, so later years overwrite? Instead keep first seen with newest year priority: we iterate reverse years)
    // For now, just add with latest year tracking: we want latest year for model string
    // Since we iterate oldest->newest, newer will be skipped due to seen. To keep newest, iterate newest first.
    seen.add(key);
    entries.push({ year, make, model });
  }
}

// Actually we iterated oldest->newest, so first seen is oldest. Better to collect with max year per make|model
// Let's re-process to keep max year per key
const byKey = new Map();
for (const y of years.sort((a,b)=>b-a)) { // newest first
  const p = path.join(srcDir, `${y}.csv`);
  if (!fs.existsSync(p)) continue;
  const txt = fs.readFileSync(p, 'utf8');
  const lines = txt.split(/\r?\n/);
  for (let i=1;i<lines.length;i++) {
    const line=lines[i].trim();
    if(!line) continue;
    const m = line.match(/^(\d+),([^,]+),([^,]+),/);
    if(!m) continue;
    let make = m[2].trim().replace(/^"|"$/g,'');
    let model = m[3].trim().replace(/^"|"$/g,'');
    if(!make || !model) continue;
    const key = `${make.toUpperCase()}|${model.toUpperCase()}`;
    const simpleKey = `${make.toUpperCase()} ${model.toUpperCase()}`;
    if (existingModels.has(simpleKey)) continue;
    if (byKey.has(key)) continue; // already has newest year
    if (model.length>30) continue;
    byKey.set(key, { year: parseInt(m[1],10), make, model });
  }
}
const deduped = [...byKey.values()];
// Now filter to keep only significant makes: we want at least 300 models, focus on passenger cars/trucks
// Sort by make then model
deduped.sort((a,b)=> a.make.localeCompare(b.make) || a.model.localeCompare(b.model));

console.log(`Found ${deduped.length} unique new models (not in 39 presets) from 2018-2024`);
// Limit to top ~350 to keep file manageable, prioritize common makes if too many
let finalList = deduped;
// Keep all 659 unique models (no trim) to include TESLA, SUBARU, etc. sorted alphabetically
console.log(`Using all ${finalList.length} unique models (no trim)`);
// Generate TS
let ts = `import type { CarPreset } from '../lib/types';\n\n`;
ts += `// Auto-generado desde https://github.com/abhionlyone/us-car-models-data (2018-2024)\n`;
ts += `// Combinado con ficha base de cerrajería (chip/programación genérica por marca — verificar por VIN).\n`;
ts += `// Total nuevos modelos: ${finalList.length} + 39 manuales = ${finalList.length+39} presets totales.\n\n`;
ts += `export const US_GENERATED: CarPreset[] = [\n`;
for (const e of finalList) {
  const profile = getProfile(e.make);
  // Build model string like "2024 TOYOTA CAMRY" (use latest year found for that model)
  const modelStr = `${e.year} ${e.make.toUpperCase()} ${e.model.toUpperCase()}`;
  // Escape quotes
  const esc = (s)=> s.replace(/'/g,"\\'").replace(/"/g,'\\"');
  ts += `  {\n`;
  ts += `    model: '${esc(modelStr)}',\n`;
  ts += `    chip: '${esc(profile.chip)}',\n`;
  ts += `    keyType: '${esc(profile.keyType)}',\n`;
  ts += `    freq: '${profile.freq}',\n`;
  ts += `    programMethod: 'OBD2 con Autel IM608 / VVDI / KM100. Verificar por VIN y año exacto (${e.year}). Requiere PIN si es smart/proximity.',\n`;
  ts += `    defaultIssue: '${esc(e.make.toUpperCase())} ${esc(e.model.toUpperCase())} (${e.year}) - SERVICIO DE LLAVE / FOB EN SITIO.',\n`;
  ts += `    lishiTool: '${esc(profile.lishi)}',\n`;
  ts += `    lockoutMethod: 'Ganzúa ${esc(profile.lishi.split(' ')[0])} en puerta de conductor o cuña neumática + varilla (verificar por año).',\n`;
  ts += `    obdLocation: '${esc(profile.obd)}',\n`;
  ts += `    emergencyTip: 'Verificar chip y perfil por VIN antes de cortar/programar. Año ${e.year} puede variar entre transponder y smart key.'\n`;
  ts += `  },\n`;
}
ts += `];\n`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, ts, 'utf8');
console.log(`Wrote ${outFile} with ${finalList.length} presets`);
console.log(`Example: ${finalList.slice(0,3).map(e=>e.year+" "+e.make+" "+e.model).join(", ")}`);
