# 2026-09-10 — Purchases & Payables Landing Page Implementation

## Objective
Implement the SimpleBIZ One **Purchases & Payables** Landing Page according to the reference design in `ui/pages/SimpleBIZ One UI - 400 - 001 Purchases & Payables Landing-02.jpg` and `MDS-400 (Purchases & Payables Module Design Specification)`, adopting the established modular component architecture, horizontal bar graph design, smooth independent collapse transitions, equal default card sizing, and draggable card repositioning with layout persistence.

---

## Completed Features & Components

### 1. Primary Action Cards Row (`components/PurchasesActionCards.tsx`)
Features 3 core Purchases operational cards aligned across the first two column spans (`lg:col-span-2` in the 3-column page grid `lg:grid-cols-[1.1fr_1.4fr_1fr]`), perfectly aligning with the left edge of Needs Attention and the right edge of Overview:
- **Cash Purchase** (Warm Amber `#fde599` / `#f59e0b`): Hand trolley with cash artwork (`cash-purchase.png`), *"Record purchase paid in cash."*, action button: `New Cash Purchase`.
- **Credit Purchase** (Warm Amber `#fde599` / `#f59e0b`): Hand trolley with invoice artwork (`credit-purchase.png`), *"Record purchase bought in credit."*, action button: `New Credit Purchase`.
- **Pay Supplier** (Warm Amber `#fde599` / `#f59e0b`): Supplier avatar with cash artwork (`pay-supplier.png`), *"Pay outstanding supplier balances."*, action button: `Pay Supplier`.

### 2. Operational Insights & Key Indicators Row
- **`components/PurchasesNeedsAttentionCard.tsx`**:
  - Attention counter header (`17 items`) with collapsible accordion toggle and `GripVertical` drag handle.
  - 5 categorized alert items with circular count badges matching the design:
    - `5` (Red badge) Payables due today (`₱6,750 requires follow-up`).
    - `1` (Red badge) Overdue supplier balances (`₱18,750 requires follow-up`).
    - `1` (Orange badge) Unapplied payments (`₱1000 payments is not applied to supplier payables`).
    - `7` (Slate badge) Voided or failed purchases (`₱300 worth of purchase transaction is voided`).
    - `3` (Slate badge) Due in the next 7 days (`₱50,580 Due for payment in the next 7 days`).
  - Interactive item hover effects and a `View all` link.
- **`components/PurchasesOverviewCard.tsx`**:
  - Horizontal bar graph design with solid colored bars extending rightward from a shared baseline and currency amounts sitting right at the bar tips:
    - `● Purchases This Month` — Blue solid bar (`₱493,583`).
    - `● Supplier Payments This Month` — Red solid bar (`₱176,200`).
    - `● Outstanding Payables` — Orange solid bar (`₱84,300`).
    - `● Overdue Payables` — Green solid bar (`₱312,900`).
  - Monthly Total Purchases KPI summary block: Custom 3-bar trend graphic + `₱493,583` with `12.6% increase vs last month` indicator and `View report` link.
  - Header drag handle and collapsible toggle.
- **`components/PurchasesMoreActionsCard.tsx`**:
  - Action items:
    - `Request for Quotation` (with document and lock badge)
    - `Purchase Order` (with document and lock badge)
    - `Purchase Returns` (with plus-in-box and lock badge)
    - `Credit/Debit Adjustment` (light sky blue filled button)
  - `View all` link, header drag handle, and collapsible toggle.

### 3. Recent Activity, Reports & Records / Ledgers Row
- **`components/PurchasesRecentActivityCard.tsx`**:
  - Chronological transaction audit table with `Date`, `Activity`, `Amount`, and `User` badges (`KVL`, `CAL`).
  - Header drag handle and collapsible toggle.
- **`components/PurchasesReportsCard.tsx`**:
  - Curated Purchases & Payables report links (`Purchases Summary Report`, `Accounts Payable Aging`, `Supplier Ledger & Statements`, `Disbursement & Settlement Summary`).
  - Header drag handle and collapsible toggle.
- **`components/PurchasesRecordsLedgersCard.tsx`**:
  - 8-item launcher grid with high-resolution icons:
    - `Purchase History`, `Purchase Orders`, `Supplier Ledgers`, `Receiving Reports`, `Overdue Payables`, `Purchase Returns`, `Voided Purchases`, `Debit Memos`.
  - Header drag handle and collapsible toggle.

---

## Interaction & UX Enhancements

### 1. Draggable Card Repositioning (`usePurchasesCardOrder.ts`)
- **Native HTML5 Drag and Drop**: Lightweight drag reordering for the 6 modular cards in Rows 2 & 3.
- **Header-Targeted Drag Handles**: Subtle `GripVertical` icon in each card header with grab/grabbing cursor states.
- **Visual Feedback**: Dragged card opacity and dashed outline; drop target animated blue highlight ring (`#0288d1`).
- **LocalStorage Persistence**: Saves custom layout under `simplebiz_purchases_card_order` and restores automatically.
- **Reset Layout**: 1-click **"Reset layout"** button (`RotateCcw` icon) displayed when layout has been customized.

### 2. Smooth GPU-Accelerated Card Accordion Collapse (`useCardCollapse.ts`)
- Utilizes CSS Grid `0fr ↔ 1fr` interpolation and coordinated `isFullHeight` state to ensure equal card heights when expanded and fluid height animation during collapse.

---

## Files Created & Modified

### Created Files
- `web/src/hooks/usePurchasesCardOrder.ts`
- `web/src/pages/purchases/purchases.css`
- `web/src/pages/purchases/components/PurchasesActionCards.tsx`
- `web/src/pages/purchases/components/PurchasesNeedsAttentionCard.tsx`
- `web/src/pages/purchases/components/PurchasesOverviewCard.tsx`
- `web/src/pages/purchases/components/PurchasesMoreActionsCard.tsx`
- `web/src/pages/purchases/components/PurchasesRecentActivityCard.tsx`
- `web/src/pages/purchases/components/PurchasesReportsCard.tsx`
- `web/src/pages/purchases/components/PurchasesRecordsLedgersCard.tsx`
- `web/src/pages/purchases/PurchasesPage.tsx`
- `docs/jhonel-md/purchases.md`

### Modified Files
- `web/src/routes/navigation.ts`
- `web/src/app/router/index.tsx`
