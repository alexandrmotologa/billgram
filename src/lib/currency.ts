import type { CurrencyCode, Invoice, InvoiceCalculations, LineItem } from '../types/invoice';

export const CURRENCY_CONFIG: Record<CurrencyCode, { symbol: string; label: string; locale: string }> = {
  EUR: { symbol: '€', label: 'EUR (€)', locale: 'de-DE' },
  USD: { symbol: '$', label: 'USD ($)', locale: 'en-US' },
  GBP: { symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
  RON: { symbol: 'lei', label: 'RON (lei)', locale: 'ro-RO' },
  MDL: { symbol: 'MDL', label: 'MDL (lei)', locale: 'ro-MD' },
  CHF: { symbol: 'CHF', label: 'CHF (CHF)', locale: 'de-CH' },
};

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.EUR;
  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${config.symbol} ${amount.toFixed(2)}`;
  }
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateLineItemTotal(item: LineItem): number {
  const base = (item.quantity || 0) * (item.unitPrice || 0);
  if (item.discountPercent && item.discountPercent > 0) {
    const discount = base * (item.discountPercent / 100);
    return Math.max(0, base - discount);
  }
  return base;
}

export function calculateInvoiceTotals(invoice: Pick<Invoice, 'items' | 'taxRate' | 'isTaxExempt'>): InvoiceCalculations {
  let subtotal = 0;
  let discountTotal = 0;

  for (const item of invoice.items) {
    const rawTotal = (item.quantity || 0) * (item.unitPrice || 0);
    const lineTotal = calculateLineItemTotal(item);
    subtotal += rawTotal;
    discountTotal += Math.max(0, rawTotal - lineTotal);
  }

  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const effectiveTaxRate = invoice.isTaxExempt ? 0 : (invoice.taxRate || 0);
  const taxAmount = (taxableAmount * effectiveTaxRate) / 100;
  const total = taxableAmount + taxAmount;

  return {
    subtotal,
    discountTotal,
    taxableAmount,
    taxAmount,
    total,
  };
}
