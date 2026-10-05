import QRCode from 'qrcode';
import type { Invoice, PaymentDetails } from '../types/invoice';

/**
 * Formats standard European Payments Council (EPC069-12) QR code payload.
 * Also known as SEPA Credit Transfer (SCT) GiroCode standard.
 */
export function generateEpcQrPayload(params: {
  beneficiaryName: string;
  iban: string;
  bic?: string;
  amountEur?: number;
  referenceText?: string;
  purposeCode?: string;
}): string {
  const cleanIban = params.iban.replace(/\s+/g, '').toUpperCase();
  const cleanBic = (params.bic || '').replace(/\s+/g, '').toUpperCase();
  const cleanName = params.beneficiaryName.trim().slice(0, 70);
  
  // Format amount: EUR123.45 (strictly EUR, max 12 digits, 2 decimals)
  let amountStr = '';
  if (params.amountEur !== undefined && params.amountEur > 0) {
    amountStr = `EUR${params.amountEur.toFixed(2)}`;
  }

  const unstructuredRef = (params.referenceText || '').slice(0, 140);
  const purpose = (params.purposeCode || '').slice(0, 4);

  // EPC standard 12 lines separated by \n
  const lines = [
    'BCD',                      // Service Tag
    '002',                      // Version
    '1',                        // Character set: UTF-8
    'SCT',                      // Identification: SEPA Credit Transfer
    cleanBic,                   // BIC (8 or 11 chars, optional in SEPA if IBAN contains routing)
    cleanName,                  // Beneficiary Name
    cleanIban,                  // IBAN
    amountStr,                  // Amount in EUR
    purpose,                    // Purpose code
    '',                         // Structured reference
    unstructuredRef,            // Unstructured reference
    'BillGram Invoicing',       // Beneficiary to originator information
  ];

  return lines.join('\n');
}

/**
 * Formats Revolut payment URL from revtag or username
 */
export function generateRevolutUrl(revtag: string): string {
  const clean = revtag.replace(/^[@/]+/, '').trim();
  return `https://revolut.me/${clean}`;
}

/**
 * Formats TON blockchain transfer URI
 */
export function generateTonUri(address: string, amountTon?: number, comment?: string): string {
  const cleanAddress = address.trim();
  const params = new URLSearchParams();
  if (amountTon && amountTon > 0) {
    // 1 TON = 1e9 nanotons
    const nanoTons = Math.round(amountTon * 1e9);
    params.set('amount', nanoTons.toString());
  }
  if (comment) {
    params.set('text', comment);
  }
  const queryString = params.toString();
  return `ton://transfer/${cleanAddress}${queryString ? `?${queryString}` : ''}`;
}

/**
 * Builds the appropriate QR raw string based on selected payment method and invoice data
 */
export function getPaymentQrPayload(invoice: Invoice, payment: PaymentDetails, totalAmount: number): {
  payload: string;
  type: string;
  label: string;
} {
  switch (payment.method) {
    case 'sepa': {
      // EPC QR standard requires EUR for bank scanners
      const isEur = invoice.currency === 'EUR';
      const amountEur = isEur ? totalAmount : undefined;
      const ref = payment.referenceText || `Invoice ${invoice.number}`;
      
      const payload = generateEpcQrPayload({
        beneficiaryName: payment.beneficiaryName || invoice.sender.name,
        iban: payment.iban || invoice.sender.iban || '',
        bic: payment.bic || invoice.sender.bic || '',
        amountEur,
        referenceText: ref,
      });

      return {
        payload,
        type: 'sepa',
        label: isEur ? 'SEPA / EPC Bank Transfer' : 'SEPA Transfer (IBAN details)',
      };
    }

    case 'revolut': {
      const tag = payment.revolutTag || invoice.sender.revolutTag || '';
      const payload = generateRevolutUrl(tag);
      return {
        payload,
        type: 'revolut',
        label: `Revolut (${tag})`,
      };
    }

    case 'stripe': {
      const link = payment.stripePaymentLink || invoice.sender.stripePaymentLink || '';
      return {
        payload: link || 'https://stripe.com',
        type: 'stripe',
        label: 'Stripe Instant Checkout',
      };
    }

    case 'ton': {
      const address = payment.tonAddress || invoice.sender.tonAddress || '';
      const ref = payment.referenceText || `Inv #${invoice.number}`;
      const payload = generateTonUri(address, undefined, ref);
      return {
        payload,
        type: 'ton',
        label: 'TON Wallet Transfer',
      };
    }

    case 'custom':
    default: {
      const fallback = payment.customInstructions || `Invoice ${invoice.number} - Total: ${totalAmount} ${invoice.currency}`;
      return {
        payload: fallback,
        type: 'custom',
        label: 'Payment Instructions',
      };
    }
  }
}

/**
 * Generates high-res Data URL (PNG base64) from payload string
 */
export async function generateQrDataUrl(payload: string): Promise<string> {
  if (!payload) return '';
  try {
    return await QRCode.toDataURL(payload, {
      width: 256,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    return '';
  }
}
