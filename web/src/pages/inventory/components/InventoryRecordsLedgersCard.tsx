import { ChevronDown, GripVertical, LayoutGrid } from 'lucide-react'
import { useCardCollapse } from '../../../hooks/useCardCollapse'
import cartonImg from '../../../assets/icons/carton.png'
import receiveItemsImg from '../../../assets/icons/receive-items.png'
import truckImg from '../../../assets/icons/truck.png'
import purchaseReturnImg from '../../../assets/icons/purchase-return.png'
import penImg from '../../../assets/icons/pen.png'
import overdueImg from '../../../assets/icons/overdue-accounts.png'
import cashAccountsImg from '../../../assets/icons/cash-accounts.png'
import walletImg from '../../../assets/icons/wallet.png'

interface LedgerItem {
  id: string
  label: string
  icon: string
  href: string
}

const INVENTORY_LEDGERS: LedgerItem[] = [
  {
    id: 'stock-ledger',
    label: 'Stock Ledger',
    icon: cartonImg,
    href: '#stock-ledger',
  },
  {
    id: 'receipts-history',
    label: 'Receipts History',
    icon: receiveItemsImg,
    href: '#receipts-history',
  },
  {
    id: 'issuance-history',
    label: 'Issuance History',
    icon: truckImg,
    href: '#issuance-history',
  },
  {
    id: 'transfer-records',
    label: 'Transfer Records',
    icon: cashAccountsImg,
    href: '#transfer-records',
  },
  {
    id: 'stock-adjustments',
    label: 'Stock Adjustments',
    icon: penImg,
    href: '#stock-adjustments',
  },
  {
    id: 'physical-counts',
    label: 'Physical Counts',
    icon: purchaseReturnImg,
    href: '#physical-counts',
  },
  {
    id: 'low-stock-alert',
    label: 'Low Stock Alert',
    icon: overdueImg,
    href: '#low-stock-alert',
  },
  {
    id: 'damaged-written-off',
    label: 'Damaged / Written-off',
    icon: walletImg,
    href: '#damaged-written-off',
  },
]

interface Props {
  isDragging?: boolean
  isDragOver?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: () => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: () => void
}

export function InventoryRecordsLedgersCard({
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: Props) {
  const { isExpanded, toggle } = useCardCollapse(false)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`inventory-card-draggable w-full flex flex-col justify-between rounded-xl border border-[#72bee9] bg-white p-3.5 shadow-2xs transition-shadow duration-200 hover:shadow-xs ${
        isDragging ? 'is-dragging' : ''
      } ${isDragOver ? 'is-drag-over' : ''}`}
    >
      {/* Header */}
      <div>
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={toggle}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="drag-handle p-0.5 text-slate-300 hover:text-slate-600 transition shrink-0"
              title="Drag to reposition"
            >
              <GripVertical className="size-3.5" />
            </span>
            <LayoutGrid aria-hidden="true" className="size-5 text-slate-800 shrink-0" />
            <h2 className="text-[14px] font-bold text-slate-900 truncate">Records &amp; Ledgers</h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            aria-label={isExpanded ? 'Collapse Records & Ledgers' : 'Expand Records & Ledgers'}
            className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-300 ease-in-out ${
                isExpanded ? 'rotate-180 text-slate-600' : 'rotate-0 text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Collapsible 4-column Grid */}
        <div
          className={`card-collapse-grid ${
            isExpanded ? 'is-expanded' : 'is-collapsed'
          }`}
        >
          <div className="card-collapse-inner">
            <div className="mt-3 grid grid-cols-4 gap-2.5 py-1">
              {INVENTORY_LEDGERS.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="group flex flex-col items-center justify-center rounded-lg border border-transparent p-1.5 text-center transition hover:border-amber-200 hover:bg-amber-50/50"
                >
                  <div className="flex h-16 sm:h-18 w-full items-center justify-center">
                    <img
                      src={item.icon}
                      alt=""
                      aria-hidden="true"
                      className="h-14 sm:h-16 max-w-[72px] sm:max-w-[84px] object-contain transition duration-200 group-hover:scale-110 drop-shadow-xs"
                    />
                  </div>
                  <span className="mt-1 line-clamp-2 text-[11px] sm:text-[11.5px] font-medium leading-tight text-slate-800 group-hover:text-amber-800">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
