import type { InvoiceLanguage } from '../types/invoice';

export interface TranslationDictionary {
  invoiceTitle: string;
  billedBy: string;
  billedTo: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  status: string;
  description: string;
  qty: string;
  unitPrice: string;
  amount: string;
  subtotal: string;
  discount: string;
  tax: string;
  taxExempt: string;
  totalDue: string;
  paymentDetails: string;
  beneficiary: string;
  iban: string;
  bic: string;
  bank: string;
  reference: string;
  scanEpcHint: string;
  scanRevolutHint: string;
  scanStripeHint: string;
  scanTonHint: string;
  notes: string;
  terms: string;
  signature: string;
  exchangeRate: string;
  footerWatermark: string;
}

export const TRANSLATIONS: Record<InvoiceLanguage, TranslationDictionary> = {
  en: {
    invoiceTitle: 'INVOICE',
    billedBy: 'BILLED BY',
    billedTo: 'BILLED TO',
    issueDate: 'ISSUE DATE',
    dueDate: 'DUE DATE',
    currency: 'CURRENCY',
    status: 'STATUS',
    description: 'DESCRIPTION',
    qty: 'QTY',
    unitPrice: 'UNIT PRICE',
    amount: 'AMOUNT',
    subtotal: 'Subtotal',
    discount: 'Total Discount',
    tax: 'VAT / Tax',
    taxExempt: 'VAT / Tax (Exempt)',
    totalDue: 'TOTAL DUE',
    paymentDetails: 'PAYMENT DETAILS & BANK TRANSFER',
    beneficiary: 'Beneficiary',
    iban: 'IBAN',
    bic: 'BIC / SWIFT',
    bank: 'Bank',
    reference: 'Reference',
    scanEpcHint: 'Scan the EPC QR code with your mobile banking app to autofill payment.',
    scanRevolutHint: 'Scan QR code to open Revolut instant transfer.',
    scanStripeHint: 'Scan QR code to pay via card, Apple Pay, or Google Pay.',
    scanTonHint: 'Scan QR code via Telegram Wallet or Tonkeeper.',
    notes: 'NOTES',
    terms: 'TERMS & CONDITIONS',
    signature: 'AUTHORIZED SIGNATURE',
    exchangeRate: 'EXCHANGE RATE REFERENCE',
    footerWatermark: 'Generated with BillGram Client-Side Invoicing • billgram.app',
  },
  ro: {
    invoiceTitle: 'FACTURĂ',
    billedBy: 'FURNIZOR',
    billedTo: 'BENEFICIAR / CUMPĂRĂTOR',
    issueDate: 'DATA EMITERII',
    dueDate: 'DATA SCADENȚEI',
    currency: 'MONEDĂ',
    status: 'STARE',
    description: 'DESCRIERE PRODUS / SERVICIU',
    qty: 'CANT.',
    unitPrice: 'PREȚ UNITAR',
    amount: 'VALOARE',
    subtotal: 'Subtotal',
    discount: 'Reducere comercială',
    tax: 'TVA',
    taxExempt: 'TVA (Scutit cu deducere)',
    totalDue: 'TOTAL DE PLATĂ',
    paymentDetails: 'DETALII DE PLATĂ ȘI VIRAMENT BANCAR',
    beneficiary: 'Beneficiar',
    iban: 'IBAN',
    bic: 'BIC / SWIFT',
    bank: 'Bancă',
    reference: 'Referință plată',
    scanEpcHint: 'Scanați codul QR EPC cu aplicația bancară pentru completare automată a plății.',
    scanRevolutHint: 'Scanați codul QR pentru transfer instant în aplicația Revolut.',
    scanStripeHint: 'Scanați codul QR pentru plată securizată cu card bancar sau Apple/Google Pay.',
    scanTonHint: 'Scanați codul QR cu Telegram Wallet sau Tonkeeper.',
    notes: 'MENȚIUNI SPECIALE',
    terms: 'TERMENI ȘI CONDIȚII COMERCIALE',
    signature: 'SEMNĂTURĂ AUTORIZATĂ',
    exchangeRate: 'CURS DE SCHIMB DE REFERINȚĂ',
    footerWatermark: 'Generat cu BillGram • Client-Side Invoicing • billgram.app',
  },
  de: {
    invoiceTitle: 'RECHNUNG',
    billedBy: 'RECHNUNGSSTELLER',
    billedTo: 'RECHNUNGSEMPFÄNGER',
    issueDate: 'RECHNUNGSDATUM',
    dueDate: 'FÄLLIGKEITSDATUM',
    currency: 'WÄHRUNG',
    status: 'STATUS',
    description: 'BESCHREIBUNG',
    qty: 'MENGE',
    unitPrice: 'EINZELPREIS',
    amount: 'GESAMTPREIS',
    subtotal: 'Zwischensumme',
    discount: 'Rabatt',
    tax: 'MwSt.',
    taxExempt: 'MwSt. (Steuerfrei)',
    totalDue: 'GESAMTBETRAG',
    paymentDetails: 'ZAHLUNGSINFORMATIONEN & BANKVERBINDUNG',
    beneficiary: 'Empfänger',
    iban: 'IBAN',
    bic: 'BIC / SWIFT',
    bank: 'Bank',
    reference: 'Verwendungszweck',
    scanEpcHint: 'EPC-QR-Code mit Ihrer Banking-App scannen, um die Überweisung automatisch auszufüllen.',
    scanRevolutHint: 'QR-Code scannen für sofortige Revolut-Überweisung.',
    scanStripeHint: 'QR-Code scannen zur Online-Zahlung per Kreditkarte oder Apple/Google Pay.',
    scanTonHint: 'QR-Code mit Telegram Wallet oder Tonkeeper scannen.',
    notes: 'HINWEISE',
    terms: 'GESCHÄFTSBEDINGUNGEN',
    signature: 'UNTERSCHRIFT',
    exchangeRate: 'WECHSELKURS-HINWEIS',
    footerWatermark: 'Erstellt mit BillGram Client-Side Invoicing • billgram.app',
  },
  fr: {
    invoiceTitle: 'FACTURE',
    billedBy: 'ÉMETTEUR',
    billedTo: 'CLIENT / DESTINATAIRE',
    issueDate: 'DATE D\'ÉMISSION',
    dueDate: 'DATE D\'ÉCHÉANCE',
    currency: 'DEVISE',
    status: 'STATUT',
    description: 'DESCRIPTION',
    qty: 'QTÉ',
    unitPrice: 'PRIX UNITAIRE',
    amount: 'MONTANT HT',
    subtotal: 'Sous-total',
    discount: 'Remise',
    tax: 'TVA',
    taxExempt: 'TVA (Exonéré)',
    totalDue: 'NET À PAYER',
    paymentDetails: 'COORDONNÉES BANCAIRES & PAIEMENT',
    beneficiary: 'Bénéficiaire',
    iban: 'IBAN',
    bic: 'BIC / SWIFT',
    bank: 'Banque',
    reference: 'Référence',
    scanEpcHint: 'Scannez le QR code EPC avec votre application bancaire pour remplir le virement.',
    scanRevolutHint: 'Scannez le code QR pour ouvrir le virement instantané Revolut.',
    scanStripeHint: 'Scannez le code QR pour régler par carte, Apple Pay ou Google Pay.',
    scanTonHint: 'Scannez le code QR avec Telegram Wallet ou Tonkeeper.',
    notes: 'NOTES',
    terms: 'CONDITIONS GÉNÉRALES',
    signature: 'SIGNATURE AUTORISÉE',
    exchangeRate: 'TAUX DE CHANGE DE RÉFÉRENCE',
    footerWatermark: 'Généré avec BillGram Client-Side Invoicing • billgram.app',
  },
};

export function getTranslations(lang: InvoiceLanguage): TranslationDictionary {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}
