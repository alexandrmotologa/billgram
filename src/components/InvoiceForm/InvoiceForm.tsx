import React from 'react';
import { Eye, Save, Sparkles } from 'lucide-react';
import { ClientSection } from './ClientSection';
import { InvoiceMetaSection } from './InvoiceMetaSection';
import { LineItemsSection } from './LineItemsSection';
import { TaxCurrencySection } from './TaxCurrencySection';
import { PaymentSection } from './PaymentSection';
import { useInvoiceStore } from '../../store/invoiceStore';
import { calculateInvoiceTotals, formatCurrency } from '../../lib/currency';
import { triggerHaptic } from '../../lib/telegram';

interface InvoiceFormProps {
  onNavigateToPreview: () => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({ onNavigateToPreview }) => {
  const { currentInvoice, saveCurrentInvoice } = useInvoiceStore();
  const totals = calculateInvoiceTotals(currentInvoice);

  const handleSave = async () => {
    triggerHaptic('success');
    await saveCurrentInvoice();
  };

  const handlePreview = async () => {
    triggerHaptic('light');
    await saveCurrentInvoice();
    onNavigateToPreview();
  };

  return (
    <div className="pb-24">
      {/* Dynamic Floating Quick Totals Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 mb-4 shadow-lg flex items-center justify-between">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Invoice Total Due
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white">
              {formatCurrency(totals.total, currentInvoice.currency)}
            </span>
            {totals.taxAmount > 0 && (
              <span className="text-xs text-slate-400">
                (incl. {formatCurrency(totals.taxAmount, currentInvoice.currency)} tax)
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="Save draft"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handlePreview}
            className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Form sections */}
      <InvoiceMetaSection />
      <ClientSection />
      <LineItemsSection />
      <TaxCurrencySection />
      <PaymentSection />

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-16 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-30 max-w-xl mx-auto flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-white text-slate-800 text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save Draft
        </button>
        <button
          type="button"
          onClick={handlePreview}
          className="flex-1 py-3 px-4 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 shadow-md transition-all active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Preview & Export PDF
        </button>
      </div>
    </div>
  );
};
