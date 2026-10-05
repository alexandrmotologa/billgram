import { create } from 'zustand';
import type {
  BusinessProfile,
  Client,
  Invoice,
  InvoiceStatus,
  LineItem,
  PaymentDetails,
} from '../types/invoice';
import { storageAdapter } from './storageAdapter';

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
  defaultCurrency: 'EUR',
  defaultTaxRate: 19,
  defaultPaymentTermsDays: 14,
  accentColor: '#0f172a', // Obsidian Swiss black
};

function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

function getDueDateString(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
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
  return {
    id,
    number: generateNextInvoiceNumber(existingInvoices),
    issueDate: getTodayString(),
    dueDate: getDueDateString(profile.defaultPaymentTermsDays || 14),
    status: 'draft',
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
      referenceText: `Invoice ${generateNextInvoiceNumber(existingInvoices)}`,
    },
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
  deleteInvoice: (id: string) => Promise<void>;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => Promise<void>;
  
  saveClient: (client: Client) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceStoreState>((set, get) => ({
  isInitialized: false,
  profile: DEFAULT_PROFILE,
  clients: [],
  savedInvoices: [],
  currentInvoice: createEmptyInvoice(DEFAULT_PROFILE, []),

  initStore: async () => {
    try {
      const [profileData, clientsData, invoicesData] = await Promise.all([
        storageAdapter.getItem('billgram_profile'),
        storageAdapter.getItem('billgram_clients'),
        storageAdapter.getItem('billgram_invoices'),
      ]);

      const profile: BusinessProfile = profileData
        ? { ...DEFAULT_PROFILE, ...JSON.parse(profileData) }
        : DEFAULT_PROFILE;

      const clients: Client[] = clientsData ? JSON.parse(clientsData) : [];
      const savedInvoices: Invoice[] = invoicesData ? JSON.parse(invoicesData) : [];

      set({
        isInitialized: true,
        profile,
        clients,
        savedInvoices,
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
    if (current.items.length <= 1) return; // Keep at least one item
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

    // If client has a name, automatically save to client directory
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
}));
