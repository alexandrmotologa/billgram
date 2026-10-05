import React, { useState } from 'react';
import {
  Building2,
  Landmark,
  Smartphone,
  Upload,
  Check,
  Save,
  Trash2,
  PenTool,
  Languages,
  LayoutTemplate,
} from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { AccentPicker } from './AccentPicker';
import { SignaturePadModal } from './SignaturePadModal';
import { DataPortabilitySection } from './DataPortabilitySection';
import { CURRENCY_CONFIG } from '../../lib/currency';
import { triggerHaptic } from '../../lib/telegram';
import type { BusinessProfile, CurrencyCode, InvoiceLanguage, TemplateLayout } from '../../types/invoice';

export const ProfileModal: React.FC = () => {
  const { profile, updateProfile } = useInvoiceStore();
  const [formData, setFormData] = useState<BusinessProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      triggerHaptic('light');
      setFormData((prev) => ({ ...prev, logoUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    triggerHaptic('light');
    setFormData((prev) => ({ ...prev, logoUrl: '' }));
  };

  const handleSaveSignature = async (sigUrl: string) => {
    setFormData((prev) => ({ ...prev, signatureUrl: sigUrl }));
    await updateProfile({ signatureUrl: sigUrl });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    await updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const currencies: CurrencyCode[] = ['EUR', 'USD', 'GBP', 'RON', 'MDL', 'CHF'];
  const languages: { code: InvoiceLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ro', label: 'Română' },
    { code: 'de', label: 'Deutsch' },
    { code: 'fr', label: 'Français' },
  ];
  const layouts: { code: TemplateLayout; label: string }[] = [
    { code: 'swiss', label: 'Swiss Minimalist' },
    { code: 'executive', label: 'Modern Executive' },
    { code: 'compact', label: 'Compact Receipt' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 mb-20 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Business Profile</h2>
          <p className="text-xs text-slate-500">
            Pre-fills your sender details, bank accounts, and defaults on new invoices.
          </p>
        </div>
        {savedSuccess && (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Saved
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        {/* Company Logo & Signature */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Logo */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-2">Company Logo</label>
            <div className="flex items-center gap-3">
              {formData.logoUrl ? (
                <div className="relative w-16 h-14 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center">
                  <img src={formData.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-14 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white">
                  <Building2 className="w-5 h-5" />
                </div>
              )}

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium shadow-sm transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Signature */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-2">Authorized Signature</label>
            <div className="flex items-center gap-3">
              {formData.signatureUrl ? (
                <div className="w-20 h-14 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center">
                  <img src={formData.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                </div>
              ) : (
                <div className="w-16 h-14 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-white">
                  <PenTool className="w-5 h-5" />
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowSignatureModal(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium shadow-sm transition-colors"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>{formData.signatureUrl ? 'Edit' : 'Sign'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sender Legal Details */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            Legal details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Your full name or company name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Alexandr Motologa"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Tax ID / VAT number
              </label>
              <input
                type="text"
                value={formData.taxId || ''}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="RO12345678"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="alex@motologa.com"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone number</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+40 700 000 000"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Business address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Strada Academiei 1, Bucharest, Romania"
              className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900"
            />
          </div>
        </div>

        {/* Bank & Payment Accounts */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-emerald-600" />
            Default banking & payment accounts
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                IBAN (Eurozone / Local)
              </label>
              <input
                type="text"
                value={formData.iban || ''}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                placeholder="RO49BTRL0000000000000000"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">BIC / SWIFT code</label>
              <input
                type="text"
                value={formData.bic || ''}
                onChange={(e) => setFormData({ ...formData, bic: e.target.value.toUpperCase() })}
                placeholder="BTRLRO22"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Bank name</label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder="Banca Transilvania"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Revolut RevTag (@username)
              </label>
              <div className="relative">
                <Smartphone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={formData.revolutTag?.replace(/^@/, '') || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, revolutTag: e.target.value.replace(/^@/, '') })
                  }
                  placeholder="alexandrmotologa"
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Stripe checkout link
              </label>
              <input
                type="url"
                value={formData.stripePaymentLink || ''}
                onChange={(e) => setFormData({ ...formData, stripePaymentLink: e.target.value })}
                placeholder="https://buy.stripe.com/..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                TON wallet address
              </label>
              <input
                type="text"
                value={formData.tonAddress || ''}
                onChange={(e) => setFormData({ ...formData, tonAddress: e.target.value })}
                placeholder="EQD..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Defaults & Brand Styling */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Defaults, localization & templates
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <Languages className="w-3 h-3 text-slate-500" /> Default language
              </label>
              <select
                value={formData.defaultLanguage || 'en'}
                onChange={(e) =>
                  setFormData({ ...formData, defaultLanguage: e.target.value as InvoiceLanguage })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1 flex items-center gap-1">
                <LayoutTemplate className="w-3 h-3 text-slate-500" /> Default layout
              </label>
              <select
                value={formData.defaultTemplateLayout || 'swiss'}
                onChange={(e) =>
                  setFormData({ ...formData, defaultTemplateLayout: e.target.value as TemplateLayout })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                {layouts.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Default currency
              </label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) =>
                  setFormData({ ...formData, defaultCurrency: e.target.value as CurrencyCode })
                }
                className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {CURRENCY_CONFIG[c]?.label || c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Default VAT / Tax (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.defaultTaxRate}
                onChange={(e) =>
                  setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Default terms (days)
              </label>
              <input
                type="number"
                min="0"
                value={formData.defaultPaymentTermsDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    defaultPaymentTermsDays: parseInt(e.target.value, 10) || 14,
                  })
                }
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">
              Invoice accent color
            </label>
            <AccentPicker
              currentColor={formData.accentColor}
              onChange={(color) => setFormData({ ...formData, accentColor: color })}
            />
          </div>
        </div>

        {/* Save Profile Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Profile & Sync Cloud
          </button>
        </div>
      </form>

      {/* Service Presets and Data Portability Section */}
      <DataPortabilitySection />

      {/* Signature Modal */}
      {showSignatureModal && (
        <SignaturePadModal
          currentSignature={formData.signatureUrl}
          onSave={handleSaveSignature}
          onClose={() => setShowSignatureModal(false)}
        />
      )}
    </div>
  );
};
