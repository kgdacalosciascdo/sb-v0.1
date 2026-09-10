import {
  ChevronDown,
  FileSpreadsheet,
  FileText,
  GripVertical,
  Lock,
  Receipt,
  Smartphone,
  Wallet,
} from 'lucide-react'
import { useCardCollapse } from '../../../hooks/useCardCollapse'

interface ActionItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isLocked?: boolean
  href: string
}

const ACTION_ITEMS: ActionItem[] = [
  {
    id: 'view-unpaid-expenses',
    label: 'View Unpaid Expenses',
    icon: Receipt,
    isLocked: false,
    href: '#view-unpaid-expenses',
  },
  {
    id: 'reimbursable-expenses',
    label: 'Reimbursable Expenses',
    icon: Wallet,
    isLocked: true,
    href: '#reimbursable-expenses',
  },
  {
    id: 'prepaid-expenses',
    label: 'Prepaid Expenses',
    icon: FileText,
    isLocked: true,
    href: '#prepaid-expenses',
  },
  {
    id: 'accrued-expenses',
    label: 'Accrued Expenses',
    icon: FileSpreadsheet,
    isLocked: true,
    href: '#accrued-expenses',
  },
]

export function ExpensesMoreActionsCard() {
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

                if (item.isLocked) {
                  return (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-100"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="size-4 text-slate-400 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <Lock className="size-3.5 text-slate-400 shrink-0" />
                    </div>
                  )
                }

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
                href="#all-expense-actions"
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
