import { describe, it, expect } from 'vitest';
import { parseBackupJson } from './export';
import type { BackupPayload } from './export';

describe('Data portability and export utilities', () => {
  it('parses valid backup JSON correctly', () => {
    const mockBackup: BackupPayload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      profile: {
        name: 'Alexandr Motologa',
        email: 'alex@motologa.com',
        address: 'Bucharest',
        defaultCurrency: 'EUR',
        defaultTaxRate: 19,
        defaultPaymentTermsDays: 14,
        accentColor: '#0f172a',
      },
      clients: [
        { id: '1', name: 'Client A' },
      ],
      savedInvoices: [],
      servicePresets: [
        { id: 'p1', title: 'Consulting', description: 'Advisory', unit: 'hours', unitPrice: 100 },
      ],
    };

    const parsed = parseBackupJson(JSON.stringify(mockBackup));
    expect(parsed.version).toBe(1);
    expect(parsed.profile.name).toBe('Alexandr Motologa');
    expect(parsed.clients).toHaveLength(1);
    expect(parsed.servicePresets).toHaveLength(1);
  });

  it('throws an error on corrupted backup JSON', () => {
    expect(() => parseBackupJson('{}')).toThrow('Invalid BillGram backup format');
  });
});
