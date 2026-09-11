# 2026-09-11 — Cash & Credit Sales Entry Implementation & UI Refinements

## Objective
Implement and refine the SimpleBIZ One **Cash & Credit Sales Entry** screen according to visual design references, mockups, and `MDS-200 (Sales & Receivables Module Design Specification)`, adopting modular component architecture, reactive calculations, dual sales mode switcher, structured API payload generation, and seamless navigation from the Sales & Receivables landing page (`/sales`).

---

## Completed Features & Components

### 1. Dual Sales Mode Orchestration & Header (`components/SalesEntryHeader.tsx`)
- **Breadcrumb Navigation**: `Sales & Receivables > Sales Entry` with link back to `/sales`.
- **Artwork & Dynamic Titles**:
  - Cashier register artwork (`assets/icons/cashier.png`).
  - Dynamic headline: **"Cash Sale"** / **"Credit Sale"**.
  - Contextual subtitle describing cash payment or credit tracking.
- **Interactive Sales Mode Switcher**:
  - Top-aligned (`sm:items-start`) segmented pill switch (`[ Cash Sale | Credit Sale ]`).
  - URL query synchronization (`/sales/entry?mode=cash` and `/sales/entry?mode=credit`).
  - Automatic adaptation of customer default selection, payment terms, and receivable calculations.

### 2. Transaction Information Panel (`components/SalesInfoCard.tsx`)
- **Card Styling**: `rounded-lg` with `#63c4ed` border and `#d6effc` background.
- **Collapsible Section Header**: Info badge with smooth expansion/collapse toggle.
- **Fields**:
  - `Sales Date *`: Date picker field with calendar icon and `rounded-md` input.
  - `Sales No.`: Formatted transaction number (e.g. `SAL-001`).
  - `Salesperson`: Searchable Combobox selector populated with authorized sales staff.
  - `Branch`: Searchable Combobox selector (e.g. `Main - Cagayan de Oro`).

### 3. Customer & Credit Management Panel (`components/CustomerCard.tsx`)
- **Customer Selection & Autocomplete**:
  - Searchable dropdown with customer code and name filtering.
  - One-click clear selection button.
- **Live Customer Telemetry & Credit Info**:
  - Customer code, default terms badge (e.g., `Net 30`).
  - `Default Terms`, `Credit Limit` (e.g., `₱500,000.00`), and `Available Credit` (e.g., `₱320,000.00`).
  - **"View Details" Modal**: Complete customer profile, contact person, phone number, and billing address.
- **Header Icon**: Prominent `human.svg` (`size-7`).

### 4. Remarks & File Attachments Panel (`components/RemarksAttachmentsCard.tsx`)
- **Remarks Field**: Textarea with character counter (`0/500`) for delivery instructions and internal notes.
- **Attachment Upload Widget**: File picker supporting up to 10 MB per file, with attachment listing and one-click removal.
- **Header Icon**: Prominent `message.svg` (`size-7`).

### 5. Interactive Line Items & Services Table (`components/ItemsServicesCard.tsx`)
- **Comprehensive Line Item Table**:
  - Table headers: `#`, `Items / Services`, `Qty`, `Unit`, `Unit Price`, `Disc %`, `Tax`, `Amount`, `Actions`.
  - Sticky table header with custom cyan scrollbar (`max-h-[240px]`).
- **Empty State UI**:
  - Defaults to `[]` empty state with cart illustration, helpful guidance, and "+ Add First Item" CTA.
- **Live Interactive Controls**:
  - Direct quantity modification with instant subtotal and line amount recalculation.
  - Unit price overrides and line percentage discount adjustments.
  - Row deletion with trash can icon.
- **Catalog Quick-Add & Search**:
  - Pill-shaped `rounded-full` search input with `search.svg` icon and instant catalog autocomplete.
  - Quantity incrementing if item already exists in the transaction.
- **Barcode / SKU Scanning Modal**:
  - Dedicated scan dialog with SKU matcher and feedback.
- **Header Icon**: Prominent `cartbox.svg` (`size-7`).

### 6. Financial Summary Panel (`components/SalesSummaryCard.tsx`)
- **Automatic Calculations**:
  - `Total Before Discount`
  - `Less: Line Discounts`
  - `Subtotal`
  - `Add: VAT (12%)`
- **Cyan Highlight Banner**:
  - **`Total Amount`** in prominent bold font.
- **Header Icon**: Prominent `calculator.svg` (`size-7`).

