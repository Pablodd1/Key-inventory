import type { AppData } from './types';

export const BACKUP_VERSION = 1;
export const BACKUP_APP_ID = 'miami-autokey';

export interface BackupEnvelope {
  app: string;
  version: number;
  exportedAt: string;
  data: AppData;
}

export function createBackup(data: AppData): BackupEnvelope {
  return {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export function serializeBackup(data: AppData): string {
  return JSON.stringify(createBackup(data), null, 2);
}

export class BackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BackupError';
  }
}

function isRecordArray(v: unknown): boolean {
  return Array.isArray(v) && v.every(item => item !== null && typeof item === 'object');
}

/**
 * Valida y convierte el texto de un respaldo JSON en datos de la app.
 * Lanza BackupError con un mensaje en español si el archivo no es válido.
 */
export function parseBackup(text: string): BackupEnvelope {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupError('El archivo no es un JSON válido.');
  }

  const env = parsed as Partial<BackupEnvelope> & { data?: Partial<AppData> };
  if (!env || typeof env !== 'object' || env.app !== BACKUP_APP_ID) {
    throw new BackupError('El archivo no es un respaldo de Miami Auto-Key.');
  }
  if (typeof env.version !== 'number' || env.version > BACKUP_VERSION) {
    throw new BackupError(`Versión de respaldo no soportada (${env.version}). Actualice la app.`);
  }
  const d = env.data;
  if (!d || typeof d !== 'object') {
    throw new BackupError('El respaldo no contiene datos.');
  }
  if (!isRecordArray(d.clients) || !isRecordArray(d.inventory) || !isRecordArray(d.history)) {
    throw new BackupError('El respaldo tiene datos corruptos (clientes/inventario/historial).');
  }
  if (typeof d.revenue !== 'number' || !isFinite(d.revenue) || d.revenue < 0) {
    throw new BackupError('El respaldo tiene un valor de ganancia inválido.');
  }

  return {
    app: BACKUP_APP_ID,
    version: env.version,
    exportedAt: env.exportedAt || '',
    data: {
      clients: d.clients!,
      inventory: d.inventory!,
      history: d.history!,
      revenue: d.revenue,
    },
  };
}

export function downloadTextFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
