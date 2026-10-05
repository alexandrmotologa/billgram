export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'RON' | 'MDL' | 'CHF';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';

export type PaymentMethodType = 'sepa' | 'revolut' | 'stripe' | 'ton' | 'custom';

export type ItemUnit = 'hours' | 'days' | 'units' | 'service' | 'fixed';

export type InvoiceLanguage = 'en' | 'ro' | 'de' | 'fr';

export type TemplateLayout = 'swiss' | 'executive' | 'compact';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: ItemUnit;
  unitPrice: number;
  discountPercent?: number;
}

export interface ServicePreset {
  id: string;
  title: string;
  description: string;
  unit: ItemUnit;
  unitPrice: number;
  discountPercent?: number;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string; // CIF / VAT / Tax ID
}

export interface BusinessProfile {
  name: string;
  email: string;
  phone?: string;
  address: string;
  taxId?: string; // CIF / VAT ID / Registration
  iban?: string;
  bic?: string;
  bankName?: string;
  revolutTag?: string;
  stripePaymentLink?: string;
  tonAddress?: string;
  logoUrl?: string; // Base64 data URL
  signatureUrl?: string; // Base64 data URL
  defaultCurrency: CurrencyCode;
  defaultTaxRate: number;
  defaultPaymentTermsDays: number;
  defaultLanguage?: InvoiceLanguage;
  defaultTemplateLayout?: TemplateLayout;
  accentColor: string;
}

export interface PaymentDetails {
  method: PaymentMethodType;
  beneficiaryName: string;
  iban?: string;
  bic?: string;
  bankName?: string;
  revolutTag?: string;
  stripePaymentLink?: string;
  tonAddress?: string;
  customInstructions?: string;
  referenceText?: string;
}

export interface Invoice {
  id: string;
  number: string;
  issueDate: string; // YYYY-MM-DD
  dueDate: string;   // YYYY-MM-DD
  status: InvoiceStatus;
  
  language: InvoiceLanguage;
  templateLayout: TemplateLayout;
  
  sender: BusinessProfile;
  client: Client;
  
  items: LineItem[];
  currency: CurrencyCode;
  taxRate: number; // e.g. 19 for 19%
  isTaxExempt: boolean;
  taxExemptReason?: string;
  
  payment: PaymentDetails;
  
  includeSignature: boolean;
  exchangeRateNote?: string;
  
  notes?: string;
  terms?: string;
  
  createdAt: number;
  updatedAt: number;
}

export interface InvoiceCalculations {
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
}
