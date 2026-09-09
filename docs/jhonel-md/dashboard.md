# 2026-09-09 — Dashboard Landing Page Implementation & Enhancements

## Objective
Implement and polish the SimpleBIZ One Dashboard Landing Page according to the reference design in `ui/pages/SimpleBIZ One UI - 100 - 001 Dashboard Landing-02.jpg` and `MDS-100 (Dashboard Module Design Specification)`, with modern interaction enhancements including independent smooth collapse animations, equal default card sizing, and draggable card repositioning with layout persistence.

---

## Completed Features & Components

### 1. Primary Action Cards Row (`components/DashboardActionCards.tsx`)
Features 5 core operational business cards with colorful background panels, authentic imagery, descriptions, and direct quick-action buttons:
- **Sales** (Sky Blue `#2ea5f5` / `#0288d1`): POS Cash Register artwork, *"Create a cash or credit sale."*, action button: `New Sale`.
- **Collections** (Mint Green `#caedd6` / `#68c486`): Cash hand artwork, *"Receive money from payment of customer receivables."*, action button: `Receive Payment`.
- **Purchases** (Warm Amber `#fde599` / `#f59e0b`): Logistics truck artwork, *"Record a cash or credit purchase."*, action button: `New Purchase`.
- **Payments** (Dusty Rose `#be727e` / `#9b4d5a`): Payment slip & check artwork, *"Pay suppliers and settle other obligations."*, action button: `Make Payment`.
- **Inventory** (Warm Kraft Tan `#d7b58d` / `#b08b5d`): Stacked corrugated boxes artwork, *"Receive, issue, transfer, or adjust stock."*, action button: `Record Stock Movement`.

### 2. Operational Insights & Key Indicators Row
- **`components/NeedsAttentionCard.tsx`**:
  - Attention counter header (`24 items`) with collapsible accordion toggle and `GripVertical` drag handle.
  - 6 categorized alert items with circular count badges:
    - `5` (Red badge) Overdue customer balances (`₱18,750 requires follow-up`).
    - `1` (Red badge) Cash remittance shortages / overages (`₱500 cash shortage discovered`).
    - `7` (Red badge) Stocks due for reorder (`5 items are below the reorder level`).
    - `3` (Red badge) Overdue supplier balances (`₱12,456 needs to be paid`).
    - `1` (Orange badge) Sales return (`₱1,000 worth of item is returned`).
    - `7` (Slate badge) Voided sales (`₱300 worth of sales transaction is voided`).
  - Interactive item hover effects and a `View all` link.
- **`components/ProfitLossOverviewCard.tsx`**:
  - Proportional waterfall horizontal progress bars filling the column track with spacious vertical row spacing (`gap-3.5`) and extended dashed drop connectors:
    - `● Net Sales` — Blue bar (`100%`, `₱493,583`).
    - `● Less: Cost of Goods Sold` — Red bar (`49%`, `(₱240,124)`).
    - `● Gross Profit` — Green bar (`51%`, `₱253,459`).
    - `● Less: Operating Expenses` — Orange bar (`31%`, `(₱153,642)`).
    - `● Net Profit` — Yellow bar (`20%`, `₱99,817`).
  - Monthly Net Profit KPI block: `₱99,817` with `12.6% increase vs last month` trend indicator.
  - Cascading bar growth animations and synchronized number counters via `useCountUp`.
  - Header drag handle and collapsible toggle.
- **`components/BusinessOverviewCard.tsx`**:
  - 4 executive metric rows matching the exact design specification with standalone large gray SVG icons, 2-line stacked typography, and right chevrons:
    - **Sales This Month:** Upward trending bar chart icon + `₱248,600`
    - **Receivables:** Solid user silhouette icon + `₱82,400`
    - **Overdue for Collection:** Document with clock badge icon + `₱18,750`
    - **Outstanding Payables:** Solid user silhouette icon + `₱12,300`
  - Header drag handle and collapsible toggle.

### 3. Recent Activity & Quick Launcher Row
- **`components/RecentActivityCard.tsx`**:
  - Chronological transaction audit table with `Date`, `Activity`, `Amount`, and `User` badges (`KVL`, `CAL`).
  - Header drag handle and collapsible toggle.
