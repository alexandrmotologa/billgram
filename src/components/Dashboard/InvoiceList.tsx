import React, { useState } from 'react';
import { Search, Plus, Edit2, Copy, Trash2, Calendar, FileText } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { StatusBadge } from './StatusBadge';
import { calculateInvoiceTotals, formatCurrency } from '../../lib/currency';
import { triggerHaptic } from '../../lib/telegram';
import type { InvoiceStatus } from '../../types/invoice';

interface InvoiceListProps {
  onSelectInvoice: (id: string) => void;
  onCreateNew: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ onSelectInvoice, onCreateNew }) => {
  const { savedInvoices, duplicateInvoice, deleteInvoice, updateInvoiceStatus } = useInvoiceStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'draft', label: 'Draft' },
    { id: 'sent', label: 'Sent' },
    { id: 'paid', label: 'Paid' },
    { id: 'overdue', label: 'Overdue' },
  ];

  const filteredInvoices = savedInvoices.filter((inv) => {
    const matchesSearch =
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCycleStatus = async (id: string, currentStatus: InvoiceStatus) => {
    triggerHaptic('selection');
    const order: InvoiceStatus[] = ['draft', 'sent', 'paid'];
    const currentIndex = order.indexOf(currentStatus);
    const nextStatus = currentIndex >= 0 && currentIndex < order.length - 1 ? order[currentIndex + 1] : 'paid';
    await updateInvoiceStatus(id, nextStatus);
  };

  const handleDuplicate = (id: string) => {
    triggerHaptic('light');
    duplicateInvoice(id);
    onSelectInvoice(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this invoice? This action cannot be undone.')) {
      triggerHaptic('medium');
      await deleteInvoice(id);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Search and Filter */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search invoice number or client name..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {filterTabs.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHaptic('selection');
                  setStatusFilter(tab.id);
                }}
                className={`py-1 px-3 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Invoice List Items */}
      {filteredInvoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-800">No invoices found</p>
            <p className="text-xs text-slate-500">
              {savedInvoices.length === 0
                ? 'Create your first invoice in under 30 seconds.'
                : 'Try adjusting your search query or status filter.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredInvoices.map((inv) => {
            const { total } = calculateInvoiceTotals(inv);
            return (
              <div
                key={inv.id}
                className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs font-bold text-blue-600">
                      #{inv.number}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {inv.client.name || 'Unnamed Client'}
                    </h3>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-sm font-black text-slate-900 block">
                      {formatCurrency(total, inv.currency)}
                    </span>
                    <StatusBadge
                      status={inv.status}
                      onClick={() => handleCycleStatus(inv.id, inv.status)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Issued: {inv.issueDate}
                    </span>
                    <span>Due: {inv.dueDate}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectInvoice(inv.id)}
                      className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Invoice"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(inv.id)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(inv.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
