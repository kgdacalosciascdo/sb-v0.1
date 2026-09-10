# 2026-09-10 — Inventory Management Landing Page Implementation

## Objective
Implement the SimpleBIZ One **Inventory Management** Landing Page according to the reference design in `ui/pages/SimpleBIZ One UI - 600 - 001 Inventory Landing-02.jpg` and `MDS-600 (Inventory Module Design Specification)`, adopting the established modular component architecture, warm wheat/tan branding (`#ecd9c8` / `#caa688` / `#5c381e`), horizontal pill-shaped metric bars, smooth independent collapse transitions, equal default card sizing, and draggable card repositioning with layout persistence.

---

## Completed Features & Components

### 1. Primary Action Cards Row (`components/InventoryActionCards.tsx`)
Features 3 core Inventory operational cards aligned across the first two column spans (`lg:col-span-2` in the 3-column page grid `lg:grid-cols-[1.1fr_1.4fr_1fr]`), perfectly aligning with the left edge of Needs Attention and the right edge of Overview:
- **Receive Stock** (Warm Sand/Wheat `#ecd9c8` / `#caa688`): Hand receiving boxes artwork (`receive-items.png`), *"Record items received into inventory."*, action button: `Receive Stock`.
- **Issue Stock** (Warm Sand/Wheat `#ecd9c8` / `#caa688`): Pushcart carrying cargo box with right white arrow artwork, *"Record items released from inventory."*, action button: `Issue Stock`.
- **Physical Count** (Warm Sand/Wheat `#ecd9c8` / `#caa688`): Checklist clipboard with stacked inventory boxes artwork, *"Count actual stock and identify variances."*, action button: `Start Count`.

### 2. Operational Insights & Key Indicators Row
- **`components/InventoryNeedsAttentionCard.tsx`**:
  - Attention counter header (`34 items`) with collapsible accordion toggle and `GripVertical` drag handle.
  - 5 categorized alert items with circular count badges matching the design:
    - `5` (Red badge) Out-of-stock items (`5 items currently have no available stock`).
    - `18` (Red badge) Low-stock items (`18 items are below their reorder level`).
    - `1` (Orange badge) Count variances requiring review (`1 physical count has an unresolved variance`).
    - `7` (Slate badge) Expected receipts overdue (`7 expected stock receipts are past due`).
    - `3` (Slate badge) Pending transfer receipt (`3 stock transfers are awaiting receipt`).
  - Interactive item hover effects and a `View all` link.
- **`components/InventoryOverviewCard.tsx`**:
  - Horizontal pill-shaped bar metrics with values embedded inside the solid pills:
    - `● Products in Stock` — Blue solid pill (`327`).
    - `● Low -stock Items` — Red solid pill (`18`).
    - `● Items with Count Variance` — Orange solid pill (`1`).
    - `● Items to Reorder` — Purple solid pill (`23`).
  - Total Inventory Value KPI block: `Total Inventory Value` + `₱493,583` with a `View all` link.
  - Header drag handle and collapsible toggle.
- **`components/InventoryMoreActionsCard.tsx`**:
  - Action items:
    - `Transfer Stock` (Sky blue filled button)
    - `Adjust Stock` (Sky blue filled button)
    - `Opening Stock` (Sky blue filled button)
    - `Reorder Levels` (Muted button with lock badge)
  - `View all` link, header drag handle, and collapsible toggle.

### 3. Recent Movements, Reports & Records / Ledgers Row
- **`components/InventoryRecentMovementsCard.tsx`**:
  - Chronological stock movement audit table with `Date`, `Item / SKU`, `Type`, `Qty` (with color-coded `+` green and `-` rose indicators), and `User` badges (`KVL`, `CAL`).
  - Header drag handle and collapsible toggle.
- **`components/InventoryReportsCard.tsx`**:
  - Curated Inventory report links (`Stock Availability & Valuation`, `Inventory Movement Summary`, `Stock Aging & Slow-Moving`, `Physical Count Variance Report`).
  - Header drag handle and collapsible toggle.
- **`components/InventoryRecordsLedgersCard.tsx`**:
  - 8-item launcher grid with high-resolution icons:
    - `Stock Ledger`, `Receipts History`, `Issuance History`, `Transfer Records`, `Stock Adjustments`, `Physical Counts`, `Low Stock Alert`, `Damaged / Written-off`.
  - Header drag handle and collapsible toggle.

---

## Interaction & UX Enhancements

### 1. Draggable Card Repositioning (`useInventoryCardOrder.ts`)
- **Native HTML5 Drag and Drop**: Lightweight drag reordering for the 6 modular cards in Rows 2 & 3.
- **Header-Targeted Drag Handles**: Subtle `GripVertical` icon in each card header with grab/grabbing cursor states.
- **Visual Feedback**: Dragged card opacity lowers to 35%, and target drop zones indicate drop targets with a subtle brown/amber ring.
- **Layout Persistence**: Custom card arrangements are persisted in `localStorage` under `simplebiz_inventory_card_order` with a `Reset layout` action in the page subheader.

### 2. Collapsible Accordion Cards (`inventory.css`)
- Pure CSS grid template row transition (`grid-template-rows: 1fr` ⇄ `0fr`) on `.card-collapsible-grid` for 0ms-delay layout animations with zero jitter.
- Rotation indicator on the `ChevronUp` / `ChevronDown` icons (`rotate-0` to `rotate-180`).

---

## Technical Specifications
- **Page Route**: `/inventory` (integrated into `AppRouter.tsx` and `navigation.ts`).
- **Design Tokens**: Warm wheat / tan palette (`#ecd9c8` card background, `#caa688` border, `#5c381e` text, `#7c5335` subtext).
- **Responsive Layout**: Mobile-first single column expanding smoothly to 3-column desktop layout (`lg:grid-cols-[1.1fr_1.4fr_1fr]`).
