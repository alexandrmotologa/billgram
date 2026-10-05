import React from 'react';
import { TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { calculateInvoiceTotals, formatCurrency } from '../../lib/currency';

export const RevenueSummary: React.FC = () => {
  const { savedInvoices, profile } = useInvoiceStore();
  const currency = profile.defaultCurrency;

  let totalBilled = 0;
  let totalPaid = 0;
  let totalOutstanding = 0;

  for (const inv of savedInvoices) {
    const { total } = calculateInvoiceTotals(inv);
    totalBilled += total;
    if (inv.status === 'paid') {
      totalPaid += total;
    } else {
      totalOutstanding += total;
    }
  }

  return (
    <div className="grid grid-cols-3 gap-2.5 mb-5">
      {/* Total Invoiced */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-1">
          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          <span>Total billed</span>
        </div>
        <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
          {formatCurrency(totalBilled, currency)}
        </span>
        <span className="text-[10px] text-slate-400 mt-1">
          {savedInvoices.length} {savedInvoices.length === 1 ? 'invoice' : 'invoices'}
        </span>
      </div>

      {/* Total Paid */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Collected</span>
        </div>
        <span className="text-sm sm:text-base font-black text-emerald-600 tracking-tight">
          {formatCurrency(totalPaid, currency)}
        </span>
        <span className="text-[10px] text-slate-400 mt-1">Settled in full</span>
      </div>

      {/* Outstanding */}
      <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-1">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
          <span>Pending</span>
        </div>
        <span className="text-sm sm:text-base font-black text-amber-600 tracking-tight">
          {formatCurrency(totalOutstanding, currency)}
        </span>
        <span className="text-[10px] text-slate-400 mt-1">Unpaid balance</span>
      </div>
    </div>
  );
};
