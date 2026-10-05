import { StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    lineHeight: 1.4,
  },
  
  // Header section
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    borderBottomWidth: 1.5,
    borderBottomColor: '#0f172a',
    paddingBottom: 16,
  },
  logoContainer: {
    maxWidth: 120,
    maxHeight: 50,
  },
  logo: {
    width: 100,
    height: 40,
    objectFit: 'contain',
  },
  invoiceTitleBlock: {
    alignItems: 'flex-end',
  },
  invoiceTitle: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: -0.5,
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  invoiceNumber: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    marginTop: 2,
  },
  
  // Parties section (From / To)
  partiesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  partyColumn: {
    width: '46%',
  },
  partyLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  partyName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  partyText: {
    fontSize: 9,
    color: '#334155',
    marginBottom: 2,
  },

  // Dates & metadata bar
  metaGrid: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },

  // Table styles
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0f172a',
    paddingBottom: 6,
    paddingTop: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.75,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 7,
    alignItems: 'center',
  },
  colDesc: {
    width: '50%',
  },
  colQty: {
    width: '14%',
    textAlign: 'right',
  },
  colPrice: {
    width: '18%',
    textAlign: 'right',
  },
  colTotal: {
    width: '18%',
    textAlign: 'right',
  },
  itemDescText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },
  itemSubText: {
    fontSize: 7.5,
    color: '#64748b',
    marginTop: 1,
  },
  itemValText: {
    fontSize: 9,
    color: '#334155',
  },

  // Totals layout
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  totalsBox: {
    width: '45%',
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  totalLabel: {
    fontSize: 9,
    color: '#475569',
  },
  totalValue: {
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#0f172a',
  },
  grandTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1.5,
    borderTopColor: '#0f172a',
    paddingTop: 6,
    marginTop: 4,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    textTransform: 'uppercase',
  },
  grandTotalValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
  },

  // Payment Box & QR Code
  paymentBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#ffffff',
    marginBottom: 16,
    alignItems: 'center',
  },
  qrContainer: {
    width: 86,
    height: 86,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 2,
    backgroundColor: '#ffffff',
  },
  qrImage: {
    width: 80,
    height: 80,
  },
  paymentDetailsCol: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0f172a',
    marginBottom: 4,
  },
  paymentItemRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  paymentItemLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    width: 70,
  },
  paymentItemValue: {
    fontSize: 8.5,
    color: '#0f172a',
    flex: 1,
  },
  qrScanHint: {
    fontSize: 7.5,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Notes & Footer
  notesSection: {
    borderTopWidth: 0.75,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    marginTop: 'auto',
  },
  notesTitle: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  notesContent: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.3,
  },
  footerDisclaimer: {
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 10,
  },
});
