import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  calculateLineItemTotal,
  calculateInvoiceTotals,
} from './currency';
import type { LineItem } from '../types/invoice';

describe('currency utilities', () => {
  it('formats EUR and USD amounts correctly', () => {
    const formattedEur = formatCurrency(1250.5, 'EUR');
    expect(formattedEur).toContain('1.250,50'); // German/Euro locale
    expect(formattedEur).toContain('€');

    const formattedUsd = formatCurrency(1250.5, 'USD');
    expect(formattedUsd).toContain('$');
    expect(formattedUsd).toContain('1,250.50');
  });

  it('calculates line item total without discount', () => {
    const item: LineItem = {
      id: '1',
      description: 'Web development',
      quantity: 10,
      unit: 'hours',
      unitPrice: 50,
      discountPercent: 0,
    };
    expect(calculateLineItemTotal(item)).toBe(500);
  });

  it('calculates line item total with discount', () => {
    const item: LineItem = {
      id: '2',
      description: 'Web development',
      quantity: 10,
      unit: 'hours',
      unitPrice: 50,
      discountPercent: 10, // 10% off
    };
    expect(calculateLineItemTotal(item)).toBe(450);
  });

  it('calculates invoice totals with VAT and discounts', () => {
    const items: LineItem[] = [
      {
        id: '1',
        description: 'Design',
        quantity: 2,
        unit: 'days',
        unitPrice: 200, // 400
        discountPercent: 10, // 40 discount -> 360
      },
      {
        id: '2',
        description: 'Consulting',
        quantity: 1,
        unit: 'service',
        unitPrice: 100, // 100
      },
    ];

    const result = calculateInvoiceTotals({
      items,
      taxRate: 19,
      isTaxExempt: false,
    });

    expect(result.subtotal).toBe(500);
    expect(result.discountTotal).toBe(40);
    expect(result.taxableAmount).toBe(460);
    expect(result.taxAmount).toBe(87.4);
    expect(result.total).toBe(547.4);
  });

  it('handles tax exemption / reverse charge correctly', () => {
    const items: LineItem[] = [
      {
        id: '1',
        description: 'Development',
        quantity: 1,
        unit: 'service',
        unitPrice: 1000,
      },
    ];

    const result = calculateInvoiceTotals({
      items,
      taxRate: 19,
      isTaxExempt: true,
    });

    expect(result.taxableAmount).toBe(1000);
    expect(result.taxAmount).toBe(0);
    expect(result.total).toBe(1000);
  });
});
