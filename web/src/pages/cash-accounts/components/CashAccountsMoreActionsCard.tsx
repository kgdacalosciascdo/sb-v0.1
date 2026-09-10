import {
  ArrowLeftRight,
  Calculator,
  ChevronDown,
  GripVertical,
  Landmark,
  PlusSquare,
  Smartphone,
} from 'lucide-react'
import { useCardCollapse } from '../../../hooks/useCardCollapse'

interface ActionItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const ACTION_ITEMS: ActionItem[] = [
  {
    id: 'manage-cash-accounts',
    label: 'Manage Cash Accounts',
    icon: Landmark,
    href: '#manage-cash-accounts',
  },
  {
    id: 'deposit-withdraw',
    label: 'Deposit / Withdraw',
    icon: PlusSquare,
    href: '#deposit-withdraw',
  },
  {
    id: 'cash-count',
    label: 'Cash Count',
    icon: Calculator,
    href: '#cash-count',
  },
  {
    id: 'reconcile',
    label: 'Reconcile',
    icon: ArrowLeftRight,
    href: '#reconcile',
  },
]

export function CashAccountsMoreActionsCard() {
  const { isExpanded, isFullHeight, toggle } = useCardCollapse(true)

  return (
    <div
      className={`w-full flex flex-col justify-between rounded-xl border border-[#72bee9] bg-white p-3.5 shadow-2xs transition-shadow duration-200 hover:shadow-xs ${
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
            <Smartphone aria-hidden="true" className="size-5 text-slate-800 shrink-0" />
            <h2 className="text-[14px] font-bold text-slate-900 truncate">More Actions</h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            aria-label={isExpanded ? 'Collapse More Actions' : 'Expand More Actions'}
            className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-300 ease-in-out ${
                isExpanded ? 'rotate-180 text-slate-600' : 'rotate-0 text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Collapsible Content */}
        <div
          className={`card-collapse-grid ${
            isExpanded ? 'is-expanded' : 'is-collapsed'
          }`}
        >
          <div className="card-collapse-inner">
            <div className="mt-3 flex flex-col gap-2">
              {ACTION_ITEMS.map((item) => {
                const Icon = item.icon

                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className="group flex items-center justify-between rounded-lg border border-sky-300 bg-sky-100/80 px-3 py-2 text-xs font-medium text-slate-800 shadow-2xs transition hover:border-sky-400 hover:bg-sky-200/90 active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="size-4 text-[#0288d1] shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* Footer link */}
            <div className="mt-2 text-right">
              <a
                href="#all-cash-actions"
                className="text-[11px] font-medium text-[#0288d1] transition hover:underline"
              >
                View all
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
