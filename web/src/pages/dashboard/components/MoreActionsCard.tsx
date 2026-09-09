import { ChevronDown, Layers, Banknote, HandCoins, Receipt, GripVertical } from 'lucide-react'
import { useCardCollapse } from '../../../hooks/useCardCollapse'

interface ActionShortcut {
  id: string
  label: string
  icon: typeof Banknote
  href: string
}

const SHORTCUTS: ActionShortcut[] = [
  {
    id: 'cash-remittance',
    label: 'Cash Remittance',
    icon: Banknote,
    href: '#cash-remittance',
  },
  {
    id: 'receive-payment',
    label: 'Receive Payment',
    icon: HandCoins,
    href: '#receive-payment',
  },
  {
    id: 'new-cash-sale',
    label: 'New Cash Sale',
    icon: Receipt,
    href: '#new-cash-sale',
  },
]

export function MoreActionsCard() {
  const { isExpanded, isFullHeight, toggle } = useCardCollapse(true)

  return (
    <div
      className={`w-full flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-shadow duration-200 hover:shadow-sm ${
        isFullHeight ? 'h-full' : 'h-auto self-start'
      }`}
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
            <Layers aria-hidden="true" className="size-5 text-slate-800 shrink-0" />
            <h2 className="text-[14px] font-bold text-slate-900 truncate">More Actions</h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            aria-label={isExpanded ? 'Collapse More Actions' : 'Expand More Actions'}
            className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-300 ease-in-out ${
                isExpanded ? 'rotate-180 text-slate-600' : 'rotate-0 text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Collapsible List of Action Buttons */}
        <div
          className={`card-collapse-grid ${
            isExpanded ? 'is-expanded' : 'is-collapsed'
          }`}
        >
          <div className="card-collapse-inner">
            <div className="mt-3.5 flex flex-col gap-2.5">
              {SHORTCUTS.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className="group flex items-center gap-3 rounded-lg border border-slate-200/90 bg-white px-3.5 py-3 text-xs font-semibold text-slate-800 shadow-2xs transition hover:border-[#0288d1] hover:bg-sky-50/50 hover:text-[#0288d1] active:scale-[0.99]"
                  >
                    <div className="grid size-6 place-items-center rounded text-slate-500 group-hover:text-[#0288d1]">
                      <Icon className="size-5" />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

