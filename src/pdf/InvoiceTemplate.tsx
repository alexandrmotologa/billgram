import React from 'react';
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import type { Invoice, InvoiceCalculations } from '../types/invoice';
import { formatCurrency, calculateLineItemTotal } from '../lib/currency';
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

  return (
    <Document title={`Invoice_${invoice.number}`} author={sender.name}>
      <Page size="A4" style={pdfStyles.page}>
        {/* Top Header */}
        <View style={[pdfStyles.headerRow, { borderBottomColor: accentColor }]}>
          <View style={pdfStyles.logoContainer}>
            {sender.logoUrl ? (
              <Image src={sender.logoUrl} style={pdfStyles.logo} />
            ) : (
              <Text style={[pdfStyles.partyName, { fontSize: 16, color: accentColor }]}>
                {sender.name}
              </Text>
            )}
          </View>

          <View style={pdfStyles.invoiceTitleBlock}>
            <Text style={[pdfStyles.invoiceTitle, { color: accentColor }]}>INVOICE</Text>
            <Text style={pdfStyles.invoiceNumber}>#{invoice.number}</Text>
          </View>
        </View>

        {/* Parties (Sender / Recipient) */}
        <View style={pdfStyles.partiesContainer}>
          {/* Billed By */}
          <View style={pdfStyles.partyColumn}>
            <Text style={pdfStyles.partyLabel}>BILLED BY</Text>
            <Text style={pdfStyles.partyName}>{sender.name}</Text>
            {sender.taxId ? (
              <Text style={pdfStyles.partyText}>Tax / VAT ID: {sender.taxId}</Text>
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
            <Text style={pdfStyles.partyLabel}>BILLED TO</Text>
            <Text style={pdfStyles.partyName}>
              {client.name || 'Client Name / Company'}
            </Text>
            {client.taxId ? (
              <Text style={pdfStyles.partyText}>Tax / VAT ID: {client.taxId}</Text>
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
        <View style={pdfStyles.metaGrid}>
          <View style={pdfStyles.metaItem}>
            <Text style={pdfStyles.metaLabel}>ISSUE DATE</Text>
            <Text style={pdfStyles.metaValue}>{invoice.issueDate}</Text>
          </View>
          <View style={pdfStyles.metaItem}>
            <Text style={pdfStyles.metaLabel}>DUE DATE</Text>
            <Text style={pdfStyles.metaValue}>{invoice.dueDate}</Text>
          </View>
          <View style={pdfStyles.metaItem}>
            <Text style={pdfStyles.metaLabel}>CURRENCY</Text>
            <Text style={pdfStyles.metaValue}>{invoice.currency}</Text>
          </View>
          <View style={pdfStyles.metaItem}>
            <Text style={pdfStyles.metaLabel}>STATUS</Text>
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
        <View style={pdfStyles.table}>
          <View style={[pdfStyles.tableHeader, { borderBottomColor: accentColor }]}>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colDesc]}>DESCRIPTION</Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colQty]}>QTY</Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colPrice]}>UNIT PRICE</Text>
            <Text style={[pdfStyles.tableHeaderCell, pdfStyles.colTotal]}>AMOUNT</Text>
          </View>

          {invoice.items.map((item, index) => {
            const itemTotal = calculateLineItemTotal(item);
            return (
              <View key={item.id || index} style={pdfStyles.tableRow}>
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
        <View style={pdfStyles.summaryRow}>
          <View style={pdfStyles.totalsBox}>
            <View style={pdfStyles.totalLine}>
              <Text style={pdfStyles.totalLabel}>Subtotal</Text>
              <Text style={pdfStyles.totalValue}>
                {formatCurrency(totals.subtotal, invoice.currency)}
              </Text>
            </View>

            {totals.discountTotal > 0 && (
              <View style={pdfStyles.totalLine}>
                <Text style={pdfStyles.totalLabel}>Total Discount</Text>
                <Text style={[pdfStyles.totalValue, { color: '#dc2626' }]}>
                  -{formatCurrency(totals.discountTotal, invoice.currency)}
                </Text>
              </View>
            )}

            <View style={pdfStyles.totalLine}>
              <Text style={pdfStyles.totalLabel}>
                {invoice.isTaxExempt ? 'VAT / Tax (Exempt)' : `VAT / Tax (${invoice.taxRate}%)`}
              </Text>
              <Text style={pdfStyles.totalValue}>
                {formatCurrency(totals.taxAmount, invoice.currency)}
              </Text>
            </View>

            <View style={[pdfStyles.grandTotalLine, { borderTopColor: accentColor }]}>
              <Text style={[pdfStyles.grandTotalLabel, { color: accentColor }]}>
                TOTAL DUE
              </Text>
              <Text style={[pdfStyles.grandTotalValue, { color: accentColor }]}>
                {formatCurrency(totals.total, invoice.currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment & QR Section */}
        <View style={pdfStyles.paymentBox}>
          {qrDataUrl ? (
            <View style={pdfStyles.qrContainer}>
              <Image src={qrDataUrl} style={pdfStyles.qrImage} />
            </View>
          ) : null}

          <View style={pdfStyles.paymentDetailsCol}>
            <Text style={[pdfStyles.paymentMethodTitle, { color: accentColor }]}>
              PAYMENT DETAILS & BANK TRANSFER
            </Text>

            {payment.method === 'sepa' && (
              <>
                <View style={pdfStyles.paymentItemRow}>
                  <Text style={pdfStyles.paymentItemLabel}>Beneficiary:</Text>
                  <Text style={pdfStyles.paymentItemValue}>
                    {payment.beneficiaryName || sender.name}
                  </Text>
                </View>
                {payment.iban && (
                  <View style={pdfStyles.paymentItemRow}>
                    <Text style={pdfStyles.paymentItemLabel}>IBAN:</Text>
                    <Text style={[pdfStyles.paymentItemValue, { fontFamily: 'Helvetica-Bold' }]}>
                      {payment.iban}
                    </Text>
                  </View>
                )}
                {payment.bic && (
                  <View style={pdfStyles.paymentItemRow}>
                    <Text style={pdfStyles.paymentItemLabel}>BIC / SWIFT:</Text>
                    <Text style={pdfStyles.paymentItemValue}>{payment.bic}</Text>
                  </View>
                )}
                {payment.bankName && (
                  <View style={pdfStyles.paymentItemRow}>
                    <Text style={pdfStyles.paymentItemLabel}>Bank:</Text>
                    <Text style={pdfStyles.paymentItemValue}>{payment.bankName}</Text>
                  </View>
                )}
                <View style={pdfStyles.paymentItemRow}>
                  <Text style={pdfStyles.paymentItemLabel}>Reference:</Text>
                  <Text style={pdfStyles.paymentItemValue}>
                    {payment.referenceText || `Invoice ${invoice.number}`}
                  </Text>
                </View>
                {qrDataUrl && (
                  <Text style={pdfStyles.qrScanHint}>
                    Scan the EPC QR code with your mobile banking app to autofill payment.
                  </Text>
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
                  <Text style={pdfStyles.qrScanHint}>
                    Scan the QR code to open Revolut instant transfer.
                  </Text>
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
                  <Text style={pdfStyles.qrScanHint}>
                    Scan QR code with mobile camera to pay via credit card or Apple/Google Pay.
                  </Text>
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
                  <Text style={pdfStyles.qrScanHint}>
                    Scan QR code via Telegram Wallet or Tonkeeper to transfer funds.
                  </Text>
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

        {/* Notes & Terms Footer */}
        <View style={pdfStyles.notesSection}>
          {invoice.notes ? (
            <View style={{ marginBottom: 4 }}>
              <Text style={pdfStyles.notesTitle}>NOTES</Text>
              <Text style={pdfStyles.notesContent}>{invoice.notes}</Text>
            </View>
          ) : null}
          {invoice.terms ? (
            <View>
              <Text style={pdfStyles.notesTitle}>TERMS & CONDITIONS</Text>
              <Text style={pdfStyles.notesContent}>{invoice.terms}</Text>
            </View>
          ) : null}
        </View>

        <Text style={pdfStyles.footerDisclaimer}>
          Generated with BillGram Client-Side Invoicing • billgram.app
        </Text>
      </Page>
    </Document>
  );
};
