import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import type { Invoice, InvoiceCalculations } from '../types/invoice';
import { formatCurrency, calculateLineItemTotal } from '../lib/currency';
import { getTranslations } from '../lib/translations';
import { pdfStyles } from './styles';

interface InvoiceTemplateProps {
  invoice: Invoice;
  totals: InvoiceCalculations;
  qrDataUrl?: string;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({
  invoice,
  totals,
  qrDataUrl,
}) => {
  const { sender, client, payment } = invoice;
  const accentColor = sender.accentColor || '#0f172a';
  const t = getTranslations(invoice.language || 'en');
  const layout = invoice.templateLayout || 'swiss';

  const isExecutive = layout === 'executive';
  const isCompact = layout === 'compact';

  const pagePadding = isCompact ? 24 : 36;

  return (
    <Document title={`Invoice_${invoice.number}`} author={sender.name}>
      <Page size="A4" style={[pdfStyles.page, { padding: pagePadding }]}>
        {/* Header Block */}
        {isExecutive ? (
          // Executive layout: solid top accent bar with white text
          <View
            style={{
              backgroundColor: accentColor,
              padding: 16,
              borderRadius: 4,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <View>
              {sender.logoUrl ? (
                <Image src={sender.logoUrl} style={{ width: 100, height: 36, objectFit: 'contain' }} />
              ) : (
                <Text style={{ fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#ffffff' }}>
                  {sender.name}
                </Text>
              )}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#ffffff' }}>
                {t.invoiceTitle}
              </Text>
              <Text style={{ fontSize: 11, color: '#e2e8f0', marginTop: 2 }}>
                #{invoice.number}
              </Text>
            </View>
          </View>
        ) : (
          // Swiss and Compact layout
          <View
            style={[
              pdfStyles.headerRow,
              {
                borderBottomColor: accentColor,
                marginBottom: isCompact ? 16 : 28,
                paddingBottom: isCompact ? 10 : 16,
              },
            ]}
          >
            <View style={pdfStyles.logoContainer}>
              {sender.logoUrl ? (
                <Image src={sender.logoUrl} style={pdfStyles.logo} />
              ) : (
                <Text style={[pdfStyles.partyName, { fontSize: isCompact ? 14 : 16, color: accentColor }]}>
                  {sender.name}
                </Text>
              )}
            </View>

            <View style={pdfStyles.invoiceTitleBlock}>
              <Text style={[pdfStyles.invoiceTitle, { color: accentColor, fontSize: isCompact ? 18 : 22 }]}>
                {t.invoiceTitle}
              </Text>
              <Text style={pdfStyles.invoiceNumber}>#{invoice.number}</Text>
            </View>
          </View>
        )}

        {/* Parties (Sender / Recipient) */}
        <View style={[pdfStyles.partiesContainer, { marginBottom: isCompact ? 14 : 24 }]}>
          {/* Billed By */}
          <View style={pdfStyles.partyColumn}>
            <Text style={pdfStyles.partyLabel}>{t.billedBy}</Text>
            <Text style={pdfStyles.partyName}>{sender.name}</Text>
            {sender.taxId ? (
              <Text style={pdfStyles.partyText}>Tax / VAT: {sender.taxId}</Text>
            ) : null}
            {sender.address ? (
              <Text style={pdfStyles.partyText}>{sender.address}</Text>
            ) : null}
            {sender.email ? (
              <Text style={pdfStyles.partyText}>{sender.email}</Text>
            ) : null}
            {sender.phone ? (
              <Text style={pdfStyles.partyText}>{sender.phone}</Text>
            ) : null}
          </View>

          {/* Billed To */}
          <View style={pdfStyles.partyColumn}>
            <Text style={pdfStyles.partyLabel}>{t.billedTo}</Text>
            <Text style={pdfStyles.partyName}>
              {client.name || 'Client Name / Company'}
            </Text>
            {client.taxId ? (
              <Text style={pdfStyles.partyText}>Tax / VAT: {client.taxId}</Text>
            ) : null}
            {client.address ? (
              <Text style={pdfStyles.partyText}>{client.address}</Text>
            ) : null}
            {client.email ? (
              <Text style={pdfStyles.partyText}>{client.email}</Text>
            ) : null}
            {client.phone ? (
              <Text style={pdfStyles.partyText}>{client.phone}</Text>
            ) : null}
          </View>
        </View>

        {/* Metadata Grid (Dates & Status) */}
        <View style={[pdfStyles.metaGrid, { marginBottom: isCompact ? 12 : 20, padding: isCompact ? 6 : 8 }]}>
          <View style={pdfStyles.metaItem}>
            <Text style={pdfStyles.metaLabel}>{t.issueDate}</Text>
            <Text style={pdfStyles.metaValue}>{invoice.issueDate}</Text>
          </View>
          <View style={pdfStyles.metaItem}>
            <Text style={pdfStyles.metaLabel}>{t.dueDate}</Text>
            <Text style={pdfStyles.metaValue}>{invoice.dueDate}</Text>
          </View>
          <View style={pdfStyles.metaItem}>
            <Text style={pdfStyles.metaLabel}>{t.currency}</Text>
            <Text style={pdfStyles.metaValue}>{invoice.currency}</Text>
          </View>
          <View style={pdfStyles.metaItem}>
            <Text style={pdfStyles.metaLabel}>{t.status}</Text>
            <Text
              style={[
                pdfStyles.metaValue,
                {
                  textTransform: 'uppercase',
                  color:
                    invoice.status === 'paid'
                      ? '#16a34a'
                      : invoice.status === 'overdue'
                      ? '#dc2626'
                      : '#0f172a',
                },
              ]}
            >
              {invoice.status}
            </Text>
          </View>
        </View>

        {/* Line Items Table */}
        <View style={[pdfStyles.table, { marginBottom: isCompact ? 14 : 20 }]}>
          <View
            style={[
              pdfStyles.tableHeader,
              {
                borderBottomColor: accentColor,
                backgroundColor: isExecutive ? '#f8fafc' : 'transparent',
                paddingVertical: isCompact ? 3 : 5,
              },
            ]}
          >
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colDesc]}>{t.description}</Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colQty]}>{t.qty}</Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colPrice]}>{t.unitPrice}</Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colTotal]}>{t.amount}</Text>
          </View>

          {invoice.items.map((item, index) => {
            const itemTotal = calculateLineItemTotal(item);
            const isEven = index % 2 === 0;
            return (
              <View
                key={item.id || index}
                style={[
                  pdfStyles.tableRow,
                  {
                    backgroundColor: isExecutive && isEven ? '#fdfdfe' : 'transparent',
                    paddingVertical: isCompact ? 4 : 7,
                  },
                ]}
              >
                <View style={pdfStyles.colDesc}>
                  <Text style={pdfStyles.itemDescText}>
                    {item.description || 'Service / Product item'}
                  </Text>
                  {item.discountPercent && item.discountPercent > 0 ? (
                    <Text style={pdfStyles.itemSubText}>
                      Discount: {item.discountPercent}% applied
                    </Text>
                  ) : null}
                </View>
                <Text style={[pdfStyles.itemValText, pdfStyles.colQty]}>
                  {item.quantity} {item.unit !== 'units' ? item.unit : ''}
                </Text>
                <Text style={[pdfStyles.itemValText, pdfStyles.colPrice]}>
                  {formatCurrency(item.unitPrice, invoice.currency)}
                </Text>
                <Text
                  style={[
                    pdfStyles.itemValText,
                    pdfStyles.colTotal,
                    { fontFamily: 'Helvetica-Bold' },
                  ]}
                >
                  {formatCurrency(itemTotal, invoice.currency)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Financial Summary */}
        <View style={[pdfStyles.summaryRow, { marginBottom: isCompact ? 12 : 20 }]}>
          <View style={pdfStyles.totalsBox}>
            <View style={pdfStyles.totalLine}>
              <Text style={pdfStyles.totalLabel}>{t.subtotal}</Text>
              <Text style={pdfStyles.totalValue}>
                {formatCurrency(totals.subtotal, invoice.currency)}
              </Text>
            </View>

            {totals.discountTotal > 0 && (
              <View style={pdfStyles.totalLine}>
                <Text style={pdfStyles.totalLabel}>{t.discount}</Text>
                <Text style={[pdfStyles.totalValue, { color: '#dc2626' }]}>
                  -{formatCurrency(totals.discountTotal, invoice.currency)}
                </Text>
              </View>
            )}

            <View style={pdfStyles.totalLine}>
              <Text style={pdfStyles.totalLabel}>
                {invoice.isTaxExempt ? t.taxExempt : `${t.tax} (${invoice.taxRate}%)`}
              </Text>
              <Text style={pdfStyles.totalValue}>
                {formatCurrency(totals.taxAmount, invoice.currency)}
              </Text>
            </View>

            <View style={[pdfStyles.grandTotalLine, { borderTopColor: accentColor }]}>
              <Text style={[pdfStyles.grandTotalLabel, { color: accentColor }]}>
                {t.totalDue}
              </Text>
              <Text style={[pdfStyles.grandTotalValue, { color: accentColor }]}>
                {formatCurrency(totals.total, invoice.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment & QR Section */}
        <View
          style={[
            pdfStyles.paymentBox,
            {
              padding: isCompact ? 8 : 12,
              marginBottom: isCompact ? 10 : 16,
            },
          ]}
        >
          {qrDataUrl ? (
            <View style={[pdfStyles.qrContainer, { width: isCompact ? 72 : 86, height: isCompact ? 72 : 86 }]}>
              <Image src={qrDataUrl} style={{ width: isCompact ? 66 : 80, height: isCompact ? 66 : 80 }} />
            </View>
          ) : null}

          <View style={pdfStyles.paymentDetailsCol}>
            <Text style={[pdfStyles.paymentMethodTitle, { color: accentColor }]}>
              {t.paymentDetails}
            </Text>

            {payment.method === 'sepa' && (
              <>
                <View style={pdfStyles.paymentItemRow}>
                  <Text style={pdfStyles.paymentItemLabel}>{t.beneficiary}:</Text>
                  <Text style={pdfStyles.paymentItemValue}>
                    {payment.beneficiaryName || sender.name}
                  </Text>
                </View>
                {payment.iban && (
                  <View style={pdfStyles.paymentItemRow}>
                    <Text style={pdfStyles.paymentItemLabel}>{t.iban}:</Text>
                    <Text style={[pdfStyles.paymentItemValue, { fontFamily: 'Helvetica-Bold' }]}>
                      {payment.iban}
                    </Text>
                  </View>
                )}
                {payment.bic && (
                  <View style={pdfStyles.paymentItemRow}>
                    <Text style={pdfStyles.paymentItemLabel}>{t.bic}:</Text>
                    <Text style={pdfStyles.paymentItemValue}>{payment.bic}</Text>
                  </View>
                )}
                {payment.bankName && (
                  <View style={pdfStyles.paymentItemRow}>
                    <Text style={pdfStyles.paymentItemLabel}>{t.bank}:</Text>
                    <Text style={pdfStyles.paymentItemValue}>{payment.bankName}</Text>
                  </View>
                )}
                <View style={pdfStyles.paymentItemRow}>
                  <Text style={pdfStyles.paymentItemLabel}>{t.reference}:</Text>
                  <Text style={pdfStyles.paymentItemValue}>
                    {payment.referenceText || `Invoice ${invoice.number}`}
                  </Text>
                </View>
                {qrDataUrl && (
                  <Text style={pdfStyles.qrScanHint}>{t.scanEpcHint}</Text>
                )}
              </>
            )}

            {payment.method === 'revolut' && (
              <>
                <View style={pdfStyles.paymentItemRow}>
                  <Text style={pdfStyles.paymentItemLabel}>Revolut Tag:</Text>
                  <Text style={[pdfStyles.paymentItemValue, { fontFamily: 'Helvetica-Bold' }]}>
                    @{payment.revolutTag?.replace(/^@/, '')}
                  </Text>
                </View>
                <View style={pdfStyles.paymentItemRow}>
                  <Text style={pdfStyles.paymentItemLabel}>Direct Link:</Text>
                  <Text style={pdfStyles.paymentItemValue}>
                    https://revolut.me/{payment.revolutTag?.replace(/^@/, '')}
                  </Text>
                </View>
                {qrDataUrl && (
                  <Text style={pdfStyles.qrScanHint}>{t.scanRevolutHint}</Text>
                )}
              </>
            )}

            {payment.method === 'stripe' && (
              <>
                <View style={pdfStyles.paymentItemRow}>
                  <Text style={pdfStyles.paymentItemLabel}>Pay Online:</Text>
                  <Text style={pdfStyles.paymentItemValue}>
                    {payment.stripePaymentLink || 'Stripe Checkout Link'}
                  </Text>
                </View>
                {qrDataUrl && (
                  <Text style={pdfStyles.qrScanHint}>{t.scanStripeHint}</Text>
                )}
              </>
            )}

            {payment.method === 'ton' && (
              <>
                <View style={pdfStyles.paymentItemRow}>
                  <Text style={pdfStyles.paymentItemLabel}>TON Address:</Text>
                  <Text style={[pdfStyles.paymentItemValue, { fontFamily: 'Helvetica-Bold' }]}>
                    {payment.tonAddress}
                  </Text>
                </View>
                {qrDataUrl && (
                  <Text style={pdfStyles.qrScanHint}>{t.scanTonHint}</Text>
                )}
              </>
            )}

            {payment.method === 'custom' && (
              <Text style={pdfStyles.paymentItemValue}>
                {payment.customInstructions || 'Please transfer according to agreed terms.'}
              </Text>
            )}
          </View>
        </View>

        {/* Exchange Rate Reference Note */}
        {invoice.exchangeRateNote ? (
          <View
            style={{
              padding: 5,
              backgroundColor: '#f8fafc',
              borderWidth: 0.5,
              borderColor: '#cbd5e1',
              borderRadius: 4,
              marginBottom: 8,
            }}
          >
            <Text style={{ fontSize: 7.5, color: '#334155', fontFamily: 'Helvetica-Bold' }}>
              {t.exchangeRate}: {invoice.exchangeRateNote}
            </Text>
          </View>
        ) : null}

        {/* Legal & Reverse Charge Notice */}
        {invoice.isTaxExempt && (
          <View
            style={{
              padding: 6,
              backgroundColor: '#f8fafc',
              borderWidth: 0.5,
              borderColor: '#cbd5e1',
              borderRadius: 4,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 7.5, color: '#475569', fontStyle: 'italic' }}>
              {invoice.taxExemptReason ||
                'VAT reverse-charged pursuant to Article 196 of EU VAT Directive 2006/112/EC. Recipient liable for payment of VAT.'}
            </Text>
          </View>
        )}

        {/* Signature & Bottom Notes Footer */}
        <View style={pdfStyles.notesSection}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ width: invoice.includeSignature && sender.signatureUrl ? '65%' : '100%' }}>
              {invoice.notes ? (
                <View style={{ marginBottom: 4 }}>
                  <Text style={pdfStyles.notesTitle}>{t.notes}</Text>
                  <Text style={pdfStyles.notesContent}>{invoice.notes}</Text>
                </View>
              ) : null}
              {invoice.terms ? (
                <View>
                  <Text style={pdfStyles.notesTitle}>{t.terms}</Text>
                  <Text style={pdfStyles.notesContent}>{invoice.terms}</Text>
                </View>
              ) : null}
            </View>

            {/* Authorized Signature Block */}
            {invoice.includeSignature && sender.signatureUrl && (
              <View style={{ width: '30%', alignItems: 'center', paddingTop: 2 }}>
                <Image
                  src={sender.signatureUrl}
                  style={{ width: 85, height: 35, objectFit: 'contain', marginBottom: 2 }}
                />
                <Text style={{ fontSize: 7, fontFamily: 'Helvetica-Bold', color: '#64748b', textTransform: 'uppercase' }}>
                  {t.signature}
                </Text>
              </View>
            )}
          </View>
        </View>

        <Text style={pdfStyles.footerDisclaimer}>{t.footerWatermark}</Text>
      </Page>
    </Document>
  );
};
