import { describe, it, expect } from 'vitest';
import { computeTargetDimensions, compressImage } from './image';

describe('Compresión de imágenes', () => {
  it('no escala imágenes ya más pequeñas que el máximo', () => {
    expect(computeTargetDimensions(640, 480, 900)).toEqual({ width: 640, height: 480 });
  });

  it('reduce manteniendo la proporción', () => {
    expect(computeTargetDimensions(1920, 1080, 900)).toEqual({ width: 900, height: 506 });
    expect(computeTargetDimensions(1080, 1920, 900)).toEqual({ width: 506, height: 900 });
  });

  it('maneja dimensiones inválidas sin lanzar errores', () => {
    expect(computeTargetDimensions(0, 0, 900)).toEqual({ width: 900, height: 900 });
    expect(computeTargetDimensions(NaN, 100, 900)).toEqual({ width: 900, height: 900 });
  });

  it('devuelve el original si no es un data URL de imagen', async () => {
    expect(await compressImage('texto-plano')).toBe('texto-plano');
  });
});
