import { useState, type DragEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import dashboardIcon from '../../assets/icons/dashboard.png'
import './dashboard.css'
import { DashboardActionCards } from './components/DashboardActionCards'
import { NeedsAttentionCard } from './components/NeedsAttentionCard'
import { ProfitLossOverviewCard } from './components/ProfitLossOverviewCard'
import { BusinessOverviewCard } from './components/BusinessOverviewCard'
import { RecentActivityCard } from './components/RecentActivityCard'
import { RecordsLedgersCard } from './components/RecordsLedgersCard'
import { MoreActionsCard } from './components/MoreActionsCard'
import { useDashboardOrder, type DashboardCardId } from '../../hooks/useDashboardOrder'

const CARD_COMPONENTS: Record<DashboardCardId, React.ComponentType> = {
  'needs-attention': NeedsAttentionCard,
  'profit-loss': ProfitLossOverviewCard,
  'business-overview': BusinessOverviewCard,
  'recent-activity': RecentActivityCard,
  'records-ledgers': RecordsLedgersCard,
  'more-actions': MoreActionsCard,
}

export function DashboardPage() {
  const {
    cardOrder,
    draggedId,
    dragOverId,
    isCustomOrder,
    setDraggedId,
    setDragOverId,
    moveCard,
    resetOrder,
  } = useDashboardOrder()

  const [canDrag, setCanDrag] = useState<DashboardCardId | null>(null)

  const handleDragStart = (e: DragEvent, id: DashboardCardId) => {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedId(id)
  }

  const handleDragOver = (e: DragEvent, id: DashboardCardId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverId !== id) {
      setDragOverId(id)
    }
  }

  const handleDragEnter = (e: DragEvent, id: DashboardCardId) => {
    e.preventDefault()
    if (dragOverId !== id) {
      setDragOverId(id)
    }
  }

  const handleDragLeave = (e: DragEvent, id: DashboardCardId) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    if (dragOverId === id) {
      setDragOverId(null)
    }
  }

  const handleDrop = (e: DragEvent, targetId: DashboardCardId) => {
    e.preventDefault()
    const sourceId = (e.dataTransfer.getData('text/plain') as DashboardCardId) || draggedId
    if (sourceId && sourceId !== targetId) {
      moveCard(sourceId, targetId)
    }
    setDraggedId(null)
    setDragOverId(null)
    setCanDrag(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
    setCanDrag(null)
  }

  const renderCardSlot = (cardId: DashboardCardId) => {
    const Component = CARD_COMPONENTS[cardId]
    const isDragging = draggedId === cardId
    const isDragOver = dragOverId === cardId

    return (
      <div
        key={cardId}
        draggable={canDrag === cardId}
        onDragStart={(e) => handleDragStart(e, cardId)}
        onDragOver={(e) => handleDragOver(e, cardId)}
        onDragEnter={(e) => handleDragEnter(e, cardId)}
        onDragLeave={(e) => handleDragLeave(e, cardId)}
        onDrop={(e) => handleDrop(e, cardId)}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setCanDrag(cardId)}
        onMouseLeave={() => {
          if (!draggedId) setCanDrag(null)
        }}
        className={`dashboard-card-draggable h-full ${
          isDragging ? 'is-dragging' : ''
        } ${isDragOver ? 'is-drag-over' : ''}`}
      >
        <Component />
      </div>
    )
  }

  const row2Cards = cardOrder.slice(0, 3)
  const row3Cards = cardOrder.slice(3, 6)

  return (
    <div className="w-full space-y-3.5 pb-4">
      {/* Page Header */}
      <header className="animate-dashboard-header flex flex-col gap-2 pt-0.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={dashboardIcon}
            alt=""
            aria-hidden="true"
            className="size-8 shrink-0 object-contain sm:size-9"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Dashboard
            </h1>
            <p className="text-xs text-slate-600 sm:text-[13px]">
              Monitor your business, manage daily activities, and act on what needs attention.
            </p>
          </div>
        </div>

        {/* Reset Layout button (shown when card positions have been customized) */}
        {isCustomOrder && (
          <button
            type="button"
            onClick={resetOrder}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-2xs transition hover:border-sky-300 hover:bg-sky-50/60 hover:text-[#0288d1] active:scale-95 cursor-pointer"
            title="Restore cards to default layout"
          >
            <RotateCcw className="size-3.5 text-slate-400" />
            <span>Reset layout</span>
          </button>
        )}
      </header>

      {/* Row 1: Primary Action Cards (Sales, Collections, Purchases, Payments, Inventory) */}
      <section
        className="animate-dashboard-row-1"
        aria-label="Core Business Action Cards"
      >
        <DashboardActionCards />
      </section>

      {/* Row 2: Repositionable Cards Slot 1, 2, 3 */}
      <section
        className="animate-dashboard-row-2 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.1fr_1.4fr_1fr]"
        aria-label="Operational Insights and Key Indicators"
      >
        {row2Cards.map(renderCardSlot)}
      </section>

      {/* Row 3: Repositionable Cards Slot 4, 5, 6 */}
      <section
        className="animate-dashboard-row-3 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.1fr_1.4fr_1fr]"
        aria-label="Recent Activities and Fast Actions"
      >
        {row3Cards.map(renderCardSlot)}
      </section>
    </div>
  )
}

