/**
 * Calcula las dimensiones destino al reducir una imagen manteniendo el aspecto.
 * Función pura (testeable sin DOM).
 */
export function computeTargetDimensions(
  width: number,
  height: number,
  maxDim: number
): { width: number; height: number } {
  if (!isFinite(width) || !isFinite(height) || width <= 0 || height <= 0) {
    return { width: maxDim, height: maxDim };
  }
  if (width <= maxDim && height <= maxDim) {
    return { width: Math.round(width), height: Math.round(height) };
  }
  const scale = maxDim / Math.max(width, height);
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/**
 * Comprime una imagen (data URL) reduciéndola a maxDim px y calidad JPEG,
 * para que las fotos de servicio no saturen la cuota de localStorage (~5MB).
 * Si el entorno no soporta canvas/Image, devuelve el original.
 */
export async function compressImage(dataUrl: string, maxDim = 900, quality = 0.7): Promise<string> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') return dataUrl;
  if (!dataUrl.startsWith('data:image/')) return dataUrl;

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error('image decode failed'));
      image.src = dataUrl;
    });

    const { width, height } = computeTargetDimensions(img.naturalWidth, img.naturalHeight, maxDim);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return dataUrl;
  }
}
