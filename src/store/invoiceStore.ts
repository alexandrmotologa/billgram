import { create } from 'zustand';
import type {
  BusinessProfile,
  Client,
  Invoice,
  InvoiceStatus,
  LineItem,
  PaymentDetails,
  ServicePreset,
} from '../types/invoice';
import { storageAdapter } from './storageAdapter';
import type { BackupPayload } from '../lib/export';

const DEFAULT_PROFILE: BusinessProfile = {
  name: 'Alexandr Motologa',
  email: 'alex@motologa.com',
  phone: '+40 700 000 000',
  address: 'Strada Academiei 1, Bucharest, Romania',
  taxId: 'RO12345678',
  iban: 'RO49BTRL0000000000000000',
  bic: 'BTRLRO22',
  bankName: 'Banca Transilvania',
  revolutTag: 'alexandrmotologa',
  stripePaymentLink: 'https://buy.stripe.com/test_12345',
  tonAddress: 'EQD...TonAddressHere',
  logoUrl: '',
  signatureUrl: '',
  defaultCurrency: 'EUR',
  defaultTaxRate: 19,
  defaultPaymentTermsDays: 14,
  defaultLanguage: 'en',
  defaultTemplateLayout: 'swiss',
  accentColor: '#0f172a', // Obsidian Swiss black
};

const DEFAULT_SERVICE_PRESETS: ServicePreset[] = [
  {
    id: 'preset_1',
    title: 'Software Development',
    description: 'Fullstack Software Engineering & Architecture',
    unit: 'hours',
    unitPrice: 75,
    discountPercent: 0,
  },
  {
    id: 'preset_2',
    title: 'UI/UX Design',
    description: 'Interface Design & Interactive Prototype',
    unit: 'hours',
    unitPrice: 65,
    discountPercent: 0,
  },
  {
    id: 'preset_3',
    title: 'Technical Consulting',
    description: 'Architecture Advisory & Code Audit',
    unit: 'days',
    unitPrice: 600,
    discountPercent: 0,
  },
  {
    id: 'preset_4',
    title: 'Monthly Maintenance',
    description: 'Infrastructure Monitoring & SLA Retainer',
    unit: 'service',
    unitPrice: 450,
    discountPercent: 0,
  },
];

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getDueDateString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function advanceDateByMonths(dateStr: string, monthsToAdd: number): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return getTodayString();
  d.setMonth(d.getMonth() + monthsToAdd);
  return d.toISOString().split('T')[0];
}

