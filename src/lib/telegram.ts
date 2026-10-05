import type { Invoice } from '../types/invoice';
import { formatCurrency, calculateInvoiceTotals } from './currency';

// Declare Telegram WebApp global interface
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
        themeParams?: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded?: boolean;
        viewportHeight?: number;
        viewportStableHeight?: number;
        headerColor?: string;
        backgroundColor?: string;
        BackButton?: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        MainButton?: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
        };
        HapticFeedback?: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        openLink?: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink?: (url: string) => void;
        CloudStorage?: {
          setItem: (key: string, value: string, callback?: (error: Error | null, success: boolean) => void) => void;
          getItem: (key: string, callback: (error: Error | null, value: string) => void) => void;
          getItems: (keys: string[], callback: (error: Error | null, values: Record<string, string>) => void) => void;
          removeItem: (key: string, callback?: (error: Error | null, success: boolean) => void) => void;
          getKeys: (callback: (error: Error | null, keys: string[]) => void) => void;
        };
      };
    };
  }
}

export function isTelegramWebApp(): boolean {
  return typeof window !== 'undefined' && Boolean(window.Telegram?.WebApp?.initData);
}

export function initTelegramWebApp(): void {
  if (typeof window === 'undefined' || !window.Telegram?.WebApp) return;
  const webApp = window.Telegram.WebApp;
  webApp.ready();
  webApp.expand();
}

export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'): void {
  const haptic = window.Telegram?.WebApp?.HapticFeedback;
  if (!haptic) return;

  switch (type) {
    case 'light':
    case 'medium':
    case 'heavy':
      haptic.impactOccurred(type);
      break;
    case 'success':
    case 'warning':
    case 'error':
      haptic.notificationOccurred(type);
      break;
    case 'selection':
      haptic.selectionChanged();
      break;
  }
}

/**
 * Generates a polite, professional payment reminder message formatted for Telegram chat in chosen language
 */
export function generatePaymentReminderMessage(invoice: Invoice): string {
  const { total } = calculateInvoiceTotals(invoice);
  const formattedTotal = formatCurrency(total, invoice.currency);
  const clientName = invoice.client.name.trim() || 'there';
  const senderName = invoice.sender.name.trim() || 'Freelancer';
  const lang = invoice.language || 'en';

  let paymentText = '';
  if (invoice.payment.method === 'sepa' && invoice.payment.iban) {
    paymentText = `\nBank: ${invoice.payment.bankName || 'Direct Transfer'}\nIBAN: ${invoice.payment.iban}${invoice.payment.bic ? `\nBIC: ${invoice.payment.bic}` : ''}`;
  } else if (invoice.payment.method === 'revolut' && invoice.payment.revolutTag) {
    paymentText = `\nRevolut: https://revolut.me/${invoice.payment.revolutTag.replace(/^@/, '')}`;
  } else if (invoice.payment.method === 'stripe' && invoice.payment.stripePaymentLink) {
    paymentText = `\nPay online: ${invoice.payment.stripePaymentLink}`;
  } else if (invoice.payment.method === 'ton' && invoice.payment.tonAddress) {
    paymentText = `\nTON Wallet: ${invoice.payment.tonAddress}`;
  }

  if (lang === 'ro') {
    return (
      `Salut ${clientName},\n\n` +
      `Îți trimit un memento amical privind factura #${invoice.number} în valoare de ${formattedTotal}, emisă pe ${invoice.issueDate} (Scadență: ${invoice.dueDate}).\n` +
      `${paymentText ? `${paymentText}\n\n` : '\n'}` +
      `Spune-mi dacă dorești ajustări sau o nouă copie PDF a facturii.\n\n` +
      `Mulțumesc,\n${senderName}`
    );
  }

  if (lang === 'de') {
    return (
      `Guten Tag ${clientName},\n\n` +
      `hier ist eine freundliche Zahlungserinnerung zur Rechnung #${invoice.number} über ${formattedTotal}, ausgestellt am ${invoice.issueDate} (Fällig am: ${invoice.dueDate}).\n` +
      `${paymentText ? `${paymentText}\n\n` : '\n'}` +
      `Geben Sie mir gerne Bescheid, falls Sie Fragen oder eine neue PDF-Kopie benötigen.\n\n` +
      `Mit freundlichen Grüßen,\n${senderName}`
    );
  }

  if (lang === 'fr') {
    return (
      `Bonjour ${clientName},\n\n` +
      `Voici un rappel amical concernant la facture #${invoice.number} d'un montant de ${formattedTotal}, émise le ${invoice.issueDate} (Échéance: ${invoice.dueDate}).\n` +
      `${paymentText ? `${paymentText}\n\n` : '\n'}` +
      `N'hésitez pas à me contacter pour toute question ou un nouvel exemplaire PDF.\n\n` +
      `Cordialement,\n${senderName}`
    );
  }

  // Default English
  return (
    `Hi ${clientName},\n\n` +
    `Here is a friendly reminder regarding invoice #${invoice.number} for ${formattedTotal}, issued on ${invoice.issueDate} (Due: ${invoice.dueDate}).\n` +
    `${paymentText ? `${paymentText}\n\n` : '\n'}` +
    `Let me know if you need any adjustments or another copy of the PDF.\n\n` +
    `Thank you,\n${senderName}`
  );
}

/**
 * Native file share helper
 */
export async function shareInvoicePdf(pdfBlob: Blob, filename: string, title: string): Promise<boolean> {
  const file = new File([pdfBlob], filename, { type: 'application/pdf' });
  
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title,
        text: `Invoice ${filename}`,
      });
      return true;
    } catch (err: unknown) {
      if ((err as Error)?.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  }

  // Fallback: trigger download
  downloadBlob(pdfBlob, filename);
  return false;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