- **`components/RecordsLedgersCard.tsx`**:
  - 8-item launcher grid with enlarged, high-resolution icons (`h-14 sm:h-16`, max-width up to `84px`, container `h-16 sm:h-18`) and authentic labels:
    - `Sales History`, `Collection History`, `Purchase History`, `Cash Account History`, `Cash Drawer History`, `Customer Ledgers`, `Supplier Ledgers`, `Expenses History`.
  - Header drag handle and collapsible toggle.
- **`components/MoreActionsCard.tsx`**:
  - Quick action buttons: `Cash Remittance`, `Receive Payment`, `New Cash Sale`.
  - Header drag handle and collapsible toggle.

---

## Interaction & UX Enhancements

### 1. Draggable Card Repositioning (`useDashboardOrder.ts`)
- **Native HTML5 Drag and Drop**: Zero external dependencies; fully compatible with React 19 and Vite.
- **Header-Targeted Drag Handles**: Subtle `GripVertical` icon in each card header with grab/grabbing cursor states. Drag activation requires grabbing the header, preventing conflicts when highlighting text or clicking buttons in card bodies.
- **Visual Feedback**:
  - Dragged card scales down (`scale(0.97)`), lowers opacity (`opacity: 0.35`), and shows dashed outline.
  - Drop target displays animated blue highlight ring (`#0288d1`) and card lift (`scale(1.015)`).
- **LocalStorage Persistence**:
  - Saves custom layout under `simplebiz_dashboard_card_order`.
  - Automatically restores saved order on mount.
  - Displays a 1-click **"Reset layout"** button (`RotateCcw` icon) in the dashboard header whenever order is customized.

### 2. Equal Card Heights by Default
- Grid rows in `DashboardPage.tsx` maintain default CSS Grid stretching (`h-full flex flex-col justify-between`), ensuring cards in Row 2 and Row 3 share identical card heights and aligned bottom baselines.

### 3. GPU-Accelerated Smooth Collapse & Uncollapse (`useCardCollapse.ts`)
- **CSS Grid Interpolation**: Uses `.card-collapse-grid` (`grid-template-rows: 0fr ↔ 1fr`, `opacity: 0 ↔ 1`, `will-change: grid-template-rows, opacity`, `duration-300 cubic-bezier(0.4, 0, 0.2, 1)`) and `.card-collapse-inner` (`min-height: 0`, `overflow: hidden`).
- **Coordinated Lifecycle**:
  - **Expanded & Idle**: Anchors to `h-full` to match row height with sibling cards.
  - **Collapsing / Expanding**: Temporarily switches to `h-auto self-start` during the 300ms transition so the outer card container smoothly expands/shrinks in real time without white-box snapping or height jumps.
- Synchronized rotating chevron indicators (`rotate-180` ↔ `rotate-0` with `duration-300`).

---

## Files Created & Modified

### Created Files
- `web/src/hooks/useDashboardOrder.ts` (Card layout reordering, HTML5 drag-and-drop state, and localStorage persistence)
- `web/src/hooks/useCardCollapse.ts` (Smooth collapse/expand lifecycle hook coordinating equal height and dynamic resizing)
- `web/src/hooks/useCountUp.ts` (Smooth cubic easing number counter for financial metrics and waterfall bars)
- `web/src/pages/dashboard/dashboard.css` (Animations, waterfall styles, collapse grid, and drag-and-drop states)
- `web/src/pages/dashboard/components/DashboardActionCards.tsx`
- `web/src/pages/dashboard/components/NeedsAttentionCard.tsx`
- `web/src/pages/dashboard/components/ProfitLossOverviewCard.tsx`
- `web/src/pages/dashboard/components/BusinessOverviewCard.tsx`
- `web/src/pages/dashboard/components/RecentActivityCard.tsx`
- `web/src/pages/dashboard/components/RecordsLedgersCard.tsx`
- `web/src/pages/dashboard/components/MoreActionsCard.tsx`

### Modified Files
- `web/src/pages/dashboard/DashboardPage.tsx` (Complete modular orchestration, drag-and-drop handlers, and Reset Layout button)
- `docs/jhonel-md/dashboard.md` (Comprehensive documentation of architecture, components, and interactions)
