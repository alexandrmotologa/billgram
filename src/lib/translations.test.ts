import { describe, it, expect } from 'vitest';
import { getTranslations } from './translations';

describe('Translations dictionary', () => {
  it('returns English translations by default', () => {
    const t = getTranslations('en');
    expect(t.invoiceTitle).toBe('INVOICE');
    expect(t.billedBy).toBe('BILLED BY');
    expect(t.totalDue).toBe('TOTAL DUE');
  });

  it('returns Romanian translations', () => {
    const t = getTranslations('ro');
    expect(t.invoiceTitle).toBe('FACTURĂ');
    expect(t.billedBy).toBe('FURNIZOR');
    expect(t.totalDue).toBe('TOTAL DE PLATĂ');
  });

  it('returns German translations', () => {
    const t = getTranslations('de');
    expect(t.invoiceTitle).toBe('RECHNUNG');
    expect(t.totalDue).toBe('GESAMTBETRAG');
  });

  it('returns French translations', () => {
    const t = getTranslations('fr');
    expect(t.invoiceTitle).toBe('FACTURE');
    expect(t.totalDue).toBe('NET À PAYER');
  });
});
