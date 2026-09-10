import { AlertTriangle, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'
import { useCardCollapse } from '../../../hooks/useCardCollapse'

interface AttentionItem {
  id: string
  count: number
  badgeColor: string
  title: string
  subtitle: string
  href: string
}

const ATTENTION_ITEMS: AttentionItem[] = [
  {
    id: 'reconciliation-needed',
    count: 5,
    badgeColor: 'bg-red-500 text-white',
    title: 'Reconciliation Needed',
    subtitle: '5 transactions totaling ₱5,750 are unmatched.',
    href: '#reconciliation-needed',
  },
  {
    id: 'cash-count-variances',
    count: 1,
    badgeColor: 'bg-red-500 text-white',
    title: 'Cash Count Variances',
    subtitle: 'Petty Cash is ₱1,250 short against the recorded balance.',
    href: '#cash-count-variances',
  },
  {
    id: 'low-balance-account',
    count: 1,
    badgeColor: 'bg-amber-500 text-white',
    title: 'Low-balance Account',
    subtitle: 'Petty Cash has ₱2,700 available — below the ₱5,000 minimum.',
    href: '#low-balance-account',
  },
  {
    id: 'pending-transfers',
    count: 7,
    badgeColor: 'bg-slate-500 text-white',
    title: 'Pending Transfers / Confirmation',
    subtitle: '7 transfers totaling ₱43,500 are awaiting confirmation.',
    href: '#pending-transfers',
  },
  {
    id: 'checks-due-funding',
    count: 3,
    badgeColor: 'bg-slate-500 text-white',
    title: 'Checks Due for Funding',
    subtitle: '3 checks totaling ₱50,580 are due within the next 7 days.',
    href: '#checks-due-funding',
  },
]

export function CashAccountsNeedsAttentionCard() {
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
            <AlertTriangle aria-hidden="true" className="size-5 text-slate-800 shrink-0" />
            <h2 className="text-[14px] font-bold text-slate-900 truncate">Needs Attention</h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-normal text-slate-500">17 items</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggle()
              }}
              aria-label={isExpanded ? 'Collapse Needs Attention' : 'Expand Needs Attention'}
              className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <ChevronDown
                className={`size-4 transition-transform duration-300 ease-in-out ${
                  isExpanded ? 'rotate-180 text-slate-600' : 'rotate-0 text-slate-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Collapsible Content Container */}
        <div
          className={`card-collapse-grid ${
            isExpanded ? 'is-expanded' : 'is-collapsed'
          }`}
        >
          <div className="card-collapse-inner">
            {/* List of items */}
            <div className="mt-2.5 space-y-1.5">
              {ATTENTION_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="group flex items-start gap-2.5 py-0.5 transition hover:opacity-85"
                >
                  {/* Circular Count Badge */}
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-none shadow-2xs ${item.badgeColor}`}
                  >
                    {item.count}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center text-[11.5px] font-bold text-slate-900 group-hover:text-lime-800">
                      <span className="truncate">{item.title}</span>
                      <ChevronRight className="size-3 shrink-0 ml-0.5 text-slate-400 group-hover:translate-x-0.5 group-hover:text-lime-800 transition" />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-none truncate mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Footer link */}
            <div className="mt-2 text-right">
              <a
                href="#all-cash-attention"
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
