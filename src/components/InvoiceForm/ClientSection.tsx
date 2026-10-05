import React, { useState } from 'react';
import { User, Building, Mail, MapPin, Hash, Check } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { triggerHaptic } from '../../lib/telegram';
import type { Client } from '../../types/invoice';

export const ClientSection: React.FC = () => {
  const { currentInvoice, updateClient, clients } = useInvoiceStore();
  const [showSuggestions, setShowSuggestions] = useState(false);

  const client = currentInvoice.client;

  const handleSelectClient = (c: Client) => {
    triggerHaptic('selection');
    updateClient({
      name: c.name,
      email: c.email || '',
      address: c.address || '',
      taxId: c.taxId || '',
      phone: c.phone || '',
    });
    setShowSuggestions(false);
  };

  const matchingClients = clients.filter(
    (c) =>
      client.name.trim() &&
      c.name.toLowerCase().includes(client.name.toLowerCase()) &&
      c.name.toLowerCase() !== client.name.toLowerCase()
  );

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">Client details</h2>
        </div>
        {client.name.trim() && (
          <span className="text-[11px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" /> Saved on finish
          </span>
        )}
      </div>

      <div className="space-y-3">
        {/* Client Name with autocomplete */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Client name or company <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={client.name}
              onChange={(e) => {
                updateClient({ name: e.target.value });
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="e.g. Acme Corp / Jane Doe"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-slate-900"
            />
          </div>

          {/* Autocomplete dropdown */}
          {showSuggestions && matchingClients.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                Saved clients
              </div>
              {matchingClients.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectClient(c)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50/60 transition-colors flex flex-col border-b border-slate-50 last:border-0"
                >
                  <span className="font-semibold text-slate-800">{c.name}</span>
                  {c.email && <span className="text-[11px] text-slate-500">{c.email}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Email & Tax ID grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={client.email || ''}
                onChange={(e) => updateClient({ email: e.target.value })}
                placeholder="billing@client.com"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tax ID / VAT number</label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={client.taxId || ''}
                onChange={(e) => updateClient({ taxId: e.target.value })}
                placeholder="e.g. EU123456789"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Billing address</label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={client.address || ''}
              onChange={(e) => updateClient({ address: e.target.value })}
              placeholder="Street, City, Postal Code, Country"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
