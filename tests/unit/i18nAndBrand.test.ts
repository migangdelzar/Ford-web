import { describe, it, expect } from 'vitest';
import i18n, { BRAND_CONFIG } from '../../src/shared/i18n';

describe('Brand Configuration & Localization (i18n)', () => {
  it('contains valid dealership brand metadata', () => {
    expect(BRAND_CONFIG.name).toBe('Ford');
    expect(BRAND_CONFIG.emailDomain).toBe('ford.mx');
    expect(BRAND_CONFIG.tagline).toBe('CRM de Ventas');
  });

  it('translates core UI keys in Mexican Spanish', () => {
    expect(i18n.t('brand.name')).toBe('Ford');
    expect(i18n.t('takeover.advisor')).toBe('Asesor');
    expect(i18n.t('takeover.botOnly')).toBe('Bot');
    expect(i18n.t('temperature.hot')).toBe('Caliente');
    expect(i18n.t('temperature.warm')).toBe('Tibio');
    expect(i18n.t('temperature.cold')).toBe('Frío');
  });

  it('provides localized labels for commercial vehicle catalog', () => {
    expect(i18n.t('prospect.title')).toBe('Ficha del Prospecto');
    expect(i18n.t('prospect.purchaseFile')).toBe('Expediente del Prospecto');
  });
});
