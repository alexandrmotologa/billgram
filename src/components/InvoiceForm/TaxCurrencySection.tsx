import React from 'react';
import { DollarSign, Percent, ShieldCheck, PenTool, ArrowRightLeft } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { CURRENCY_CONFIG } from '../../lib/currency';
import { triggerHaptic } from '../../lib/telegram';
import type { CurrencyCode } from '../../types/invoice';

export const TaxCurrencySection: React.FC = () => {
  const { currentInvoice, updateCurrentInvoice, profile } = useInvoiceStore();

  const currencies: CurrencyCode[] = ['EUR', 'USD', 'GBP', 'RON', 'MDL', 'CHF'];
  const taxPresets = [0, 5, 9, 19, 20, 21];

  const handleCurrencyChange = (c: CurrencyCode) => {
    triggerHaptic('selection');
    updateCurrentInvoice({ currency: c });
  };

  const handleTaxPreset = (rate: number) => {
    triggerHaptic('selection');
    updateCurrentInvoice({ taxRate: rate, isTaxExempt: rate === 0 && currentInvoice.isTaxExempt });
  };

  const handleToggleExempt = () => {
    triggerHaptic('medium');
    const nextExempt = !currentInvoice.isTaxExempt;
    updateCurrentInvoice({
      isTaxExempt: nextExempt,
      taxExemptReason: nextExempt
        ? 'VAT reverse-charged pursuant to Article 196 of EU VAT Directive 2006/112/EC. Recipient liable for payment of VAT.'
        : '',
    });
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">Tax & currency</h2>
        </div>
      </div>

      <div className="space-y-4">
        {/* Currency Selector */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">Currency</label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {currencies.map((c) => {
              const active = currentInvoice.currency === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleCurrencyChange(c)}
                  className={`py-1.5 px-2 text-xs font-semibold rounded-lg border transition-all ${
                    active
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {CURRENCY_CONFIG[c]?.label || c}
                </button>
              );
            })}
          </div>
        </div>

        {/* VAT / Tax Rate */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-600">VAT / Tax rate (%)</label>
            <span className="text-xs font-mono font-bold text-slate-800">
              {currentInvoice.isTaxExempt ? '0% (Exempt)' : `${currentInvoice.taxRate}%`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {taxPresets.map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => handleTaxPreset(rate)}
                disabled={currentInvoice.isTaxExempt}
                className={`py-1 px-2.5 text-xs font-semibold rounded-md border transition-colors ${
                  !currentInvoice.isTaxExempt && currentInvoice.taxRate === rate
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40'
                }`}
              >
                {rate}%
              </button>
            ))}

            <div className="relative w-20 ml-auto">
              <input
                type="number"
                min="0"
                max="100"
                step="any"
                disabled={currentInvoice.isTaxExempt}
                value={currentInvoice.isTaxExempt ? '' : currentInvoice.taxRate}
                onChange={(e) =>
                  updateCurrentInvoice({ taxRate: parseFloat(e.target.value) || 0 })
                }
                placeholder="Custom"
                className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-right font-semibold text-slate-900 disabled:opacity-40"
              />
              <Percent className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Tax Exempt / Reverse Charge Toggle */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">
                Tax Exempt / Reverse Charge
              </span>
            </div>
            <input
              type="checkbox"
              checked={currentInvoice.isTaxExempt}
              onChange={handleToggleExempt}
              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
            />
          </label>

          {currentInvoice.isTaxExempt && (
            <div className="mt-2.5 pt-2 border-t border-slate-200/80">
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Statutory reverse charge notice (EU / cross-border B2B)
              </label>
              <textarea
                rows={2}
                value={currentInvoice.taxExemptReason || ''}
                onChange={(e) => updateCurrentInvoice({ taxExemptReason: e.target.value })}
                placeholder="e.g. VAT reverse-charged pursuant to Article 196 of EU VAT Directive 2006/112/EC"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800"
              />
            </div>
          )}
        </div>

        {/* Exchange Rate Note */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
            <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" /> Reference exchange rate (optional)
          </label>
          <input
            type="text"
            value={currentInvoice.exchangeRateNote || ''}
            onChange={(e) => updateCurrentInvoice({ exchangeRateNote: e.target.value })}
            placeholder="e.g. Curs de schimb BNR: 1 EUR = 4.9765 RON"
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 font-mono text-xs"
          />
        </div>

        {/* Include Authorized Signature Toggle */}
        {profile.signatureUrl && (
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-indigo-600" />
                <div>
                  <span className="text-xs font-semibold text-slate-800 block">
                    Include authorized signature on invoice
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Renders your signature in the PDF authorization box
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={currentInvoice.includeSignature}
                onChange={(e) => updateCurrentInvoice({ includeSignature: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
            </label>
          </div>
        )}

        {/* Notes & Terms */}
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Customer notes
            </label>
            <input
              type="text"
              value={currentInvoice.notes || ''}
              onChange={(e) => updateCurrentInvoice({ notes: e.target.value })}
              placeholder="e.g. Thank you for your business! Please include invoice # in transfer reference."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Terms & conditions
            </label>
            <input
              type="text"
              value={currentInvoice.terms || ''}
              onChange={(e) => updateCurrentInvoice({ terms: e.target.value })}
              placeholder="e.g. Payment due within 14 days of issue date."
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
