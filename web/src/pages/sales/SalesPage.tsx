import { useState, type DragEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import cashierIcon from '../../assets/icons/cashier.png'
import './sales.css'
import { SalesActionCards } from './components/SalesActionCards'
import { SalesNeedsAttentionCard } from './components/SalesNeedsAttentionCard'
import { SalesOverviewCard } from './components/SalesOverviewCard'
import { SalesMoreActionsCard } from './components/SalesMoreActionsCard'
import { SalesRecentActivityCard } from './components/SalesRecentActivityCard'
import { SalesReportsCard } from './components/SalesReportsCard'
import { SalesRecordsLedgersCard } from './components/SalesRecordsLedgersCard'
import { useSalesCardOrder, type SalesCardId } from '../../hooks/useSalesCardOrder'

const CARD_COMPONENTS: Record<SalesCardId, React.ComponentType> = {
  'needs-attention': SalesNeedsAttentionCard,
  'overview': SalesOverviewCard,
  'more-actions': SalesMoreActionsCard,
  'recent-activity': SalesRecentActivityCard,
  'reports': SalesReportsCard,
  'records-ledgers': SalesRecordsLedgersCard,
}

export function SalesPage() {
  const {
    cardOrder,
    draggedId,
    dragOverId,
    isCustomOrder,
    setDraggedId,
    setDragOverId,
    moveCard,
    resetOrder,
  } = useSalesCardOrder()

  const [canDrag, setCanDrag] = useState<SalesCardId | null>(null)

  const handleDragStart = (e: DragEvent, id: SalesCardId) => {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedId(id)
  }

  const handleDragOver = (e: DragEvent, id: SalesCardId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverId !== id) {
      setDragOverId(id)
    }
  }

  const handleDragEnter = (e: DragEvent, id: SalesCardId) => {
    e.preventDefault()
    if (dragOverId !== id) {
      setDragOverId(id)
    }
  }

  const handleDragLeave = (e: DragEvent, id: SalesCardId) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    if (dragOverId === id) {
      setDragOverId(null)
    }
  }

  const handleDrop = (e: DragEvent, targetId: SalesCardId) => {
    e.preventDefault()
    const sourceId = (e.dataTransfer.getData('text/plain') as SalesCardId) || draggedId
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

  const renderCardSlot = (cardId: SalesCardId) => {
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
        className={`sales-card-draggable h-full ${
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
      <header className="animate-sales-header flex flex-col gap-2 pt-0.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={cashierIcon}
            alt=""
            aria-hidden="true"
            className="size-8 shrink-0 object-contain sm:size-9"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Sales &amp; Receivables
            </h1>
            <p className="text-xs text-slate-600 sm:text-[13px]">
              Create sales, collect payments, follow up what&apos;s due, and manage customers.
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

      {/* Row 1: Primary Action Cards (Cash Sales, Credit Sales, Customer, Collections, Cash Remittance) */}
      <section
        className="animate-sales-row-1"
        aria-label="Sales Primary Action Cards"
      >
        <SalesActionCards />
      </section>

      {/* Row 2: Repositionable Cards Slot 1, 2, 3 */}
      <section
        className="animate-sales-row-2 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.1fr_1.4fr_1fr]"
        aria-label="Sales Insights and Indicators"
      >
        {row2Cards.map(renderCardSlot)}
      </section>

      {/* Row 3: Repositionable Cards Slot 4, 5, 6 */}
      <section
        className="animate-sales-row-3 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.1fr_1.4fr_1fr]"
        aria-label="Sales Activities and Ledgers"
      >
        {row3Cards.map(renderCardSlot)}
      </section>
    </div>
  )
}
