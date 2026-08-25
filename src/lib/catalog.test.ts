import { describe, it, expect } from 'vitest';
import { PRESET_CAR_MODELS, presetBrand } from '../data/presets';
import { matchPresetByBrand } from './domain';

describe('Catálogo de fichas técnicas', () => {
  it('tiene un catálogo amplio (≥ 30 fichas)', () => {
    expect(PRESET_CAR_MODELS.length).toBeGreaterThanOrEqual(30);
  });

  it('modelos únicos y completos (todos los campos con contenido)', () => {
    const models = new Set<string>();
    for (const p of PRESET_CAR_MODELS) {
      expect(models.has(p.model), `modelo duplicado: ${p.model}`).toBe(false);
      models.add(p.model);
      for (const [key, value] of Object.entries(p)) {
        expect(String(value).trim().length, `${p.model}: campo vacío ${key}`).toBeGreaterThan(3);
      }
    }
  });

  it('deriva la marca correctamente para agrupar el selector', () => {
    const byModel = (m: string) => PRESET_CAR_MODELS.find(p => p.model === m)!;
    expect(presetBrand(byModel('2005 TOYOTA COROLLA'))).toBe('TOYOTA');
    expect(presetBrand(byModel('2015 RAM 1500'))).toBe('RAM');
    expect(presetBrand(byModel('2013 BUICK ENCORE'))).toBe('BUICK');
  });

  it('el comando de voz sigue encontrando fichas por marca en el catálogo ampliado', () => {
    expect(matchPresetByBrand('kia', PRESET_CAR_MODELS)?.model).toContain('KIA');
    expect(matchPresetByBrand('dodge', PRESET_CAR_MODELS)?.model).toContain('DODGE');
    expect(matchPresetByBrand('mazda', PRESET_CAR_MODELS)?.model).toContain('MAZDA');
    expect(matchPresetByBrand('mitsubishi', PRESET_CAR_MODELS)?.model).toContain('MITSUBISHI');
    expect(matchPresetByBrand('toyota', PRESET_CAR_MODELS)?.model).toBe('2005 TOYOTA COROLLA');
  });
});
