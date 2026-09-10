import { useState, type DragEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import cashAccountsIcon from '../../assets/icons/cash-accounts.png'
import './cash-accounts.css'
import { CashAccountsActionCards } from './components/CashAccountsActionCards'
import { CashAccountsNeedsAttentionCard } from './components/CashAccountsNeedsAttentionCard'
import { CashAccountsOverviewCard } from './components/CashAccountsOverviewCard'
import { CashAccountsMoreActionsCard } from './components/CashAccountsMoreActionsCard'
import { CashAccountsRecentActivityCard } from './components/CashAccountsRecentActivityCard'
import { CashAccountsReportsCard } from './components/CashAccountsReportsCard'
import { CashAccountsRecordsLedgersCard } from './components/CashAccountsRecordsLedgersCard'
import { useCashAccountsCardOrder, type CashAccountsCardId } from '../../hooks/useCashAccountsCardOrder'

const CARD_COMPONENTS: Record<CashAccountsCardId, React.ComponentType> = {
  'needs-attention': CashAccountsNeedsAttentionCard,
  'overview': CashAccountsOverviewCard,
  'more-actions': CashAccountsMoreActionsCard,
  'recent-activity': CashAccountsRecentActivityCard,
  'reports': CashAccountsReportsCard,
  'records-ledgers': CashAccountsRecordsLedgersCard,
}

export function CashAccountsPage() {
  const {
    cardOrder,
    draggedId,
    dragOverId,
    isCustomOrder,
    setDraggedId,
    setDragOverId,
    moveCard,
    resetOrder,
  } = useCashAccountsCardOrder()

  const [canDrag, setCanDrag] = useState<CashAccountsCardId | null>(null)

  const handleDragStart = (e: DragEvent, id: CashAccountsCardId) => {
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
    setDraggedId(id)
  }

  const handleDragOver = (e: DragEvent, id: CashAccountsCardId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverId !== id) {
      setDragOverId(id)
    }
  }

  const handleDragEnter = (e: DragEvent, id: CashAccountsCardId) => {
    e.preventDefault()
    if (dragOverId !== id) {
      setDragOverId(id)
    }
  }

  const handleDragLeave = (e: DragEvent, id: CashAccountsCardId) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    if (dragOverId === id) {
      setDragOverId(null)
    }
  }

  const handleDrop = (e: DragEvent, targetId: CashAccountsCardId) => {
    e.preventDefault()
    const sourceId = (e.dataTransfer.getData('text/plain') as CashAccountsCardId) || draggedId
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

  const renderCardSlot = (cardId: CashAccountsCardId) => {
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
        className={`cash-accounts-card-draggable h-full ${
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
      <header className="animate-cash-accounts-header flex flex-col gap-2 pt-0.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={cashAccountsIcon}
            alt=""
            aria-hidden="true"
            className="size-8 shrink-0 object-contain sm:size-9"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Cash Accounts
            </h1>
            <p className="text-xs text-slate-600 sm:text-[13px]">
              Know where your business money is and how it moves.
            </p>
          </div>
        </div>

        {/* Reset Layout button (shown when card positions have been customized) */}
        {isCustomOrder && (
          <button
            type="button"
            onClick={resetOrder}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-2xs transition hover:border-lime-300 hover:bg-lime-50/60 hover:text-lime-800 active:scale-95 cursor-pointer"
            title="Restore cards to default layout"
          >
            <RotateCcw className="size-3.5 text-slate-400" />
            <span>Reset layout</span>
          </button>
        )}
      </header>

      {/* Row 1: Primary Action Cards (Cash In, Cash Out, Transfer Funds, Cash Remittance) */}
      <section
        className="animate-cash-accounts-row-1 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.1fr_1.4fr_1fr]"
        aria-label="Cash Accounts Primary Action Cards"
      >
        <div className="lg:col-span-2">
          <CashAccountsActionCards />
        </div>
      </section>

      {/* Row 2: Repositionable Cards Slot 1, 2, 3 */}
      <section
        className="animate-cash-accounts-row-2 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.1fr_1.4fr_1fr]"
        aria-label="Cash Accounts Insights and Indicators"
      >
        {row2Cards.map(renderCardSlot)}
      </section>

      {/* Row 3: Repositionable Cards Slot 4, 5, 6 */}
      <section
        className="animate-cash-accounts-row-3 grid grid-cols-1 gap-3.5 lg:grid-cols-[1.1fr_1.4fr_1fr]"
        aria-label="Cash Accounts Activities and Ledgers"
      >
        {row3Cards.map(renderCardSlot)}
      </section>
    </div>
  )
}
