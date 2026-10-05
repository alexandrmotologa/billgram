import React, { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download, Share2, MessageSquare, ArrowLeft, Loader2, Check, LayoutTemplate, Languages } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { InvoiceTemplate } from '../../pdf/InvoiceTemplate';
import { calculateInvoiceTotals } from '../../lib/currency';
import {
  downloadBlob,
  shareInvoicePdf,
  generatePaymentReminderMessage,
  triggerHaptic,
} from '../../lib/telegram';
import type { InvoiceLanguage, TemplateLayout } from '../../types/invoice';

interface ShareBarProps {
  onBackToEdit: () => void;
  qrDataUrl?: string;
}

export const ShareBar: React.FC<ShareBarProps> = ({ onBackToEdit, qrDataUrl }) => {
  const { currentInvoice, updateCurrentInvoice, updateInvoiceStatus } = useInvoiceStore();
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
      alert(msg);
    }
  };

  const layouts: { id: TemplateLayout; label: string }[] = [
    { id: 'swiss', label: 'Swiss' },
    { id: 'executive', label: 'Executive' },
    { id: 'compact', label: 'Compact' },
  ];

  const languages: { id: InvoiceLanguage; label: string }[] = [
    { id: 'en', label: 'EN' },
    { id: 'ro', label: 'RO' },
    { id: 'de', label: 'DE' },
    { id: 'fr', label: 'FR' },
  ];

  return (
    <div className="space-y-3">
      {/* Top back navigation & quick switches */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
        <button
          type="button"
          onClick={onBackToEdit}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Edit
        </button>

        {/* Quick layout switch */}
        <div className="flex items-center gap-1">
          <LayoutTemplate className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
          {layouts.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                updateCurrentInvoice({ templateLayout: l.id });
              }}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors ${
                (currentInvoice.templateLayout || 'swiss') === l.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* Quick language switch */}
        <div className="flex items-center gap-1">
          <Languages className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
          {languages.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                updateCurrentInvoice({ language: l.id });
              }}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors ${
                (currentInvoice.language || 'en') === l.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
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
            Friendly payment reminder message copied to clipboard in {currentInvoice.language?.toUpperCase() || 'EN'}. Ready to paste directly into your Telegram chat!
          </span>
        </div>
      )}
    </div>
  );
};
