# User Guide

This guide walks through creating an invoice, managing clients, and sending payment details with BillGram.

## Initial setup

When you launch BillGram for the first time, navigate to the **Settings** tab:

1. **Business details**: Enter your legal name or company name, business address, and tax registration number (CIF, VAT, or local registration code).
2. **Payment accounts**: Add your primary bank IBAN and BIC/SWIFT. You can also add your Revolut RevTag or a Stripe payment link.
3. **Branding**: Upload your company logo and select your preferred accent color.
4. Tap **Save Profile**. Your profile syncs to your Telegram CloudStorage and will automatically pre-fill on every new invoice.

## Creating an invoice in under 30 seconds

1. Open the **New Invoice** tab.
2. **Client details**: Type the client's name. If you have invoiced this client before, tap the autocomplete recommendation to fill their address, email, and tax ID automatically.
3. **Invoice metadata**: The invoice number increments automatically (e.g., `INV-2026-001`). Select the issue date and due date, or use the quick buttons (`Due on receipt`, `Net 14`, `Net 30`).
4. **Line items**: Enter item descriptions, quantities, and rates. The subtotal, tax amount, and total update in real time.
5. **Tax and currency**: Select the billing currency (`EUR`, `USD`, `GBP`, `RON`, `MDL`, `CHF`). Set your VAT or sales tax percentage, or enable the `Tax Exempt / Reverse Charge` toggle if invoicing international B2B clients.
6. **Payment method**: Choose which QR code to embed on the invoice (`SEPA EPC QR`, `Revolut`, or `Stripe / Crypto`).

## Previewing and exporting

Tap **Preview Invoice** to view the live rendering. From here, you have three options:

- **Download PDF**: Saves the generated vector PDF file directly to your device storage.
- **Share**: Opens the device share sheet to send the PDF file through Telegram chat, WhatsApp, or email.
- **Copy Payment Reminder**: Generates a polite, ready-to-paste markdown message containing the invoice number, due date, amount, and payment link.

## Managing past invoices

The **Dashboard** tab lists your created invoices:

- **Filters**: Quickly filter between `All`, `Draft`, `Sent`, `Paid`, and `Overdue`.
- **Status toggles**: Tap on an invoice status badge to advance it from `Sent` to `Paid`.
- **Duplicate**: Create a new invoice draft based on an existing one with one click.
- **Metrics**: Track your total invoiced sum, paid volume, and outstanding balances.
