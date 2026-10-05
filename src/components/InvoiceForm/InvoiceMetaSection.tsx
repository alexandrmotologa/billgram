import React from 'react';
import { Calendar, FileText, Clock } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { triggerHaptic } from '../../lib/telegram';
import type { InvoiceStatus } from '../../types/invoice';

export const InvoiceMetaSection: React.FC = () => {
  const { currentInvoice, updateCurrentInvoice } = useInvoiceStore();

  const handleQuickDueDate = (days: number) => {
    triggerHaptic('selection');
    const d = new Date(currentInvoice.issueDate || new Date());
    d.setDate(d.getDate() + days);
    updateCurrentInvoice({ dueDate: d.toISOString().split('T')[0] });
  };

  const statusOptions: { value: InvoiceStatus; label: string }[] = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">Invoice info</h2>
        </div>
        {/* Status selector */}
        <select
          value={currentInvoice.status}
          onChange={(e) => {
            triggerHaptic('selection');
            updateCurrentInvoice({ status: e.target.value as InvoiceStatus });
          }}
          className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {/* Invoice Number */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Invoice reference number <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={currentInvoice.number}
            onChange={(e) => updateCurrentInvoice({ number: e.target.value })}
            placeholder="INV-2026-001"
            className="w-full px-3 py-2 text-sm font-mono font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
          />
        </div>

        {/* Date inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Issue date</label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={currentInvoice.issueDate}
                onChange={(e) => updateCurrentInvoice({ issueDate: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Payment due date</label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="date"
                value={currentInvoice.dueDate}
                onChange={(e) => updateCurrentInvoice({ dueDate: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Quick Due Date chips */}
        <div className="flex items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-500 font-medium">Quick terms:</span>
          <button
            type="button"
            onClick={() => handleQuickDueDate(0)}
            className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
          >
            Receipt
          </button>
          <button
            type="button"
            onClick={() => handleQuickDueDate(7)}
            className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
          >
            +7d
          </button>
          <button
            type="button"
            onClick={() => handleQuickDueDate(14)}
            className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
          >
            +14d
          </button>
          <button
            type="button"
            onClick={() => handleQuickDueDate(30)}
            className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors"
          >
            +30d
          </button>
        </div>
      </div>
    </div>
  );
};
