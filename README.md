# BillGram

BillGram is a client-side invoicing Telegram Mini App for freelancers, contractors, and independent consultants. It creates professional PDF invoices with embedded European SEPA/EPC QR codes and digital payment links in under 30 seconds directly on mobile or desktop devices.

All computations, QR code encoding, and PDF layout calculations run locally in the browser. Financial data never touches external servers or third-party tracking services.

<p align="center">
  <img src="docs/images/billgram_demo.gif" alt="BillGram Demo" width="400" />
</p>

## Highlights

- **30-second workflow**: Pre-fills your saved business profile and recent clients so you only enter line items.
- **SEPA / EPC QR standard**: Generates standard European Banking Council QR codes (EPC069-12 / BCD) that European banking apps scan to autofill payment details.
- **Alternative payment QR codes**: Also supports Revolut RevTag, Stripe links, and TON/crypto wallet addresses.
- **Swiss typography**: High-contrast, clean monochrome layout with customizable brand accent colors.
- **Client directory**: Remembers previous clients and autofills their addresses, tax IDs, and billing emails.
- **Zero-cloud privacy**: Invoices and settings stay inside Telegram CloudStorage and browser local storage.
- **Native Telegram integration**: Supports Telegram haptic feedback, theme color variables, MainButton, and chat reminder generation.

## Supported payment standards

| Payment method | Format / Standard | Use case |
| :--- | :--- | :--- |
| **SEPA EPC QR** | EPC069-12 (BCD 002 SCT) | Eurozone bank transfers scanned directly by banking apps |
| **Revolut** | `https://revolut.me/{tag}` | Instant peer-to-peer Revolut transfers |
| **Stripe** | `https://buy.stripe.com/{id}` | Credit cards, Apple Pay, Google Pay |
| **TON / USDT** | `ton://transfer/{address}` | Telegram native wallet and TON blockchain transfers |

## Technical architecture

BillGram is built with React 19, TypeScript, and Tailwind CSS.

- **Frontend framework**: React 19 with Vite 8.
- **Styling**: Tailwind CSS v4.
- **State management**: Zustand with persistence middleware.
- **Telegram SDK**: `@telegram-apps/sdk-react` and native Telegram WebApp bridges.
- **Storage layer**: Dual storage adapter using `Telegram.WebApp.CloudStorage` with fallback to `localStorage`.
- **PDF generation**: `@react-pdf/renderer` compiling vector PDF documents in browser memory.
- **QR generation**: `qrcode` generating high-resolution data URLs and vector SVG matrices.

## Quick start

### Prerequisites

- Node.js 20 or later
- npm or pnpm

### Development

```bash
# Clone the repository
git clone https://github.com/alexandrmotologa/billgram.git
cd billgram

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production build

```bash
# Compile TypeScript and build production bundle
npm run build

# Preview build locally
npm run preview
```

## Telegram Mini App setup

To run BillGram inside Telegram:

1. Open Telegram and message `@BotFather`.
2. Create a bot using `/newbot`.
3. Create a Mini App using `/newapp`, select your bot, and enter your deployed URL (e.g., Vercel or Cloudflare Pages).
4. Launch the app from the bot profile or inline attachment menu.

## License

MIT License. See [LICENSE](LICENSE) for details.
