import React, { useEffect, useState } from 'react';
import { useInvoiceStore } from '../../store/invoiceStore';
import { calculateInvoiceTotals, calculateLineItemTotal, formatCurrency } from '../../lib/currency';
import { getPaymentQrPayload, generateQrDataUrl } from '../../lib/epc_qr';

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
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-6 md:p-8 text-slate-900 font-sans max-w-2xl mx-auto my-2 transition-all">
      {/* Top Header */}
      <div
        className="flex items-start justify-between pb-6 mb-6 border-b-2"
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
            INVOICE
          </span>
          <span className="text-xs font-mono font-bold text-slate-500">
            #{currentInvoice.number}
          </span>
        </div>
      </div>

      {/* Parties Block */}
      <div className="grid grid-cols-2 gap-6 mb-6 text-xs">
        {/* From */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Billed By
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
            Billed To
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
      <div className="grid grid-cols-4 gap-2 bg-slate-50 border border-slate-200/90 rounded-lg p-2.5 mb-6 text-center">
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Issue Date</span>
          <span className="text-xs font-semibold text-slate-800">{currentInvoice.issueDate}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Due Date</span>
          <span className="text-xs font-semibold text-slate-800">{currentInvoice.dueDate}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Currency</span>
          <span className="text-xs font-semibold text-slate-800">{currentInvoice.currency}</span>
        </div>
        <div>
          <span className="text-[9px] font-bold text-slate-400 uppercase block">Status</span>
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
      <div className="mb-6 overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr
              className="border-b-2 text-left text-[10px] uppercase font-bold text-slate-700 tracking-wider"
              style={{ borderColor: accentColor }}
            >
              <th className="py-2 pr-2">Description</th>
              <th className="py-2 px-2 text-right">Qty</th>
              <th className="py-2 px-2 text-right">Unit Price</th>
              <th className="py-2 pl-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentInvoice.items.map((item, index) => {
              const lineTotal = calculateLineItemTotal(item);
              return (
                <tr key={item.id || index} className="text-slate-800">
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
      <div className="flex justify-end mb-6 text-xs">
        <div className="w-56 space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(totals.subtotal, currentInvoice.currency)}</span>
          </div>

          {totals.discountTotal > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Total Discount</span>
              <span>-{formatCurrency(totals.discountTotal, currentInvoice.currency)}</span>
            </div>
          )}

          <div className="flex justify-between text-slate-600">
            <span>
              {currentInvoice.isTaxExempt ? 'VAT / Tax (Exempt)' : `VAT (${currentInvoice.taxRate}%)`}
            </span>
            <span>{formatCurrency(totals.taxAmount, currentInvoice.currency)}</span>
          </div>

          <div
            className="flex justify-between pt-2 border-t-2 font-black text-sm text-slate-900"
            style={{ borderColor: accentColor }}
          >
            <span>TOTAL DUE</span>
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
            Payment Instructions
          </span>

          {payment.method === 'sepa' && (
            <>
              <p className="text-slate-700">
                <span className="font-semibold text-slate-900">Beneficiary:</span>{' '}
                {payment.beneficiaryName || sender.name}
              </p>
              {payment.iban && (
                <p className="font-mono text-slate-900 font-semibold text-[11px]">
                  IBAN: {payment.iban}
                </p>
              )}
              {payment.bic && (
                <p className="font-mono text-slate-700 text-[11px]">BIC: {payment.bic}</p>
              )}
              {payment.bankName && <p className="text-slate-600">Bank: {payment.bankName}</p>}
              <p className="text-[10px] text-slate-500 italic mt-0.5">
                Scan EPC QR with any European banking app to autofill payment.
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
                Scan QR code to open Revolut instant transfer.
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
                Scan QR code to pay via card, Apple Pay, or Google Pay.
              </p>
            </>
          )}

          {payment.method === 'ton' && (
            <>
              <p className="text-slate-700 font-semibold">TON Address:</p>
              <p className="text-[10px] text-slate-900 font-mono truncate">{payment.tonAddress}</p>
              <p className="text-[10px] text-slate-500 italic">
                Scan QR code via Telegram Wallet or Tonkeeper.
              </p>
            </>
          )}

          {payment.method === 'custom' && (
            <p className="text-slate-700 whitespace-pre-line">{payment.customInstructions}</p>
          )}
        </div>
      </div>

      {/* Tax Exemption Notice */}
      {currentInvoice.isTaxExempt && (
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-600 italic mb-4">
          {currentInvoice.taxExemptReason ||
            'VAT reverse-charged pursuant to Article 196 of EU VAT Directive 2006/112/EC.'}
        </div>
      )}

      {/* Customer Notes */}
      {(currentInvoice.notes || currentInvoice.terms) && (
        <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500 space-y-1">
          {currentInvoice.notes && <p><span className="font-bold text-slate-600">Notes:</span> {currentInvoice.notes}</p>}
          {currentInvoice.terms && <p><span className="font-bold text-slate-600">Terms:</span> {currentInvoice.terms}</p>}
        </div>
      )}
    </div>
  );
};
