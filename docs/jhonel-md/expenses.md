# 2026-09-10 — Expenses Landing Page Implementation

## Objective
Implement the SimpleBIZ One **Expenses** Landing Page according to the reference design in `ui/pages/SimpleBIZ One UI - 800 - 001 Expenses Landing-02.jpg` and `MDS-800 (Expenses Module Design Specification)`, adopting the established modular component architecture, lavender/orchid branding (`#dfa8e6` / `#c06ec9` / `#3b0764`), horizontal bar graph design, smooth independent collapse transitions, equal default card sizing, and draggable card repositioning with layout persistence.

---

## Completed Features & Components

### 1. Primary Action Cards Row (`components/ExpensesActionCards.tsx`)
Features 2 core Expenses operational cards aligned across the first two column spans (`lg:col-span-2` in the 3-column page grid `lg:grid-cols-[1.1fr_1.4fr_1fr]`), perfectly aligning with the left edge of Needs Attention and the right edge of Overview:
- **Record Expense** (Lavender/Orchid `#dfa8e6` / `#c06ec9`): Receipt with calculator and gold coin artwork, *"Record a business expense, whether paid or payable."*, action button: `Record Expense`.
- **Pay Expense** (Lavender/Orchid `#dfa8e6` / `#c06ec9`): Hand giving cash note over wallet artwork (`wallet.png`), *"Pay a recorded expense that remains unpaid."*, action button: `Pay Expense`.

### 2. Operational Insights & Key Indicators Row
- **`components/ExpensesNeedsAttentionCard.tsx`**:
  - Attention counter header (`17 items`) with collapsible accordion toggle and `GripVertical` drag handle.
  - 5 categorized alert items with circular count badges matching the design:
    - `5` (Red badge) Overdue Expenses (`₱5,750 overdue and requires follow-up`).
    - `1` (Red badge) Reimbursements Due (`₱18,750 awaiting reimbursement`).
    - `1` (Orange badge) Missing Receipts (`₱1000 of expenses has no supporting receipt.`).
    - `7` (Slate badge) Awaiting Approval (`₱50,580 awaiting approval`).
    - `3` (Slate badge) Possible Duplicates (`3 expense payments totaling ₱50,580 may be duplicates.`).
  - Interactive item hover effects and a `View all` link.
- **`components/ExpensesOverviewCard.tsx`**:
  - Horizontal bar graph design with solid colored bars extending rightward to amounts at the bar tips:
    - `● Total Expenses` — Blue solid bar (`₱573,400`).
    - `● Unpaid Expenses` — Red solid bar (`₱176,200`).
    - `● Reimbursable Expenses` — Orange solid bar (`₱84,300`).
    - `● Paid Expenses` — Green solid bar (`₱312,900`).
  - Total Expenses KPI block: `Total Expenses - September` + `₱573,400` with `12.6% increase vs last month` trend indicator and `View all` link.
  - Header drag handle and collapsible toggle.
- **`components/ExpensesMoreActionsCard.tsx`**:
  - Action items:
    - `View Unpaid Expenses` (Sky blue filled button)
    - `Reimbursable Expenses` (Muted button with lock badge)
    - `Prepaid Expenses` (Muted button with lock badge)
    - `Accrued Expenses` (Muted button with lock badge)
  - `View all` link, header drag handle, and collapsible toggle.

### 3. Recent Activity, Reports & Records / Ledgers Row
- **`components/ExpensesRecentActivityCard.tsx`**:
  - Chronological expense audit table with `Date`, `Description / Vendor`, `Category`, `Amount`, and `User` badges (`KVL`, `CAL`).
  - Header drag handle and collapsible toggle.
- **`components/ExpensesReportsCard.tsx`**:
  - Curated Expenses report links (`Expense Breakdown by Category`, `Unpaid & Overdue Expense Aging`, `Employee Reimbursement Summary`, `Monthly Operating Cost Trend`).
  - Header drag handle and collapsible toggle.
- **`components/ExpensesRecordsLedgersCard.tsx`**:
  - 8-item launcher grid with high-resolution icons:
    - `Expense History`, `Unpaid Expenses`, `Reimbursements`, `Expense Receipts`, `Prepaid Records`, `Accrued Expenses`, `Recurring Expenses`, `Voided Expenses`.
  - Header drag handle and collapsible toggle.

---

## Interaction & UX Enhancements

### 1. Draggable Card Repositioning (`useExpensesCardOrder.ts`)
- **Native HTML5 Drag and Drop**: Lightweight drag reordering for the 6 modular cards in Rows 2 & 3.
- **Header-Targeted Drag Handles**: Subtle `GripVertical` icon in each card header with grab/grabbing cursor states.
- **Visual Feedback**: Dragged card opacity lowers to 35%, and target drop zones indicate drop targets with a subtle purple ring.
- **Layout Persistence**: Custom card arrangements are persisted in `localStorage` under `simplebiz_expenses_card_order` with a `Reset layout` action in the page subheader.

### 2. Collapsible Accordion Cards (`expenses.css`)
- Pure CSS grid template row transition (`grid-template-rows: 1fr` ⇄ `0fr`) on `.card-collapse-grid` for 0ms-delay layout animations with zero jitter.
- Rotation indicator on the `ChevronUp` / `ChevronDown` icons (`rotate-0` to `rotate-180`).

---

## Technical Specifications
- **Page Route**: `/expenses` (integrated into `AppRouter.tsx` and `navigation.ts`).
- **Design Tokens**: Orchid/lavender palette (`#dfa8e6` card background, `#c06ec9` border, `#3b0764` text, `#581c87` subtext).
- **Responsive Layout**: Mobile-first single column expanding smoothly to 3-column desktop layout (`lg:grid-cols-[1.1fr_1.4fr_1fr]`).