function generateNextInvoiceNumber(existingInvoices: Invoice[]): string {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  const numbers = existingInvoices
    .filter((inv) => inv.number.startsWith(prefix))
    .map((inv) => {
      const parts = inv.number.split(prefix);
      const num = parseInt(parts[1], 10);
      return isNaN(num) ? 0 : num;
    });

  const nextNum = (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
}

function createEmptyInvoice(profile: BusinessProfile, existingInvoices: Invoice[]): Invoice {
  const id = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const nextNum = generateNextInvoiceNumber(existingInvoices);
  return {
    id,
    number: nextNum,
    issueDate: getTodayString(),
    dueDate: getDueDateString(profile.defaultPaymentTermsDays || 14),
    status: 'draft',
    language: profile.defaultLanguage || 'en',
    templateLayout: profile.defaultTemplateLayout || 'swiss',
    sender: { ...profile },
    client: {
      id: `cli_${Date.now()}`,
      name: '',
      email: '',
      address: '',
      taxId: '',
    },
    items: [
      {
        id: `item_${Date.now()}_1`,
        description: 'Software Engineering & Consulting',
        quantity: 1,
        unit: 'service',
        unitPrice: 500,
        discountPercent: 0,
      },
    ],
    currency: profile.defaultCurrency,
    taxRate: profile.defaultTaxRate,
    isTaxExempt: false,
    taxExemptReason: '',
    payment: {
      method: 'sepa',
      beneficiaryName: profile.name,
      iban: profile.iban,
      bic: profile.bic,
      bankName: profile.bankName,
      revolutTag: profile.revolutTag,
      stripePaymentLink: profile.stripePaymentLink,
      tonAddress: profile.tonAddress,
      referenceText: `Invoice ${nextNum}`,
    },
    includeSignature: Boolean(profile.signatureUrl),
    exchangeRateNote: '',
    notes: 'Payment is due within the agreed payment terms. Thank you for your business.',
    terms: 'Late payments may be subject to statutory interest.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

interface InvoiceStoreState {
  isInitialized: boolean;
  profile: BusinessProfile;
  clients: Client[];
  savedInvoices: Invoice[];
  servicePresets: ServicePreset[];
  currentInvoice: Invoice;

  // Actions
  initStore: () => Promise<void>;
  updateProfile: (profile: Partial<BusinessProfile>) => Promise<void>;
  updateCurrentInvoice: (partial: Partial<Invoice>) => void;
  updateClient: (client: Partial<Client>) => void;
  addLineItem: (item?: Partial<LineItem>) => void;
  updateLineItem: (id: string, partial: Partial<LineItem>) => void;
  removeLineItem: (id: string) => void;
  updatePayment: (payment: Partial<PaymentDetails>) => void;
  
  saveCurrentInvoice: () => Promise<Invoice>;
  createNewInvoice: () => void;
  loadInvoice: (id: string) => void;
  duplicateInvoice: (id: string) => void;
  billNextMonth: (id: string) => void;
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  
  saveClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  addServicePreset: (preset: Omit<ServicePreset, 'id'>) => Promise<void>;
  deleteServicePreset: (id: string) => Promise<void>;
  restoreFullBackup: (backup: BackupPayload) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceStoreState>((set, get) => ({
  isInitialized: false,
  profile: DEFAULT_PROFILE,
  clients: [],
  savedInvoices: [],
  servicePresets: DEFAULT_SERVICE_PRESETS,
  currentInvoice: createEmptyInvoice(DEFAULT_PROFILE, []),

  initStore: async () => {
    try {
      const [profileData, clientsData, invoicesData, presetsData] = await Promise.all([
        storageAdapter.getItem('billgram_profile'),
        storageAdapter.getItem('billgram_clients'),
        storageAdapter.getItem('billgram_invoices'),
        storageAdapter.getItem('billgram_presets'),
      ]);

      const profile: BusinessProfile = profileData
        ? { ...DEFAULT_PROFILE, ...JSON.parse(profileData) }
        : DEFAULT_PROFILE;

      const clients: Client[] = clientsData ? JSON.parse(clientsData) : [];
      const savedInvoices: Invoice[] = invoicesData ? JSON.parse(invoicesData) : [];
      const servicePresets: ServicePreset[] = presetsData
        ? JSON.parse(presetsData)
        : DEFAULT_SERVICE_PRESETS;

      set({
        isInitialized: true,
        profile,
        clients,
        savedInvoices,
        servicePresets,
        currentInvoice: createEmptyInvoice(profile, savedInvoices),
      });
    } catch (err) {
      console.error('Failed to initialize invoice store:', err);
      set({ isInitialized: true });
    }
  },

  updateProfile: async (partial) => {
    const updated = { ...get().profile, ...partial };
    set({ profile: updated });
    await storageAdapter.setItem('billgram_profile', JSON.stringify(updated));
  },

  updateCurrentInvoice: (partial) => {
    const current = get().currentInvoice;
    const updated: Invoice = {
      ...current,
      ...partial,
      updatedAt: Date.now(),
    };
    set({ currentInvoice: updated });
  },

  updateClient: (clientPartial) => {
    const current = get().currentInvoice;
    const updatedClient: Client = {
      ...current.client,
      ...clientPartial,
    };
    set({
      currentInvoice: {
        ...current,
        client: updatedClient,
        updatedAt: Date.now(),
      },
    });
  },

  addLineItem: (itemPartial) => {
    const current = get().currentInvoice;
    const newItem: LineItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      description: '',
      quantity: 1,
      unit: 'service',
      unitPrice: 0,
      discountPercent: 0,
      ...itemPartial,
    };
    set({
      currentInvoice: {
        ...current,
        items: [...current.items, newItem],
        updatedAt: Date.now(),
      },
    });
  },

  updateLineItem: (id, partial) => {
    const current = get().currentInvoice;
    const items = current.items.map((item) =>
      item.id === id ? { ...item, ...partial } : item
    );
    set({
      currentInvoice: {
        ...current,
        items,
        updatedAt: Date.now(),
      },
    });
  },

  removeLineItem: (id) => {
    const current = get().currentInvoice;
    if (current.items.length <= 1) return;
    const items = current.items.filter((item) => item.id !== id);
    set({
      currentInvoice: {
        ...current,
        items,
        updatedAt: Date.now(),
      },
    });
  },

  updatePayment: (paymentPartial) => {
    const current = get().currentInvoice;
    set({
      currentInvoice: {
        ...current,
        payment: {
          ...current.payment,
          ...paymentPartial,
        },
        updatedAt: Date.now(),
      },
    });
  },

  saveCurrentInvoice: async () => {
    const { currentInvoice, savedInvoices, saveClient } = get();
    const finalInvoice: Invoice = {
      ...currentInvoice,
      updatedAt: Date.now(),
    };

    if (finalInvoice.client.name.trim()) {
      await saveClient(finalInvoice.client);
    }

    const index = savedInvoices.findIndex((inv) => inv.id === finalInvoice.id);
    let updatedInvoices: Invoice[];
    if (index >= 0) {
      updatedInvoices = [...savedInvoices];
      updatedInvoices[index] = finalInvoice;
    } else {
      updatedInvoices = [finalInvoice, ...savedInvoices];
    }

    set({ savedInvoices: updatedInvoices, currentInvoice: finalInvoice });
    await storageAdapter.setItem('billgram_invoices', JSON.stringify(updatedInvoices));
    return finalInvoice;
  },

  createNewInvoice: () => {
    const { profile, savedInvoices } = get();
    const newInvoice = createEmptyInvoice(profile, savedInvoices);
    set({ currentInvoice: newInvoice });
  },

  loadInvoice: (id) => {
    const { savedInvoices } = get();
    const target = savedInvoices.find((inv) => inv.id === id);
    if (target) {
      set({ currentInvoice: { ...target } });
    }
  },

  duplicateInvoice: (id) => {
    const { savedInvoices, profile } = get();
    const target = savedInvoices.find((inv) => inv.id === id);
    if (!target) return;

    const newNumber = generateNextInvoiceNumber(savedInvoices);
    const duplicated: Invoice = {
      ...target,
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      number: newNumber,
      issueDate: getTodayString(),
      dueDate: getDueDateString(profile.defaultPaymentTermsDays || 14),
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set({ currentInvoice: duplicated });
  },

  billNextMonth: (id) => {
    const { savedInvoices } = get();
    const target = savedInvoices.find((inv) => inv.id === id);
    if (!target) return;

    const newNumber = generateNextInvoiceNumber(savedInvoices);
    const newIssueDate = advanceDateByMonths(target.issueDate, 1);
    const newDueDate = advanceDateByMonths(target.dueDate, 1);

    // Auto-update month names in line item descriptions if present
    const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthNamesRo = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

    const targetMonthIdx = new Date(target.issueDate).getMonth();
    const nextMonthIdx = (targetMonthIdx + 1) % 12;

    const updatedItems = target.items.map((item) => {
      let desc = item.description;
      if (monthNamesEn[targetMonthIdx] && desc.includes(monthNamesEn[targetMonthIdx])) {
        desc = desc.replace(monthNamesEn[targetMonthIdx], monthNamesEn[nextMonthIdx]);
      }
      if (monthNamesRo[targetMonthIdx] && desc.includes(monthNamesRo[targetMonthIdx])) {
        desc = desc.replace(monthNamesRo[targetMonthIdx], monthNamesRo[nextMonthIdx]);
      }
      return {
        ...item,
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        description: desc,
      };
    });

    const recurringInvoice: Invoice = {
      ...target,
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      number: newNumber,
      issueDate: newIssueDate,
      dueDate: newDueDate,
      status: 'draft',
      items: updatedItems,
      payment: {
        ...target.payment,
        referenceText: `Invoice ${newNumber}`,
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set({ currentInvoice: recurringInvoice });
  },

  deleteInvoice: async (id) => {
    const { savedInvoices, currentInvoice, profile } = get();
    const updated = savedInvoices.filter((inv) => inv.id !== id);
    set({ savedInvoices: updated });
    await storageAdapter.setItem('billgram_invoices', JSON.stringify(updated));

    if (currentInvoice.id === id) {
      set({ currentInvoice: createEmptyInvoice(profile, updated) });
    }
  },

  updateInvoiceStatus: async (id, status) => {
    const { savedInvoices, currentInvoice } = get();
    const updatedInvoices = savedInvoices.map((inv) =>
      inv.id === id ? { ...inv, status, updatedAt: Date.now() } : inv
    );

    const isCurrent = currentInvoice.id === id;
    set({
      savedInvoices: updatedInvoices,
      currentInvoice: isCurrent ? { ...currentInvoice, status } : currentInvoice,
    });

    await storageAdapter.setItem('billgram_invoices', JSON.stringify(updatedInvoices));
  },

  saveClient: async (client) => {
    if (!client.name.trim()) return;
    const { clients } = get();
    const existingIndex = clients.findIndex(
      (c) => c.name.toLowerCase() === client.name.toLowerCase()
    );

    let updatedClients: Client[];
    if (existingIndex >= 0) {
      updatedClients = [...clients];
      updatedClients[existingIndex] = {
        ...clients[existingIndex],
        ...client,
      };
    } else {
      updatedClients = [...clients, { ...client, id: client.id || `cli_${Date.now()}` }];
    }

    set({ clients: updatedClients });
    await storageAdapter.setItem('billgram_clients', JSON.stringify(updatedClients));
  },

  deleteClient: async (id) => {
    const { clients } = get();
    const updated = clients.filter((c) => c.id !== id);
    set({ clients: updated });
    await storageAdapter.setItem('billgram_clients', JSON.stringify(updated));
  },

  addServicePreset: async (preset) => {
    const { servicePresets } = get();
    const newPreset: ServicePreset = {
      ...preset,
      id: `preset_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [...servicePresets, newPreset];
    set({ servicePresets: updated });
    await storageAdapter.setItem('billgram_presets', JSON.stringify(updated));
  },

  deleteServicePreset: async (id) => {
    const { servicePresets } = get();
    const updated = servicePresets.filter((p) => p.id !== id);
    set({ servicePresets: updated });
    await storageAdapter.setItem('billgram_presets', JSON.stringify(updated));
  },

  restoreFullBackup: async (backup) => {
    set({
      profile: backup.profile,
      clients: backup.clients,
      savedInvoices: backup.savedInvoices,
      servicePresets: backup.servicePresets,
      currentInvoice: backup.savedInvoices[0] || createEmptyInvoice(backup.profile, []),
    });

    await Promise.all([
      storageAdapter.setItem('billgram_profile', JSON.stringify(backup.profile)),
      storageAdapter.setItem('billgram_clients', JSON.stringify(backup.clients)),
      storageAdapter.setItem('billgram_invoices', JSON.stringify(backup.savedInvoices)),
      storageAdapter.setItem('billgram_presets', JSON.stringify(backup.servicePresets)),
    ]);
  },
}));