### 7. Credit Terms Configuration (`components/TermsCreditCard.tsx`)
- **Fields**:
  - `Payment Terms *`: `Net 30`, `Net 15`, `Net 60`, `Due on Receipt`, `COD`.
  - `Due Date`: Date picker input synchronized with selected payment terms.
- **Header Icon**: Prominent `calendar.svg` (`size-7`).

### 8. Payment & Settlement Panel (`components/PaymentCard.tsx`)
- **Immediate Payment Toggle**: "Receive payment now" switch for credit sales.
- **Fields**:
  - `Payment Method *`: `Bank Transfer`, `Cash`, `GCash`, `Maya`, `Check`, `Credit Card`.
  - `Received In *`: Cash drawer and bank account routing (e.g. `BDO Operating Account`, `Petty Cash Fund`).
  - `Amount Received *`: Live input updating balance calculations.
- **Status & Settlement Feedback**:
  - Credit mode: Live helper text displaying remaining balance due.
  - Cash mode: Change due calculation or exact payment indicator.
- **Header Icon**: Prominent `card.svg` (`size-7`).

### 9. Standalone Total Breakdown Card (`components/SalesTotalBreakdownCard.tsx`)
- **Compact Cyan Summary Card**:
  - `Total Amount`
  - `Amount Received`
  - `Outstanding` (Credit Mode) / `Change` (Cash Mode)

### 10. Unified Bottom Action Buttons Row (`SalesEntryPage.tsx`)
- Extracted into a shared bottom grid row below both columns:
  - **Left Section (`lg:col-span-8`)**: Right-aligned `[ Cancel ]` and `[ Save as Draft ]`.
  - **Right Section (`lg:col-span-4`)**: Grid-aligned `[ Preview ]` and `[ Complete Sale ]`.
  - Ensures all 4 buttons align horizontally across the viewport.

### 11. Workflow Modals & Notifications
- **Invoice Preview Modal (`components/PreviewInvoiceModal.tsx`)**:
  - Formal print-ready invoice layout with print trigger.
- **Official Sales Receipt Modal (`components/SalesReceiptModal.tsx`)**:
  - Official POS receipt with store header, itemized receipt table, VAT breakdown, payment/change summary, barcode graphic, and expandable JSON payload inspector.
- **API Dispatch (`api/salesApi.ts`)**:
  - Dispatches full structured payload (`buildSalesPayload`) with graceful mock response.
- **Global Toast Alerts**:
  - Rendered via `createPortal(..., document.body)` at `fixed top-4 right-5 z-[99999]` for full-viewport top-right placement.

### 12. Global Sidebar Navigation (`routes/navigation.ts`)
- Temporarily commented out the **Reports** navigation item from the main sidebar module list.

---

## Files Created & Modified

### Created Files
- `web/src/pages/sales/sales-entry/types.ts`
- `web/src/pages/sales/sales-entry/sales-entry.css`
- `web/src/pages/sales/sales-entry/api/salesApi.ts`
- `web/src/pages/sales/sales-entry/components/SalesEntryHeader.tsx`
- `web/src/pages/sales/sales-entry/components/SalesInfoCard.tsx`
- `web/src/pages/sales/sales-entry/components/CustomerCard.tsx`
- `web/src/pages/sales/sales-entry/components/RemarksAttachmentsCard.tsx`
- `web/src/pages/sales/sales-entry/components/ItemsServicesCard.tsx`
- `web/src/pages/sales/sales-entry/components/SalesSummaryCard.tsx`
- `web/src/pages/sales/sales-entry/components/TermsCreditCard.tsx`
- `web/src/pages/sales/sales-entry/components/PaymentCard.tsx`
- `web/src/pages/sales/sales-entry/components/SalesTotalBreakdownCard.tsx`
- `web/src/pages/sales/sales-entry/components/PreviewInvoiceModal.tsx`
- `web/src/pages/sales/sales-entry/components/SalesReceiptModal.tsx`
- `web/src/pages/sales/sales-entry/components/AddItemModal.tsx`
- `web/src/pages/sales/sales-entry/SalesEntryPage.tsx`
- `web/src/components/ui/DatePicker.tsx`
- `web/src/components/ui/Select2Combobox.tsx`
- `docs/jhonel-md/cash-sales-entry.md`

### Modified Files
- `web/src/routes/navigation.ts` (Commented out Reports nav item)
- `web/src/pages/sales/components/SalesActionCards.tsx` (Connected New Sale routes)
- `web/src/app/router/index.tsx` (Configured Sales Entry routes)
- `web/src/styles/index.css` (Custom theme styles & scrollbar utilities)
