# 2026-09-10 — Payments & Disbursements Landing Page Implementation

## Objective
Implement the SimpleBIZ One **Payments & Disbursements** Landing Page according to the reference design in `ui/pages/SimpleBIZ One UI - 500 - 001 Payments & Disbursements Landing-02.jpg` and `MDS-500 (Payments & Disbursements Module Design Specification)`, adopting the established modular component architecture, dusty rose color branding (`#be727e` / `#9b4d5a`), horizontal bar graph design, smooth independent collapse transitions, equal default card sizing, and draggable card repositioning with layout persistence.

---

## Completed Features & Components

### 1. Primary Action Cards Row (`components/PaymentsActionCards.tsx`)
Features 3 core Payments operational cards aligned across the first two column spans (`lg:col-span-2` in the 3-column page grid `lg:grid-cols-[1.1fr_1.4fr_1fr]`), perfectly aligning with the left edge of Needs Attention and the right edge of Overview:
- **Pay Supplier** (Dusty Rose `#f7d8dd` / `#be727e`): Supplier profile with hand giving cash artwork (`pay-supplier.png`), *"Pay outstanding supplier balances."*, action button: `Pay Supplier`.
- **Pay Expense** (Dusty Rose `#f7d8dd` / `#be727e`): Wallet artwork (`wallet.png`), *"Record payment for operating expenses."*, action button: `Pay Expense`.
- **Other Payments** (Dusty Rose `#f7d8dd` / `#be727e`): Cash accounts / deposit safe box artwork (`cash-accounts.png`), *"Record other cash disbursements."*, action button: `Other Payments`.

### 2. Operational Insights & Key Indicators Row
- **`components/PaymentsNeedsAttentionCard.tsx`**:
  - Attention counter header (`17 items`) with collapsible accordion toggle and `GripVertical` drag handle.
  - 5 categorized alert items with circular count badges matching the design:
    - `5` (Red badge) Supplier payables due today (`₱6,750 requires follow-up`).
    - `1` (Red badge) Overdue supplier payments (`₱18,750 requires follow-up`).
    - `1` (Orange badge) Unapplied payments (`₱1,000 payments is not applied to supplier payables`).
    - `7` (Slate badge) Voided or failed payments (`₱300 worth of payment transaction is voided`).
    - `3` (Slate badge) Due in the next 7 days (`₱50,580 Due for payment in the next 7 days`).
  - Interactive item hover effects and a `View all` link.
- **`components/PaymentsOverviewCard.tsx`**:
  - Horizontal bar graph design with solid colored bars extending rightward from a shared baseline and currency amounts sitting right at the bar tips:
    - `● Disbursements This Month` — Blue solid bar (`₱348,500`).
    - `● Supplier Payments` — Red solid bar (`₱245,200`).
    - `● Expense Payments` — Orange solid bar (`₱78,300`).
    - `● Other Payments` — Green solid bar (`₱25,000`).
  - Monthly Total Disbursements KPI summary block: Custom 3-bar trend graphic + `₱348,500` with `8.4% increase vs last month` indicator and `View report` link.
  - Header drag handle and collapsible toggle.
- **`components/PaymentsMoreActionsCard.tsx`**:
  - Action items:
    - `Check Management` (with check document and lock badge)
    - `Customer Refund` (with refund sheet and lock badge)
    - `Employee Cash Advance` (with person wallet and lock badge)
    - `Owner Withdrawal` (light dusty rose filled button)
  - `View all` link, header drag handle, and collapsible toggle.

### 3. Recent Activity, Reports & Records / Ledgers Row
- **`components/PaymentsRecentActivityCard.tsx`**:
  - Chronological transaction audit table with `Date`, `Activity`, `Amount`, and `User` badges (`KVL`, `CAL`).
  - Header drag handle and collapsible toggle.
- **`components/PaymentsReportsCard.tsx`**:
  - Curated Payments & Disbursements report links (`Disbursements Summary Report`, `Check Register & Status`, `Supplier Settlement Summary`, `Expense Payment Breakdown`).
  - Header drag handle and collapsible toggle.
- **`components/PaymentsRecordsLedgersCard.tsx`**:
  - 8-item launcher grid with high-resolution icons:
    - `Payment History`, `Check Register`, `Supplier Ledgers`, `Disbursement Vouchers`, `Expense Receipts`, `Refund Records`, `Voided Payments`, `Debit Vouchers`.
  - Header drag handle and collapsible toggle.

---

## Interaction & UX Enhancements

### 1. Draggable Card Repositioning (`usePaymentsCardOrder.ts`)
- **Native HTML5 Drag and Drop**: Lightweight drag reordering for the 6 modular cards in Rows 2 & 3.
- **Header-Targeted Drag Handles**: Subtle `GripVertical` icon in each card header with grab/grabbing cursor states.
- **Visual Feedback**: Dragged card opacity lowers to 45%, and target drop zones indicate drop targets with a subtle blue ring.
- **Layout Persistence**: Custom card arrangements are persisted in `localStorage` under `simplebiz_payments_card_order_v1` with a `Reset` layout action in the page subheader.

### 2. Collapsible Accordion Cards (`payments.css`)
- Pure CSS grid template row transition (`grid-template-rows: 1fr` ⇄ `0fr`) on `.card-collapsible-body` for 0ms-delay layout animations with zero jitter.
- Rotation indicator on the `ChevronUp` icon (`rotate-0` to `rotate-180`).

---

## Technical Specifications
- **Page Route**: `/payments` (integrated into `AppRouter.tsx` and `navigation.ts`).
- **Design Tokens**: Dusty rose palette (`#be727e` header/accent, `#9b4d5a` dark border/accent, `#f7d8dd` light action card bg).
- **Responsive Layout**: Mobile-first single column expanding smoothly to 3-column desktop layout (`lg:grid-cols-[1.1fr_1.4fr_1fr]`).
