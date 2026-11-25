# Receive Payment UI Refinements

**Date:** 2026-09-30  
**Scope:** Frontend refinements to the existing Receive Payment page.

This note records the screenshot-driven UI and loading changes made to the Receive Payment page. The implementation context and the governing Core and Collections specifications were reviewed before continuing this work.

## Changes made

### Layout and icons

- Refined the Customer, Amount Received, Payment Method, Apply Payment to Open Balances, and Payment Summary cards to follow the supplied references.
- Adjusted the right-side Payment Summary text placement, remarks card spacing, and footer button positions.
- Kept the cards responsive so the summary and actions stack at narrower widths.
- Used `human.svg` for the customer heading, `card.svg` for Payment Method, `Customer-ledger-svg.svg` for Apply Payment to Open Balances, `message.svg` for Remarks & Attachments, and `calculator.svg` for Payment Summary. The existing cash-hand artwork remains in the page heading and Amount Received section.
- Added `web/src/assets/svg/Customer-ledger-svg.svg` for the open-balances heading.

### Validation feedback

- On receipt preview or posting, invalid fields are marked directly with a red border and background, including customer, receipt date, received amount, tender method, cash account, tender reference and amount, and application amount.
- Validation messages now identify the missing or invalid value instead of relying only on a generic error banner.

### Bootstrap and loading

- Removed the hard-coded customer, account, and invoice examples and the prefilled sample payment allocations. The form uses data returned by the existing bootstrap endpoint.
- Added a responsive skeleton for the page while bootstrap data is loading. Cached bootstrap data can display immediately while the page refreshes it from the API.
- Added a bootstrap request timeout and a Retry action for loading failures.
- If loading fails without cached data, the page shows an unavailable state rather than an empty payment form.

## Files

- `web/src/pages/collections/receive-payment/ReceivePaymentPage.tsx`
- `web/src/pages/collections/receive-payment/receive-payment.css`
- `web/src/assets/svg/Customer-ledger-svg.svg`

## Boundaries and checks

- These refinements did not change backend routes, API contracts, database schema, or backend files.
- Final page state contains no hard-coded sample customer, invoice, or payment values.
- `git diff --check` passed. A frontend build and browser visual check were not run for these refinements.
