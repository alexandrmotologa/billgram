import React, { useEffect, useState } from 'react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { calculateInvoiceTotals, calculateLineItemTotal, formatCurrency } from '../../lib/currency';
import { getPaymentQrPayload, generateQrDataUrl } from '../../lib/epc_qr';
import { getTranslations } from '../../lib/translations';

interface InvoiceCanvasProps {
  onQrGenerated?: (dataUrl: string) => void;
}

export const InvoiceCanvas: React.FC<InvoiceCanvasProps> = ({ onQrGenerated }) => {
  const { currentInvoice } = useInvoiceStore();
  const [qrUrl, setQrUrl] = useState<string>('');

  const totals = calculateInvoiceTotals(currentInvoice);
  const sender = currentInvoice.sender;
  const client = currentInvoice.client;
  const payment = currentInvoice.payment;
  const accentColor = sender.accentColor || '#0f172a';
  const t = getTranslations(currentInvoice.language || 'en');
  const layout = currentInvoice.templateLayout || 'swiss';

  const isExecutive = layout === 'executive';
  const isCompact = layout === 'compact';

  useEffect(() => {
    let isMounted = true;
    const generateQr = async () => {
      const { payload } = getPaymentQrPayload(currentInvoice, payment, totals.total);
      if (payload) {
        const url = await generateQrDataUrl(payload);
        if (isMounted) {
          setQrUrl(url);
          onQrGenerated?.(url);
        }
      }
    };
    generateQr();
    return () => {
      isMounted = false;
    };
  }, [currentInvoice, payment, totals.total, onQrGenerated]);

  return (
    <div
      className={`bg-white rounded-xl shadow-xl border border-slate-200 text-slate-900 font-sans max-w-2xl mx-auto my-2 transition-all ${
        isCompact ? 'p-4 sm:p-6 text-xs' : 'p-6 md:p-8 text-xs'
      }`}
    >
      {/* Top Header */}
      {isExecutive ? (
        <div
          className="p-4 rounded-lg flex items-center justify-between mb-6 shadow-sm text-white"
          style={{ backgroundColor: accentColor }}
        >
          <div>
            {sender.logoUrl ? (
              <img src={sender.logoUrl} alt={sender.name} className="max-h-12 max-w-[140px] object-contain" />
            ) : (
              <h1 className="text-xl font-black tracking-tight">{sender.name || 'Your Company'}</h1>
            )}
          </div>
          <div className="text-right">
            <span className="text-xl font-black uppercase block tracking-tight">{t.invoiceTitle}</span>
            <span className="text-xs font-mono text-slate-200">#{currentInvoice.number}</span>
          </div>
        </div>
      ) : (
        <div
          className={`flex items-start justify-between border-b-2 ${isCompact ? 'pb-4 mb-4' : 'pb-6 mb-6'}`}
          style={{ borderColor: accentColor }}
        >
          <div className="max-w-[200px]">
            {sender.logoUrl ? (
              <img
                src={sender.logoUrl}
                alt={sender.name}
                className="max-h-12 max-w-[140px] object-contain mb-1"
              />
            ) : (
              <h1
                className="text-xl font-black tracking-tight"
                style={{ color: accentColor }}
              >
                {sender.name || 'Your Company'}
              </h1>
            )}
          </div>

          <div className="text-right">
            <span
              className="text-2xl font-black tracking-tight block uppercase"
              style={{ color: accentColor }}
            >
              {t.invoiceTitle}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              #{currentInvoice.number}
            </span>
          </div>
        </div>
      )}

      {/* Parties Block */}
      <div className={`grid grid-cols-2 gap-6 ${isCompact ? 'mb-4' : 'mb-6'}`}>
        {/* From */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {t.billedBy}
          </span>
          <p className="font-bold text-slate-900 text-sm">{sender.name}</p>
          {sender.taxId && <p className="text-slate-600">Tax ID: {sender.taxId}</p>}
          {sender.address && <p className="text-slate-600 whitespace-pre-line">{sender.address}</p>}
          {sender.email && <p className="text-slate-600">{sender.email}</p>}
          {sender.phone && <p className="text-slate-600">{sender.phone}</p>}
        </div>

        {/* To */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            {t.billedTo}
          </span>
          <p className="font-bold text-slate-900 text-sm">
            {client.name || 'Client Name / Company'}
          </p>
          {client.taxId && <p className="text-slate-600">Tax ID: {client.taxId}</p>}
          {client.address && <p className="text-slate-600 whitespace-pre-line">{client.address}</p>}
          {client.email && <p className="text-slate-600">{client.email}</p>}
          {client.phone && <p className="text-slate-600">{client.phone}</p>}
        </div>
      </div>

      {/* Metadata Bar */}
      <div className={`grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200/90 rounded-lg text-center ${isCompact ? 'p-2 mb-4' : 'p-2.5 mb-6'}`}>
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase block">{t.issueDate}</span>
          <span className="text-xs font-semibold text-slate-800">{currentInvoice.issueDate}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase block">{t.dueDate}</span>
          <span className="text-xs font-semibold text-slate-800">{currentInvoice.dueDate}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase block">{t.currency}</span>
          <span className="text-xs font-semibold text-slate-800">{currentInvoice.currency}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase block">{t.status}</span>
          <span
            className={`text-xs font-bold uppercase ${
              currentInvoice.status === 'paid'
                ? 'text-emerald-600'
                : currentInvoice.status === 'overdue'
                ? 'text-rose-600'
                : 'text-slate-700'
            }`}
          >
            {currentInvoice.status}
          </span>
        </div>
      </div>

      {/* Items Table */}
      <div className={`overflow-hidden ${isCompact ? 'mb-4' : 'mb-6'}`}>
        <table className="w-full text-xs">
          <thead>
            <tr
              className={`border-b-2 text-left text-[10px] uppercase font-bold tracking-wider ${
                isExecutive ? 'bg-slate-50 text-slate-800' : 'text-slate-700'
              }`}
              style={{ borderColor: accentColor }}
            >
              <th className="py-2 pr-2">{t.description}</th>
              <th className="py-2 px-2 text-right">{t.qty}</th>
              <th className="py-2 px-2 text-right">{t.unitPrice}</th>
              <th className="py-2 pl-2 text-right">{t.amount}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentInvoice.items.map((item, index) => {
              const lineTotal = calculateLineItemTotal(item);
              const isEven = index % 2 === 0;
              return (
                <tr
                  key={item.id || index}
                  className={`${isExecutive && isEven ? 'bg-slate-50/40' : ''} text-slate-800`}
                >
                  <td className="py-2.5 pr-2">
                    <p className="font-semibold text-slate-900">{item.description || 'Item'}</p>
                    {item.discountPercent && item.discountPercent > 0 ? (
                      <span className="text-[10px] text-slate-500">
                        Discount: {item.discountPercent}%
                      </span>
                    ) : null}
                  </td>
                  <td className="py-2.5 px-2 text-right font-medium">
                    {item.quantity} {item.unit !== 'units' ? item.unit : ''}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-600">
                    {formatCurrency(item.unitPrice, currentInvoice.currency)}
                  </td>
                  <td className="py-2.5 pl-2 text-right font-bold text-slate-900">
                    {formatCurrency(lineTotal, currentInvoice.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className={`flex justify-end text-xs ${isCompact ? 'mb-4' : 'mb-6'}`}>
        <div className="w-56 space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>{t.subtotal}</span>
            <span>{formatCurrency(totals.subtotal, currentInvoice.currency)}</span>
          </div>

          {totals.discountTotal > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>{t.discount}</span>
              <span>-{formatCurrency(totals.discountTotal, currentInvoice.currency)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>
              {currentInvoice.isTaxExempt ? t.taxExempt : `${t.tax} (${currentInvoice.taxRate}%)`}
            </span>
            <span>{formatCurrency(totals.taxAmount, currentInvoice.currency)}</span>
          </div>

          <div
            className="flex justify-between pt-2 border-t-2 font-black text-sm text-slate-900"
            style={{ borderColor: accentColor }}
          >
            <span>{t.totalDue}</span>
            <span style={{ color: accentColor }}>
              {formatCurrency(totals.total, currentInvoice.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Payment & QR Box */}
      <div className="flex items-center gap-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-xs">
        {qrUrl ? (
          <div className="w-24 h-24 shrink-0 bg-white p-1 rounded-lg border border-slate-200 flex items-center justify-center">
            <img src={qrUrl} alt="Payment QR" className="w-full h-full object-contain" />
          </div>
        ) : null}

        <div className="flex-1 space-y-1">
          <span
            className="text-[11px] font-bold uppercase tracking-wider block"
            style={{ color: accentColor }}
          >
            {t.paymentDetails}
          </span>

          {payment.method === 'sepa' && (
            <>
              <p className="text-slate-700">
                <span className="font-semibold text-slate-900">{t.beneficiary}:</span>{' '}
                {payment.beneficiaryName || sender.name}
              </p>
              {payment.iban && (
                <p className="font-mono text-slate-900 font-semibold text-[11px]">
                  {t.iban}: {payment.iban}
                </p>
              )}
              {payment.bic && (
                <p className="font-mono text-slate-700 text-[11px]">{t.bic}: {payment.bic}</p>
              )}
              {payment.bankName && <p className="text-slate-600">{t.bank}: {payment.bankName}</p>}
              <p className="text-[10px] text-slate-500 italic mt-0.5">
                {t.scanEpcHint}
              </p>
            </>
          )}

          {payment.method === 'revolut' && (
            <>
              <p className="text-slate-700">
                <span className="font-semibold text-slate-900">Revolut:</span> @
                {payment.revolutTag?.replace(/^@/, '')}
              </p>
              <p className="text-[11px] text-blue-600 font-mono">
                https://revolut.me/{payment.revolutTag?.replace(/^@/, '')}
              </p>
              <p className="text-[10px] text-slate-500 italic">
                {t.scanRevolutHint}
              </p>
            </>
          )}

          {payment.method === 'stripe' && (
            <>
              <p className="text-slate-700 font-semibold">Stripe Checkout:</p>
              <p className="text-[11px] text-blue-600 font-mono truncate">
                {payment.stripePaymentLink || 'Payment Link'}
              </p>
              <p className="text-[10px] text-slate-500 italic">
                {t.scanStripeHint}
              </p>
            </>
          )}

          {payment.method === 'ton' && (
            <>
              <p className="text-slate-700 font-semibold">TON Address:</p>
              <p className="text-[10px] text-slate-900 font-mono truncate">{payment.tonAddress}</p>
              <p className="text-[10px] text-slate-500 italic">
                {t.scanTonHint}
              </p>
            </>
          )}

          {payment.method === 'custom' && (
            <p className="text-slate-700 whitespace-pre-line">{payment.customInstructions}</p>
          )}
        </div>
      </div>

      {/* Exchange Rate Reference Note */}
      {currentInvoice.exchangeRateNote && (
        <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-700 font-medium mb-3">
          <span className="font-bold">{t.exchangeRate}:</span> {currentInvoice.exchangeRateNote}
        </div>
      )}

      {/* Tax Exemption Notice */}
      {currentInvoice.isTaxExempt && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 italic mb-4">
          {currentInvoice.taxExemptReason ||
            'VAT reverse-charged pursuant to Article 196 of EU VAT Directive 2006/112/EC.'}
        </div>
      )}

      {/* Customer Notes & Authorized Signature */}
      <div className="pt-3 border-t border-slate-100 flex items-start justify-between gap-4 text-[10px] text-slate-500">
        <div className="space-y-1 flex-1">
          {currentInvoice.notes && (
            <p><span className="font-bold text-slate-600">{t.notes}:</span> {currentInvoice.notes}</p>
          )}
          {currentInvoice.terms && (
            <p><span className="font-bold text-slate-600">{t.terms}:</span> {currentInvoice.terms}</p>
          )}
        </div>

        {currentInvoice.includeSignature && sender.signatureUrl && (
          <div className="flex flex-col items-center shrink-0">
            <img src={sender.signatureUrl} alt="Signature" className="h-10 max-w-28 object-contain mb-0.5" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              {t.signature}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
