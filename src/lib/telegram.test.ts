import { describe, it, expect } from 'vitest';
import { generatePaymentReminderMessage } from './telegram';
import type { Invoice } from '../types/invoice';

describe('Telegram helper functions', () => {
  it('generates polite chat reminder message for SEPA', () => {
    const mockInvoice: Invoice = {
      id: 'inv_1',
      number: 'INV-2026-042',
      issueDate: '2026-10-05',
      dueDate: '2026-10-19',
      status: 'sent',
      sender: {
        name: 'Alexandr Motologa',
        email: 'alex@motologa.com',
        address: 'Bucharest',
        defaultCurrency: 'EUR',
        defaultTaxRate: 19,
        defaultPaymentTermsDays: 14,
        accentColor: '#0f172a',
      },
      client: {
        id: 'cli_1',
        name: 'Acme Corp',
        email: 'acme@example.com',
      },
      items: [
        {
          id: 'item_1',
          description: 'Consulting',
          quantity: 2,
          unit: 'days',
          unitPrice: 500,
        },
      ],
      currency: 'EUR',
      taxRate: 19,
      isTaxExempt: false,
      payment: {
        method: 'sepa',
        beneficiaryName: 'Alexandr Motologa',
        iban: 'RO49BTRL0000000000000000',
        bic: 'BTRLRO22',
        bankName: 'Banca Transilvania',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const msg = generatePaymentReminderMessage(mockInvoice);
    expect(msg).toContain('Hi Acme Corp');
    expect(msg).toContain('INV-2026-042');
    expect(msg).toContain('RO49BTRL0000000000000000');
    expect(msg).toContain('Banca Transilvania');
    expect(msg).toContain('Alexandr Motologa');
  });
});
