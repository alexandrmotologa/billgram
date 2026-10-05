import React, { useEffect, useState } from 'react';
import {
  FileEdit,
  Eye,
  FolderArchive,
  Settings,
  Plus,
  Receipt,
} from 'lucide-react';
import { useInvoiceStore } from './store/invoiceStore';
import { InvoiceForm } from './components/InvoiceForm/InvoiceForm';
import { InvoiceCanvas } from './components/Preview/InvoiceCanvas';
import { ShareBar } from './components/Preview/ShareBar';
import { RevenueSummary } from './components/Dashboard/RevenueSummary';
import { InvoiceList } from './components/Dashboard/InvoiceList';
import { ProfileModal } from './components/Settings/ProfileModal';
import { initTelegramWebApp, triggerHaptic } from './lib/telegram';

type Tab = 'editor' | 'preview' | 'invoices' | 'settings';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('editor');
  const [previewQrUrl, setPreviewQrUrl] = useState<string>('');
  const { isInitialized, initStore, createNewInvoice, currentInvoice, loadInvoice } =
    useInvoiceStore();

  useEffect(() => {
    initTelegramWebApp();
    initStore();
  }, [initStore]);

  // Sync Telegram WebApp BackButton
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg?.BackButton) return;

    if (activeTab === 'preview' || activeTab === 'settings') {
      tg.BackButton.show();
      const handleBack = () => {
        triggerHaptic('selection');
        setActiveTab('editor');
      };
      tg.BackButton.onClick(handleBack);
      return () => {
        tg.BackButton?.offClick(handleBack);
      };
    } else {
      tg.BackButton.hide();
    }
  }, [activeTab]);

  const handleTabChange = (tab: Tab) => {
    triggerHaptic('selection');
    setActiveTab(tab);
  };

  const handleCreateNew = () => {
    triggerHaptic('medium');
    createNewInvoice();
    setActiveTab('editor');
  };

  const handleSelectInvoice = (id: string) => {
    triggerHaptic('light');
    loadInvoice(id);
    setActiveTab('editor');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-semibold text-slate-600">Loading BillGram...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col antialiased selection:bg-blue-100">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
              <Receipt className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-slate-900">
                BillGram
              </span>
              <span className="text-[10px] font-mono text-slate-500 block -mt-1">
                #{currentInvoice.number}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-xl w-full mx-auto p-3.5 sm:p-4">
        {activeTab === 'editor' && (
          <InvoiceForm onNavigateToPreview={() => setActiveTab('preview')} />
        )}

        {activeTab === 'preview' && (
          <div className="space-y-4">
            <ShareBar
              onBackToEdit={() => setActiveTab('editor')}
              qrDataUrl={previewQrUrl}
            />
            <InvoiceCanvas onQrGenerated={setPreviewQrUrl} />
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <RevenueSummary />
            <InvoiceList
              onSelectInvoice={handleSelectInvoice}
              onCreateNew={handleCreateNew}
            />
          </div>
        )}

        {activeTab === 'settings' && <ProfileModal />}
      </main>

      {/* Bottom Sticky Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200">
        <div className="max-w-xl mx-auto grid grid-cols-4 px-2 py-1.5">
          <button
            type="button"
            onClick={() => handleTabChange('editor')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'editor'
                ? 'text-blue-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <FileEdit className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Editor</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('preview')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'preview'
                ? 'text-blue-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <Eye className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Preview</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('invoices')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'invoices'
                ? 'text-blue-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <FolderArchive className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Invoices</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('settings')}
            className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'text-blue-600 font-bold'
                : 'text-slate-400 hover:text-slate-600 font-medium'
            }`}
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
