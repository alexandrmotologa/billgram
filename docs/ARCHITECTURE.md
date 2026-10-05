# Architecture and System Design

BillGram runs entirely on the client side inside the Telegram WebApp environment. This document outlines the component structure, state management flow, persistence layer, and PDF rendering pipeline.

## System overview

The application consists of four primary subsystems:

1. **Form input and reactive calculations**: Manages client data, items, tax rules, and discounts with live currency formatting.
2. **State store and persistence**: Zustand store linked with a dual-layer storage adapter for Telegram CloudStorage and browser local storage.
3. **QR payment generator**: Encodes EPC SEPA banking standards and deep-link payment schemes into scannable QR matrices.
4. **Document rendering engine**: Renders an interactive preview canvas in the DOM and exports vector PDF documents using `@react-pdf/renderer`.

```
                    User Interaction
                           │
                           ▼
               ┌───────────────────────┐
               │    Zustand Store      │
               │  - active invoice     │
               │  - business profile   │
               │  - client directory   │
               │  - history log        │
               └───────────┬───────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
  ┌───────────────────┐         ┌───────────────────┐
  │  Storage Adapter  │         │   QR Generator    │
  │ - Telegram Cloud  │         │ - EPC (SEPA)      │
  │ - LocalStorage    │         │ - Revolut / Links │
  └───────────────────┘         └─────────┬─────────┘
                                          │
                                          ▼
                                ┌───────────────────┐
                                │   Render Engine   │
                                │ - HTML Canvas     │
                                │ - React-PDF       │
                                └─────────┬─────────┘
                                          │
                                          ▼
                                ┌───────────────────┐
                                │ Output Targets    │
                                │ - PDF Download    │
                                │ - Share Sheet     │
                                │ - Chat Reminder   │
                                └───────────────────┘
```

## State management

The application state is centralized in `src/store/invoiceStore.ts` using Zustand. The store separates volatile draft state from persistent records:

- **Draft invoice state**: Holds the currently edited invoice, line items, selected currency, tax settings, and payment details.
- **Business profile**: Contains the freelancer's legal business name, address, tax identification number, default bank account details, and optional base64 logo.
- **Client directory**: Caches client entries from previous invoices to provide instant autocomplete when typing a client name.
- **Invoice repository**: Stores historical invoices with status markers (`draft`, `sent`, `paid`, `overdue`).

### Data synchronization

State changes serialize to JSON and save via `src/store/storageAdapter.ts`.

The adapter checks for `window.Telegram?.WebApp?.CloudStorage`. When available, items sync to Telegram's cloud key-value store, enabling seamless access across mobile phones, tablets, and desktop Telegram clients. When running in a standard web browser outside Telegram, the adapter seamlessly falls back to `window.localStorage`.

## Payment QR generation

Payment QR codes are generated dynamically in browser memory:

- For European SEPA payments, the app formats the payment payload strictly according to the European Payments Council document EPC069-12. The text payload includes the service tag `BCD`, version `002`, character set `1`, identification `SCT`, beneficiary BIC, beneficiary name, IBAN, formatted EUR amount, purpose code, and reference text.
- For Revolut, the payload builds a direct payment URL (`https://revolut.me/{tag}`).
- For Stripe, the payload points to a custom payment link.
- For cryptocurrency payments, the payload formats a TON URI (`ton://transfer/{address}?amount={nanotons}&text={reference}`).

The resulting string transforms into a data URL through the `qrcode` library at a high pixel density (error correction level M or Q) for reliable scanning by banking apps.

## PDF generation pipeline

The PDF compilation relies on `@react-pdf/renderer`:

1. The data model and generated QR data URL pass into `<InvoiceTemplate />`.
2. The template applies a Swiss graphic design layout: strict grid lines, asymmetric margins, clean sans-serif typography, tabular alignment of figures, and high visual contrast.
3. The component compiles into a `Blob` in memory through `@react-pdf/renderer`'s `pdf()` function.
4. The generated blob can be directly downloaded, previewed via an object URL, or shared through the Web Share API (`navigator.share`).
