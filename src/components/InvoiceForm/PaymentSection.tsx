import React from 'react';
import { QrCode, CreditCard, RotateCcw, Landmark, Smartphone, Zap, Wallet } from 'lucide-react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { triggerHaptic } from '../../lib/telegram';
import type { PaymentMethodType } from '../../types/invoice';

export const PaymentSection: React.FC = () => {
  const { currentInvoice, updatePayment, profile } = useInvoiceStore();
  const payment = currentInvoice.payment;

  const handleMethodChange = (m: PaymentMethodType) => {
    triggerHaptic('selection');
    updatePayment({ method: m });
  };

  const handlePreFillFromProfile = () => {
    triggerHaptic('success');
    updatePayment({
      beneficiaryName: profile.name,
      iban: profile.iban,
      bic: profile.bic,
      bankName: profile.bankName,
      revolutTag: profile.revolutTag,
      stripePaymentLink: profile.stripePaymentLink,
      tonAddress: profile.tonAddress,
      referenceText: `Invoice ${currentInvoice.number}`,
    });
  };

  const methods: { id: PaymentMethodType; label: string; icon: React.ReactNode }[] = [
    { id: 'sepa', label: 'SEPA / EPC', icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: 'revolut', label: 'Revolut', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'stripe', label: 'Stripe', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'ton', label: 'TON Crypto', icon: <Wallet className="w-3.5 h-3.5" /> },
    { id: 'custom', label: 'Custom', icon: <CreditCard className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <QrCode className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-semibold text-slate-800 tracking-tight">Payment & QR code</h2>
        </div>
        <button
          type="button"
          onClick={handlePreFillFromProfile}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline"
        >
          <RotateCcw className="w-3 h-3" /> Fill from profile
        </button>
      </div>

      {/* Payment Method Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mb-4">
        {methods.map((m) => {
          const active = payment.method === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleMethodChange(m.id)}
              className={`py-2 px-2 text-xs font-semibold rounded-lg border flex items-center justify-center gap-1.5 transition-all ${
                active
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {m.icon}
              {m.label}
            </button>
          );
        })}
      </div>

      {/* SEPA Form Fields */}
      {payment.method === 'sepa' && (
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-start gap-2 text-[11px] text-slate-500 pb-1">
            <span className="font-semibold text-slate-700">EPC QR Standard:</span>
            <span>
              Generates European Banking Council QR code for instant autofill in EU banking apps.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Beneficiary name
            </label>
            <input
              type="text"
              value={payment.beneficiaryName || ''}
              onChange={(e) => updatePayment({ beneficiaryName: e.target.value })}
              placeholder="e.g. Alexandr Motologa"
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                IBAN number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={payment.iban || ''}
                onChange={(e) => updatePayment({ iban: e.target.value.toUpperCase() })}
                placeholder="RO49BTRL0000000000000000"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                BIC / SWIFT code
              </label>
              <input
                type="text"
                value={payment.bic || ''}
                onChange={(e) => updatePayment({ bic: e.target.value.toUpperCase() })}
                placeholder="BTRLRO22"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Bank name</label>
              <input
                type="text"
                value={payment.bankName || ''}
                onChange={(e) => updatePayment({ bankName: e.target.value })}
                placeholder="e.g. Banca Transilvania"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Transfer reference
              </label>
              <input
                type="text"
                value={payment.referenceText || ''}
                onChange={(e) => updatePayment({ referenceText: e.target.value })}
                placeholder={`Invoice ${currentInvoice.number}`}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* Revolut Form Fields */}
      {payment.method === 'revolut' && (
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Revolut RevTag (@username)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">@</span>
            <input
              type="text"
              value={payment.revolutTag?.replace(/^@/, '') || ''}
              onChange={(e) => updatePayment({ revolutTag: e.target.value.replace(/^@/, '') })}
              placeholder="alexandrmotologa"
              className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-900"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            QR code encodes direct link to https://revolut.me/{payment.revolutTag || 'tag'}
          </p>
        </div>
      )}

      {/* Stripe Form Fields */}
      {payment.method === 'stripe' && (
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Stripe payment link / Checkout URL
          </label>
          <input
            type="url"
            value={payment.stripePaymentLink || ''}
            onChange={(e) => updatePayment({ stripePaymentLink: e.target.value })}
            placeholder="https://buy.stripe.com/..."
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 font-mono text-xs"
          />
          <p className="text-[11px] text-slate-500">
            Clients can scan the QR code to pay via card, Apple Pay, or Google Pay.
          </p>
        </div>
      )}

      {/* TON Form Fields */}
      {payment.method === 'ton' && (
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            TON wallet address
          </label>
          <input
            type="text"
            value={payment.tonAddress || ''}
            onChange={(e) => updatePayment({ tonAddress: e.target.value })}
            placeholder="EQD..."
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900 font-mono text-xs"
          />
          <p className="text-[11px] text-slate-500">
            Encodes native ton://transfer URI for Telegram Wallet or Tonkeeper.
          </p>
        </div>
      )}

      {/* Custom Form Fields */}
      {payment.method === 'custom' && (
        <div className="space-y-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Custom payment instructions
          </label>
          <textarea
            rows={3}
            value={payment.customInstructions || ''}
            onChange={(e) => updatePayment({ customInstructions: e.target.value })}
            placeholder="Wire details, cash on delivery, or specific remittance rules..."
            className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-900"
          />
        </div>
      )}
    </div>
  );
};
