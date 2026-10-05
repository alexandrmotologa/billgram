import React, { useState } from 'react';
import { Plus, Trash2, Layers, Percent, Bookmark } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { formatCurrency, calculateLineItemTotal } from '../../lib/currency';
import { triggerHaptic } from '../../lib/telegram';
import type { ItemUnit, ServicePreset } from '../../types/invoice';

export const LineItemsSection: React.FC = () => {
  const { currentInvoice, addLineItem, updateLineItem, removeLineItem, servicePresets } =
    useInvoiceStore();
  const [showCatalog, setShowCatalog] = useState(false);

  const handleAddItem = () => {
    triggerHaptic('light');
    addLineItem({
      description: '',
      quantity: 1,
      unit: 'service',
      unitPrice: 0,
      discountPercent: 0,
    });
  };

  const handleAddFromPreset = (preset: ServicePreset) => {
    triggerHaptic('success');
    addLineItem({
      description: preset.description || preset.title,
      quantity: 1,
      unit: preset.unit,
      unitPrice: preset.unitPrice,
      discountPercent: preset.discountPercent || 0,
    });
    setShowCatalog(false);
  };

  const handleRemoveItem = (id: string) => {
    triggerHaptic('medium');
    removeLineItem(id);
  };

  const unitOptions: { value: ItemUnit; label: string }[] = [
    { value: 'service', label: 'svc' },
    { value: 'hours', label: 'hrs' },
    { value: 'days', label: 'days' },
    { value: 'units', label: 'pcs' },
    { value: 'fixed', label: 'fix' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">Line items</h2>
        </div>
        <div className="flex items-center gap-2">
          {servicePresets.length > 0 && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic('selection');
                setShowCatalog(!showCatalog);
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </button>
          )}
          <span className="text-xs font-medium text-slate-500">
            {currentInvoice.items.length} {currentInvoice.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Preset Quick Selection Drawer */}
      {showCatalog && servicePresets.length > 0 && (
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl mb-3 space-y-2">
          <span className="text-[11px] font-bold text-blue-900 block">
            Tap a service preset to insert instantly:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {servicePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleAddFromPreset(preset)}
                className="px-2.5 py-1.5 bg-white border border-blue-200 hover:border-blue-400 text-blue-950 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors active:scale-95"
              >
                <span>{preset.title}</span>
                <span className="text-[10px] text-blue-600 font-mono">
                  ({preset.unitPrice}/{preset.unit})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {currentInvoice.items.map((item, index) => {
          const lineTotal = calculateLineItemTotal(item);
          return (
            <div
              key={item.id}
              className="p-3 bg-slate-50/80 rounded-lg border border-slate-200/90 space-y-2 relative group"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-slate-400">#{index + 1}</span>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, { description: e.target.value })}
                  placeholder="Task, service or product description"
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-900"
                />
                {currentInvoice.items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Quantities, Unit, Price, Discount, Total */}
              <div className="grid grid-cols-12 gap-2 items-center">
                {/* Qty */}
                <div className="col-span-3">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Qty
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={item.quantity || ''}
                    onChange={(e) =>
                      updateLineItem(item.id, { quantity: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 text-center font-semibold"
                  />
                </div>

                {/* Unit */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Unit
                  </label>
                  <select
                    value={item.unit}
                    onChange={(e) =>
                      updateLineItem(item.id, { unit: e.target.value as ItemUnit })
                    }
                    className="w-full px-1 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 font-medium text-center"
                  >
                    {unitOptions.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit Price */}
                <div className="col-span-3">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Rate
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={item.unitPrice || ''}
                    onChange={(e) =>
                      updateLineItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                    className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 text-right font-medium"
                  />
                </div>

                {/* Discount % */}
                <div className="col-span-2">
                  <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center justify-end gap-0.5">
                    <Percent className="w-2.5 h-2.5" />
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discountPercent || ''}
                    onChange={(e) =>
                      updateLineItem(item.id, {
                        discountPercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="0%"
                    className="w-full px-1.5 py-1 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700 text-right font-medium"
                  />
                </div>

                {/* Line Total */}
                <div className="col-span-2 text-right">
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Total
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatCurrency(lineTotal, currentInvoice.currency)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Item Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddItem}
            className="flex-1 py-2 border border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Line Item
          </button>
        </div>
      </div>
    </div>
  );
};
