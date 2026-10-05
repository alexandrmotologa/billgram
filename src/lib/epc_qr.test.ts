import { describe, it, expect } from 'vitest';
import {
  generateEpcQrPayload,
  generateRevolutUrl,
  generateTonUri,
  generateQrDataUrl,
} from './epc_qr';

describe('Payment QR specifications', () => {
  it('formats European EPC069-12 payload matching SEPA standard', () => {
    const payload = generateEpcQrPayload({
      beneficiaryName: 'Alexandr Motologa',
      iban: 'RO49 BTRL 0000 0000 0000 0000',
      bic: 'BTRLRO22',
      amountEur: 250.75,
      referenceText: 'Invoice INV-2026-001',
    });

    const lines = payload.split('\n');
    expect(lines).toHaveLength(12);
    expect(lines[0]).toBe('BCD');
    expect(lines[1]).toBe('002');
    expect(lines[2]).toBe('1');
    expect(lines[3]).toBe('SCT');
    expect(lines[4]).toBe('BTRLRO22');
    expect(lines[5]).toBe('Alexandr Motologa');
    expect(lines[6]).toBe('RO49BTRL0000000000000000'); // Stripped spaces & uppercase
    expect(lines[7]).toBe('EUR250.75');
    expect(lines[10]).toBe('Invoice INV-2026-001');
  });

  it('formats Revolut URL cleanly', () => {
    expect(generateRevolutUrl('@alexandrmotologa')).toBe('https://revolut.me/alexandrmotologa');
    expect(generateRevolutUrl('alexandrmotologa')).toBe('https://revolut.me/alexandrmotologa');
  });

  it('formats TON transfer URI', () => {
    const tonUri = generateTonUri('EQD123456789', 5, 'INV-001');
    expect(tonUri).toContain('ton://transfer/EQD123456789?');
    expect(tonUri).toContain('amount=5000000000'); // 5 TON in nanotons
    expect(tonUri).toContain('text=INV-001');
  });

  it('generates QR data URL image', async () => {
    const dataUrl = await generateQrDataUrl('https://example.com');
    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  });
});
