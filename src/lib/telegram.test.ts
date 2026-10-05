import { describe, it, expect } from 'vitest';
import { generatePaymentReminderMessage } from './telegram';
import type { Invoice } from '../types/invoice';

describe('Telegram helper functions', () => {
  it('generates polite chat reminder message in English', () => {
    const mockInvoice: Invoice = {
      id: 'inv_1',
      number: 'INV-2026-042',
      issueDate: '2026-10-05',
      dueDate: '2026-10-19',
      status: 'sent',
      language: 'en',
      templateLayout: 'swiss',
      includeSignature: false,
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

  it('generates reminder message in Romanian', () => {
    const mockInvoiceRo: Invoice = {
      id: 'inv_ro',
      number: 'INV-2026-099',
      issueDate: '2026-10-05',
      dueDate: '2026-10-19',
      status: 'sent',
      language: 'ro',
      templateLayout: 'swiss',
      includeSignature: false,
      sender: {
        name: 'Alexandr Motologa',
        email: 'alex@motologa.com',
        address: 'Bucuresti',
        defaultCurrency: 'RON',
        defaultTaxRate: 19,
        defaultPaymentTermsDays: 14,
        accentColor: '#0f172a',
      },
      client: {
        id: 'cli_ro',
        name: 'Client Roman SRL',
      },
      items: [
        {
          id: 'item_ro',
          description: 'Servicii IT',
          quantity: 1,
          unit: 'service',
          unitPrice: 2000,
        },
      ],
      currency: 'RON',
      taxRate: 19,
      isTaxExempt: false,
      payment: {
        method: 'sepa',
        beneficiaryName: 'Alexandr Motologa',
        iban: 'RO49BTRL0000000000000000',
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const msgRo = generatePaymentReminderMessage(mockInvoiceRo);
    expect(msgRo).toContain('Salut Client Roman SRL');
    expect(msgRo).toContain('memento amical');
    expect(msgRo).toContain('INV-2026-099');
  });
});
