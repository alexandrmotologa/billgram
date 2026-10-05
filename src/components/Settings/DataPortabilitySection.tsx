import React, { useRef, useState } from 'react';
import { Download, Upload, FileSpreadsheet, Plus, Trash2, Tag, Check, AlertCircle } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { exportBackupJson, parseBackupJson, exportInvoicesCsv } from '../../lib/export';
import { triggerHaptic } from '../../lib/telegram';
import type { ItemUnit } from '../../types/invoice';

export const DataPortabilitySection: React.FC = () => {
  const {
    profile,
    clients,
    savedInvoices,
    servicePresets,
    addServicePreset,
    deleteServicePreset,
    restoreFullBackup,
  } = useInvoiceStore();

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPrice, setNewPrice] = useState<number>(50);
  const [newUnit, setNewUnit] = useState<ItemUnit>('hours');
  const [showAddPreset, setShowAddPreset] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportJson = () => {
    triggerHaptic('success');
    exportBackupJson({
      profile,
      clients,
      savedInvoices,
      servicePresets,
    });
    setStatusMsg({ text: 'Backup JSON downloaded successfully.' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleExportCsv = () => {
    triggerHaptic('success');
    exportInvoicesCsv(savedInvoices);
    setStatusMsg({ text: 'Invoices CSV exported for accounting.' });
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backup = parseBackupJson(text);
      if (confirm(`Restore backup containing ${backup.savedInvoices.length} invoices and ${backup.clients.length} clients?`)) {
        triggerHaptic('success');
        await restoreFullBackup(backup);
        setStatusMsg({ text: 'Backup restored successfully!' });
      }
    } catch (err) {
      console.error('Import error:', err);
      triggerHaptic('error');
      setStatusMsg({ text: 'Invalid backup file structure.', error: true });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setStatusMsg(null), 3500);
    }
  };

  const handleCreatePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    triggerHaptic('light');
    await addServicePreset({
      title: newTitle.trim(),
      description: newDesc.trim() || newTitle.trim(),
      unit: newUnit,
      unitPrice: newPrice,
      discountPercent: 0,
    });
    setNewTitle('');
    setNewDesc('');
    setShowAddPreset(false);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Service Presets Catalog */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Service presets catalog
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowAddPreset(!showAddPreset)}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            {showAddPreset ? 'Cancel' : 'Add preset'}
          </button>
        </div>

        {/* New preset form */}
        {showAddPreset && (
          <form onSubmit={handleCreatePreset} className="p-3 bg-white rounded-lg border border-slate-200 mb-3 space-y-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Service Title</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Code Review & QA"
                className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Detailed invoice description..."
                className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Rate</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={newPrice}
                  onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Unit</label>
                <select
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value as ItemUnit)}
                  className="w-full px-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800"
                >
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="service">Service</option>
                  <option value="units">Pieces</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 mt-1 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-bold transition-colors"
            >
              Save Service Preset
            </button>
          </form>
        )}

        {/* Existing presets list */}
        <div className="space-y-1.5">
          {servicePresets.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs"
            >
              <div>
                <span className="font-bold text-slate-800 block">{p.title}</span>
                <span className="text-[11px] text-slate-500">
                  {p.unitPrice} / {p.unit}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  deleteServicePreset(p.id);
                }}
                className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                title="Delete preset"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Backup and Accounting Export */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Data backup & accounting export
        </h3>

        {statusMsg && (
          <div
            className={`p-2.5 rounded-lg text-xs flex items-center gap-1.5 ${
              statusMsg.error
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {statusMsg.error ? <AlertCircle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            Backup JSON
          </button>

          {/* Import JSON */}
          <label className="cursor-pointer py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors">
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            Restore JSON
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};
