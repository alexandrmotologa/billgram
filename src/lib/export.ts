import type { BusinessProfile, Client, Invoice, ServicePreset } from '../types/invoice';
import { calculateInvoiceTotals } from './currency';
import { downloadBlob } from './telegram';

export interface BackupPayload {
  version: number;
  exportedAt: string;
  profile: BusinessProfile;
  clients: Client[];
  savedInvoices: Invoice[];
  servicePresets: ServicePreset[];
}

export function exportBackupJson(data: {
  profile: BusinessProfile;
  clients: Client[];
  savedInvoices: Invoice[];
  servicePresets: ServicePreset[];
}): void {
  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    ...data,
  };

  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const dateStr = new Date().toISOString().split('T')[0];
  downloadBlob(blob, `billgram_backup_${dateStr}.json`);
}

export function parseBackupJson(rawText: string): BackupPayload {
  const parsed = JSON.parse(rawText) as Partial<BackupPayload>;
  if (!parsed.profile || !Array.isArray(parsed.savedInvoices)) {
    throw new Error('Invalid BillGram backup format');
  }
  return {
    version: parsed.version || 1,
    exportedAt: parsed.exportedAt || new Date().toISOString(),
    profile: parsed.profile,
    clients: parsed.clients || [],
    savedInvoices: parsed.savedInvoices || [],
    servicePresets: parsed.servicePresets || [],
  };
}

function escapeCsvField(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportInvoicesCsv(invoices: Invoice[]): void {
  const headers = [
    'Invoice Number',
    'Client Name',
    'Client Email',
    'Client Tax ID',
    'Issue Date',
    'Due Date',
    'Currency',
    'Subtotal',
    'Tax Rate %',
    'Tax Amount',
    'Total Due',
    'Status',
    'Payment Method',
    'IBAN',
    'Revolut Tag',
  ];

  const rows: string[] = [headers.join(',')];

  for (const inv of invoices) {
    const { subtotal, taxAmount, total } = calculateInvoiceTotals(inv);
    const row = [
      escapeCsvField(inv.number),
      escapeCsvField(inv.client.name),
      escapeCsvField(inv.client.email || ''),
      escapeCsvField(inv.client.taxId || ''),
      escapeCsvField(inv.issueDate),
      escapeCsvField(inv.dueDate),
      escapeCsvField(inv.currency),
      escapeCsvField(subtotal.toFixed(2)),
      escapeCsvField(inv.isTaxExempt ? 0 : inv.taxRate),
      escapeCsvField(taxAmount.toFixed(2)),
      escapeCsvField(total.toFixed(2)),
      escapeCsvField(inv.status),
      escapeCsvField(inv.payment.method),
      escapeCsvField(inv.payment.iban || ''),
      escapeCsvField(inv.payment.revolutTag || ''),
    ];
    rows.push(row.join(','));
  }

  const csvContent = '\uFEFF' + rows.join('\r\n'); // UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const dateStr = new Date().toISOString().split('T')[0];
  downloadBlob(blob, `billgram_invoices_${dateStr}.csv`);
}
