# Payment QR Code Specifications

BillGram generates standard payment QR codes directly into invoices. This allows clients to scan the code from their mobile banking apps or cameras and complete payment without manually typing long IBAN numbers or transfer details.

## 1. European EPC QR code (SEPA Credit Transfer)

The European Payments Council defines the standard for quick-response codes in SEPA transfers (document EPC069-12).

### Payload structure

The raw string payload contains 12 line-separated fields using carriage return or newline characters:

```
BCD
002
1
SCT
[BIC]
[Beneficiary Name]
[IBAN]
EUR[Amount]
[Purpose Code]
[Structured Reference]
[Unstructured Reference]
[Beneficiary to Originator Info]
```

### Field definitions

| Line | Field name | Required | Format / Constraints | Example |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Service Tag | Yes | Fixed value `BCD` | `BCD` |
| 2 | Version | Yes | Fixed value `002` | `002` |
| 3 | Character Set | Yes | `1` (UTF-8) | `1` |
| 4 | Identification | Yes | Fixed value `SCT` (SEPA Credit Transfer) | `SCT` |
| 5 | BIC | Optional/Yes | 8 or 11 alphanumeric characters | `BTRLRO22` |
| 6 | Name | Yes | Up to 70 characters | `Alexandr Motologa` |
| 7 | IBAN | Yes | Up to 34 characters without spaces | `RO49BTRL0000000000000000` |
| 8 | Amount | Optional | Currency prefix followed by decimal amount (up to 12 digits, 2 decimals) | `EUR1250.00` |
| 9 | Purpose Code | Optional | 4 character code (e.g., `CHAR`, `GDDS`, `SCVE`) | `GDDS` |
| 10 | Structured Ref | Optional | Up to 35 characters (ISO 11649 RF Creditor Reference) | `` |
| 11 | Unstructured Ref | Optional | Up to 140 characters, often the invoice number | `Invoice INV-2026-001` |
| 12 | Beneficiary Info | Optional | Up to 70 characters | `BillGram Transfer` |

### Validation rules

- IBANs are stripped of spaces and converted to uppercase.
- Amounts in EPC QR codes are strictly in EUR. If the invoice currency is not EUR, BillGram provides an alert or falls back to an alternative payment QR code format.
- Beneficiary names longer than 70 characters are truncated to maintain compliance.

## 2. Revolut RevTag deep link

For peer-to-peer Revolut transfers, BillGram encodes a direct URL:

```
https://revolut.me/{revtag}
```

When scanned by a mobile camera or opened in a mobile browser, this deep link opens the Revolut application directly to the transfer screen.

## 3. Stripe payment links

For credit card payments via Stripe, BillGram accepts custom Stripe payment links:

```
https://buy.stripe.com/{link_id}
```

## 4. The Open Network (TON) / Cryptocurrency

For freelancers accepting payments via Telegram's native ecosystem or crypto wallets, BillGram encodes standard TON transfer URIs:

```
ton://transfer/{address}?amount={nanotons}&text={reference}
```

Where:
- `{address}` is the bounceable or non-bounceable user wallet address.
- `{amount}` is the payment value in nanotons (1 TON = 1,000,000,000 nanotons).
- `{text}` is the URL-encoded invoice reference.
