# 2026-09-10 — Sales & Receivables Landing Page Implementation

## Objective
Implement the SimpleBIZ One **Sales & Receivables** Landing Page according to the reference design in `ui/pages/SimpleBIZ One UI - 200 - 001 Sales & Receivables Landing-02.jpg` and `MDS-200 (Sales & Receivables Module Design Specification)`, adopting the established modular component architecture, smooth independent collapse transitions, equal default card sizing, and draggable card repositioning with layout persistence.

---

## Completed Features & Components

### 1. Primary Action Cards Row (`components/SalesActionCards.tsx`)
Features 5 core Sales operational cards matching the reference visual design:
- **Cash Sales** (Sky Blue `#2ea5f5` / `#0288d1`): Cash register artwork, *"Create a sales transaction paid in cash."*, action button: `New Sale`.
- **Credit Sales** (Sky Blue `#2ea5f5` / `#0288d1`): POS computer terminal artwork, *"Create a credit sale."*, action button: `New Sale`.
- **Customer** (Sky Blue `#2ea5f5` / `#0288d1`): Customer badge/folder artwork, *"Create a new customer record"*, action button: `New Customer`.
- **Collections** (Mint Green `#caedd6` / `#68c486`): Cash hand artwork, *"Receive money from payment of customer receivables."*, action button: `Receive Payment`.
- **Cash Remittance** (Pastel Lime `#dcedc8` / `#9ccc65`): Cash deposit safe artwork, *"Record the remittance of collected cash."*, action button: `Record Remittance`.

### 2. Operational Insights & Key Indicators Row
- **`components/SalesNeedsAttentionCard.tsx`**:
  - Attention counter header (`24 items`) with collapsible accordion toggle and `GripVertical` drag handle.
  - 5 categorized alert items with circular count badges matching the design:
    - `5` (Red badge) Overdue customer balances (`₱18,750 requires follow-up`).
    - `1` (Red badge) Cash remittance shortages / overages (`₱500 cash shortage discovered`).
    - `1` (Orange badge) Sales return (`₱1000 worth of item is returned`).
    - `7` (Slate badge) Voided sales (`₱300 worth of sales transaction is voided`).
    - `3` (Slate badge) Due in the next 7 days (`₱50,580 Due for collection in the next 7 days`).
  - Interactive item hover effects and a `View all` link.
- **`components/SalesOverviewCard.tsx`**:
  - Horizontal bar graph design with solid colored bars extending rightward from a shared baseline and currency amounts sitting right at the bar tips:
    - `● Sales This Month` — Blue solid bar (`₱493,583`).
    - `● Accounts Receivables` — Red solid bar (`₱176,200`).
    - `● Overdue` — Orange solid bar (`₱84,300`).
    - `● Collected This Month` — Green solid bar (`₱312,900`).
  - Monthly Total Sales KPI summary block: Custom 3-bar trend graphic + `₱493,583` with `12.6% increase vs last month` indicator and `View report` link.
  - Header drag handle and collapsible toggle.
- **`components/SalesMoreActionsCard.tsx`**:
  - Action items:
    - `Billing Statement` (with document and lock badge)
    - `Record Sales Return` (with plus-in-box and lock badge)
    - `Credit Adjustment` (light blue styled button)
    - `Debit Adjustment` (light blue styled button)
  - `View all` link, header drag handle, and collapsible toggle.

### 3. Recent Activity, Reports & Records / Ledgers Row
- **`components/SalesRecentActivityCard.tsx`**:
  - Chronological transaction audit table with `Date`, `Activity`, `Amount`, and `User` badges (`KVL`, `CAL`).
  - Header drag handle and collapsible toggle.
- **`components/SalesReportsCard.tsx`**:
  - Curated Sales & Receivables report links (`Sales Summary Report`, `Accounts Receivable Aging`, `Customer Statement of Account`, `Cash Remittance Summary`).
  - Header drag handle and collapsible toggle.
- **`components/SalesRecordsLedgersCard.tsx`**:
  - 8-item launcher grid with high-resolution icons:
    - `Sales History`, `Collection History`, `Customer Ledgers`, `Cash Drawer History`, `Overdue Accounts`, `Sales Returns`, `Voided Sales`, `Adjustments & Memos`.
  - Header drag handle and collapsible toggle.

---

## Interaction & UX Enhancements

### 1. Draggable Card Repositioning (`useSalesCardOrder.ts`)
- **Native HTML5 Drag and Drop**: Responsive and lightweight drag reordering for the 6 modular cards in Rows 2 & 3.
- **Header-Targeted Drag Handles**: Subtle `GripVertical` icon in each card header with grab/grabbing cursor states.
- **Visual Feedback**: Dragged card opacity and dashed outline; drop target animated blue highlight ring (`#0288d1`).
- **LocalStorage Persistence**: Saves custom layout under `simplebiz_sales_card_order` and restores automatically.
- **Reset Layout**: 1-click **"Reset layout"** button (`RotateCcw` icon) displayed when layout has been customized.

### 2. Smooth GPU-Accelerated Card Accordion Collapse (`useCardCollapse.ts`)
- Utilizes CSS Grid `0fr ↔ 1fr` interpolation and coordinated `isFullHeight` state to ensure equal card heights when expanded and fluid height animation during collapse.

---

## Files Created & Modified

### Created Files
- `web/src/hooks/useSalesCardOrder.ts`
- `web/src/pages/sales/sales.css`
- `web/src/pages/sales/components/SalesActionCards.tsx`
- `web/src/pages/sales/components/SalesNeedsAttentionCard.tsx`
- `web/src/pages/sales/components/SalesOverviewCard.tsx`
- `web/src/pages/sales/components/SalesMoreActionsCard.tsx`
- `web/src/pages/sales/components/SalesRecentActivityCard.tsx`
- `web/src/pages/sales/components/SalesReportsCard.tsx`
- `web/src/pages/sales/components/SalesRecordsLedgersCard.tsx`
- `web/src/pages/sales/SalesPage.tsx`
- `docs/jhonel-md/sales.md`

### Modified Files
- `web/src/routes/navigation.ts`
- `web/src/app/router/index.tsx`
