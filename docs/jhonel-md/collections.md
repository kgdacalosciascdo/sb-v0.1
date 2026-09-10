# 2026-09-10 — Collections & Receipts Landing Page Implementation

## Objective
Implement the SimpleBIZ One **Collections & Receipts** Landing Page according to the reference design in `ui/pages/SimpleBIZ One UI - 300 - 001 Collections & Receipts Landing-02.jpg` and `MDS-300 (Collections & Receipts Module Design Specification)`, adopting the established modular component architecture, horizontal bar graph design, smooth independent collapse transitions, equal default card sizing, and draggable card repositioning with layout persistence.

---

## Completed Features & Components

### 1. Primary Action Cards Row (`components/CollectionsActionCards.tsx`)
Features 4 core Collections operational cards aligned across the first two column spans (`lg:col-span-2` in the 3-column page grid `lg:grid-cols-[1.1fr_1.4fr_1fr]`), perfectly aligning with the left edge of Needs Attention and the right edge of Overview:
- **Collections** (Mint Green `#caedd6` / `#68c486`): Cash hand artwork (`cash-hand.png`), *"Receive money from payment of customer receivables."*, action button: `Receive Payment`.
- **Receipt History** (Mint Green `#caedd6` / `#68c486`): Green checklist clipboard artwork (`purchase-return.png`), *"Review customer payments and issued receipts."*, action button: `View Receipts`.
- **Cash Remittance** (Pastel Lime `#dcedc8` / `#9ccc65`): Blue safe deposit box with floating golden coin artwork (`cash-accounts.png`), *"Record the remittance of collected cash."*, action button: `Record Remittance`.
- **Customer Ledger** (Sky Blue `#2ea5f5` / `#0288d1`): Customer badge/folder artwork (`Cusutomer-ledger.png`), *"View customer balances, receivables, and payment history."*, action button: `View Customer Ledger`.

### 2. Operational Insights & Key Indicators Row
- **`components/CollectionsNeedsAttentionCard.tsx`**:
  - Attention counter header (`17 items`) with collapsible accordion toggle and `GripVertical` drag handle.
  - 5 categorized alert items with circular count badges matching the design:
    - `5` (Red badge) Due today (`₱6,750 requires follow-up`).
    - `1` (Red badge) Overdue customer balances (`₱18,750 requires follow-up`).
    - `1` (Orange badge) Unapplied payments (`₱1000 collection is not applied to customer receivables`).
    - `7` (Slate badge) Voided or failed receipts (`₱300 worth of sales transaction is voided`).
    - `3` (Slate badge) Due in the next 7 days (`₱50,580 Due for collection in the next 7 days`).
  - Interactive item hover effects and a `View all` link.
- **`components/CollectionsOverviewCard.tsx`**:
  - Horizontal bar graph design with solid colored bars extending rightward from a shared baseline and currency amounts sitting right at the bar tips:
    - `● Collected This Month` — Blue solid bar (`₱493,583`).
    - `● Collected Today` — Red solid bar (`₱176,200`).
    - `● Overdue Receivables` — Orange solid bar (`₱84,300`).
    - `● Total Receivables` — Green solid bar (`₱312,900`).
  - Monthly Total Receipts KPI summary block: Custom 3-bar trend graphic + `₱493,583` with `12.6% increase vs last month` indicator and `View report` link.
  - Header drag handle and collapsible toggle.
- **`components/CollectionsMoreActionsCard.tsx`**:
  - Action items:
    - `Record Other Receipt` (light sky blue filled button)
    - `Apply Payment` (with plus-in-box and lock badge)
    - `Create Billing Statement` (with document and lock badge)
    - `Issue Customer Refund` (with refund/undo and lock badge)
  - `View all` link, header drag handle, and collapsible toggle.

### 3. Recent Activity, Reports & Records / Ledgers Row
- **`components/CollectionsRecentActivityCard.tsx`**:
  - Chronological transaction audit table with `Date`, `Activity`, `Amount`, and `User` badges (`KVL`, `CAL`).
  - Header drag handle and collapsible toggle.
- **`components/CollectionsReportsCard.tsx`**:
  - Curated Collections & Receipts report links (`Daily Collection Summary`, `Accounts Receivable Aging`, `Customer Payment History`, `Cash Remittance & Deposit Report`).
  - Header drag handle and collapsible toggle.
- **`components/CollectionsRecordsLedgersCard.tsx`**:
  - 8-item launcher grid with high-resolution icons:
    - `Collection History`, `Official Receipts`, `Customer Ledgers`, `Cash Remittance Log`, `Overdue Accounts`, `Deposit Slips`, `Voided Receipts`, `Refund Records`.
  - Header drag handle and collapsible toggle.

---

## Interaction & UX Enhancements

### 1. Draggable Card Repositioning (`useCollectionsCardOrder.ts`)
- **Native HTML5 Drag and Drop**: Lightweight drag reordering for the 6 modular cards in Rows 2 & 3.
- **Header-Targeted Drag Handles**: Subtle `GripVertical` icon in each card header with grab/grabbing cursor states.
- **Visual Feedback**: Dragged card opacity and dashed outline; drop target animated blue highlight ring (`#0288d1`).
- **LocalStorage Persistence**: Saves custom layout under `simplebiz_collections_card_order` and restores automatically.
- **Reset Layout**: 1-click **"Reset layout"** button (`RotateCcw` icon) displayed when layout has been customized.

### 2. Smooth GPU-Accelerated Card Accordion Collapse (`useCardCollapse.ts`)
- Utilizes CSS Grid `0fr ↔ 1fr` interpolation and coordinated `isFullHeight` state to ensure equal card heights when expanded and fluid height animation during collapse.

---

## Files Created & Modified

### Created Files
- `web/src/hooks/useCollectionsCardOrder.ts`
- `web/src/pages/collections/collections.css`
- `web/src/pages/collections/components/CollectionsActionCards.tsx`
- `web/src/pages/collections/components/CollectionsNeedsAttentionCard.tsx`
- `web/src/pages/collections/components/CollectionsOverviewCard.tsx`
- `web/src/pages/collections/components/CollectionsMoreActionsCard.tsx`
- `web/src/pages/collections/components/CollectionsRecentActivityCard.tsx`
- `web/src/pages/collections/components/CollectionsReportsCard.tsx`
- `web/src/pages/collections/components/CollectionsRecordsLedgersCard.tsx`
- `web/src/pages/collections/CollectionsPage.tsx`
- `docs/jhonel-md/collections.md`

### Modified Files
- `web/src/routes/navigation.ts`
- `web/src/app/router/index.tsx`
