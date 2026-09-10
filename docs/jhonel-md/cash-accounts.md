# 2026-09-10 — Cash Accounts Landing Page Implementation

## Objective
Implement the SimpleBIZ One **Cash Accounts** Landing Page according to the reference design in `ui/pages/SimpleBIZ One UI - 700 - 001 Cash Accounts Landing-02.jpg` and `MDS-700 (Cash Accounts Module Design Specification)`, adopting the established modular component architecture, light lime green branding (`#d9f59b` / `#9ec94c` / `#273c0e`), horizontal bar graph design, smooth independent collapse transitions, equal default card sizing, and draggable card repositioning with layout persistence.

---

## Completed Features & Components

### 1. Primary Action Cards Row (`components/CashAccountsActionCards.tsx`)
Features 4 core Cash operational cards aligned across the first two column spans (`lg:col-span-2` in the 3-column page grid `lg:grid-cols-[1.1fr_1.4fr_1fr]`), perfectly aligning with the left edge of Needs Attention and the right edge of Overview:
- **Cash In** (Lime Green `#d9f59b` / `#9ec94c`): Hand giving cash note artwork (`cash-hand.png`), *"Record money received into a Cash Account."*, action button: `Cash In`.
- **Cash Out** (Lime Green `#d9f59b` / `#9ec94c`): Safe box with curved red right arrow artwork, *"Record money leaving a Cash Account."*, action button: `Cash Out`.
- **Transfer Funds** (Lime Green `#d9f59b` / `#9ec94c`): Bank building, mobile phone, and safe box with orange sync arrows artwork, *"Move money between Cash Accounts."*, action button: `Transfer Funds`.
- **Cash Remittance** (Lime Green `#d9f59b` / `#9ec94c`): Blue metal cash box with money artwork (`cash-accounts.png`), *"Record the remittance of collected cash."*, action button: `Record Remittance`.

### 2. Operational Insights & Key Indicators Row
- **`components/CashAccountsNeedsAttentionCard.tsx`**:
  - Attention counter header (`17 items`) with collapsible accordion toggle and `GripVertical` drag handle.
  - 5 categorized alert items with circular count badges matching the design:
    - `5` (Red badge) Reconciliation Needed (`5 transactions totaling ₱5,750 are unmatched.`).
    - `1` (Red badge) Cash Count Variances (`Petty Cash is ₱1,250 short against the recorded balance.`).
    - `1` (Orange badge) Low-balance Account (`Petty Cash has ₱2,700 available — below the ₱5,000 minimum.`).
    - `7` (Slate badge) Pending Transfers / Confirmation (`7 transfers totaling ₱43,500 are awaiting confirmation.`).
    - `3` (Slate badge) Checks Due for Funding (`3 checks totaling ₱50,580 are due within the next 7 days.`).
  - Interactive item hover effects and a `View all` link.
- **`components/CashAccountsOverviewCard.tsx`**:
  - Horizontal bar graph design with solid colored bars extending rightward to amounts at the bar tips:
    - `● Cash in Bank` — Blue solid bar (`₱493,583`).
    - `● Cash in Vault` — Red solid bar (`₱176,200`).
    - `● Cash Box / Petty Cash` — Orange solid bar (`₱84,300`).
    - `● Digital Wallet` — Green solid bar (`₱312,900`).
  - Total Cash Position KPI block: `Total Cash Position` + `₱1,066,983` with `12.6% increase vs last month` trend indicator and `View all` link.
  - Header drag handle and collapsible toggle.
- **`components/CashAccountsMoreActionsCard.tsx`**:
  - Action items:
    - `Manage Cash Accounts` (Sky blue filled button)
    - `Deposit / Withdraw` (Sky blue filled button)
    - `Cash Count` (Sky blue filled button)
    - `Reconcile` (Sky blue filled button)
  - `View all` link, header drag handle, and collapsible toggle.

### 3. Recent Activity, Reports & Records / Ledgers Row
- **`components/CashAccountsRecentActivityCard.tsx`**:
  - Chronological cash transaction audit table with `Date`, `Activity`, `Amount`, and `User` badges (`KVL`, `CAL`).
  - Header drag handle and collapsible toggle.
- **`components/CashAccountsReportsCard.tsx`**:
  - Curated Cash Accounts report links (`Cash Position & Balance Summary`, `Bank Reconciliation Statement`, `Cash Flow / Movement Journal`, `Cash Variance & Shortage Audit`).
  - Header drag handle and collapsible toggle.
- **`components/CashAccountsRecordsLedgersCard.tsx`**:
  - 8-item launcher grid with high-resolution icons:
    - `Bank Accounts`, `Vault Registers`, `Petty Cash Ledgers`, `Cash Remittances`, `Fund Transfers`, `Cash Count Sheets`, `Deposit Slips`, `Reconciliation Logs`.
  - Header drag handle and collapsible toggle.

---

## Interaction & UX Enhancements

### 1. Draggable Card Repositioning (`useCashAccountsCardOrder.ts`)
- **Native HTML5 Drag and Drop**: Lightweight drag reordering for the 6 modular cards in Rows 2 & 3.
- **Header-Targeted Drag Handles**: Subtle `GripVertical` icon in each card header with grab/grabbing cursor states.
- **Visual Feedback**: Dragged card opacity lowers to 35%, and target drop zones indicate drop targets with a subtle green ring.
- **Layout Persistence**: Custom card arrangements are persisted in `localStorage` under `simplebiz_cash_accounts_card_order` with a `Reset layout` action in the page subheader.

### 2. Collapsible Accordion Cards (`cash-accounts.css`)
- Pure CSS grid template row transition (`grid-template-rows: 1fr` ⇄ `0fr`) on `.card-collapse-grid` for 0ms-delay layout animations with zero jitter.
- Rotation indicator on the `ChevronUp` / `ChevronDown` icons (`rotate-0` to `rotate-180`).

---

## Technical Specifications
- **Page Route**: `/cash-accounts` (integrated into `AppRouter.tsx` and `navigation.ts`).
- **Design Tokens**: Fresh lime green palette (`#d9f59b` card background, `#9ec94c` border, `#273c0e` text, `#3e5e18` subtext).
- **Responsive Layout**: Mobile-first single column expanding smoothly to 3-column desktop layout (`lg:grid-cols-[1.1fr_1.4fr_1fr]`).
