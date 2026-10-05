import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download, Share2, MessageSquare, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { InvoiceTemplate } from '../../pdf/InvoiceTemplate';
import { calculateInvoiceTotals } from '../../lib/currency';
import {
  downloadBlob,
  shareInvoicePdf,
  generatePaymentReminderMessage,
  triggerHaptic,
} from '../../lib/telegram';

interface ShareBarProps {
  onBackToEdit: () => void;
  qrDataUrl?: string;
}

export const ShareBar: React.FC<ShareBarProps> = ({ onBackToEdit, qrDataUrl }) => {
  const { currentInvoice, updateInvoiceStatus } = useInvoiceStore();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [copiedReminder, setCopiedReminder] = useState(false);

  const totals = calculateInvoiceTotals(currentInvoice);

  const generateBlob = async (): Promise<Blob> => {
    const documentInstance = (
      <InvoiceTemplate
        invoice={currentInvoice}
        totals={totals}
        qrDataUrl={qrDataUrl}
      />
    );
    return await pdf(documentInstance).toBlob();
  };

  const handleDownload = async () => {
    triggerHaptic('medium');
    setIsGeneratingPdf(true);
    try {
      const blob = await generateBlob();
      const filename = `Invoice_${currentInvoice.number}.pdf`;
      downloadBlob(blob, filename);
      triggerHaptic('success');
      // Update status to 'sent' if draft
      if (currentInvoice.status === 'draft') {
        await updateInvoiceStatus(currentInvoice.id, 'sent');
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      triggerHaptic('error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = async () => {
    triggerHaptic('medium');
    setIsGeneratingPdf(true);
    try {
      const blob = await generateBlob();
      const filename = `Invoice_${currentInvoice.number}.pdf`;
      await shareInvoicePdf(blob, filename, `Invoice #${currentInvoice.number}`);
      triggerHaptic('success');
      if (currentInvoice.status === 'draft') {
        await updateInvoiceStatus(currentInvoice.id, 'sent');
      }
    } catch (err) {
      console.error('Failed to share PDF:', err);
      triggerHaptic('error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyReminder = async () => {
    triggerHaptic('selection');
    const msg = generatePaymentReminderMessage(currentInvoice);
    try {
      await navigator.clipboard.writeText(msg);
      setCopiedReminder(true);
      triggerHaptic('success');
      setTimeout(() => setCopiedReminder(false), 2500);
    } catch {
      // Fallback
      alert(msg);
    }
  };

  return (
    <div className="space-y-3 pb-24">
      {/* Top back navigation button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToEdit}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Edit Invoice
        </button>

        <span className="text-xs font-mono font-semibold text-slate-500">
          PDF Ready
        </span>
      </div>

      {/* Main Action Buttons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* Download PDF */}
        <button
          type="button"
          onClick={handleDownload}
          disabled={isGeneratingPdf}
          className="py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-60"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          Download Vector PDF
        </button>

        {/* Share PDF */}
        <button
          type="button"
          onClick={handleShare}
          disabled={isGeneratingPdf}
          className="py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-60"
        >
          {isGeneratingPdf ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-200" />
          ) : (
            <Share2 className="w-4 h-4" />
          )}
          Share Invoice
        </button>

        {/* Copy Telegram Chat Reminder */}
        <button
          type="button"
          onClick={handleCopyReminder}
          className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
        >
          {copiedReminder ? (
            <>
              <Check className="w-4 h-4 text-emerald-100" />
              Copied to Clipboard!
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4" />
              Copy Chat Reminder
            </>
          )}
        </button>
      </div>

      {/* Notification banner */}
      {copiedReminder && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Friendly payment reminder message copied to clipboard. Ready to paste directly into your Telegram client chat!
          </span>
        </div>
      )}
    </div>
  );
};
