import { ChevronDown, GripVertical, List } from 'lucide-react'
import { useCardCollapse } from '../../../hooks/useCardCollapse'

interface OverviewItem {
  id: string
  label: string
  dotColor: string
  barBg: string
  value: number | string
  pillWidth: string
}

const OVERVIEW_METRICS: OverviewItem[] = [
  {
    id: 'products-in-stock',
    label: 'Products in Stock',
    dotColor: '#1976d2',
    barBg: 'bg-[#1976d2]',
    value: 327,
    pillWidth: 'w-24 sm:w-28',
  },
  {
    id: 'low-stock',
    label: 'Low -stock Items',
    dotColor: '#dc2626',
    barBg: 'bg-[#dc2626]',
    value: 18,
    pillWidth: 'w-24 sm:w-28',
  },
  {
    id: 'count-variance',
    label: 'Items with Count Variance',
    dotColor: '#ea580c',
    barBg: 'bg-[#ea580c]',
    value: 1,
    pillWidth: 'w-24 sm:w-28',
  },
  {
    id: 'items-to-reorder',
    label: 'Items to Reorder',
    dotColor: '#9333ea',
    barBg: 'bg-[#9333ea]',
    value: 23,
    pillWidth: 'w-24 sm:w-28',
  },
]

export function InventoryOverviewCard() {
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
            <List aria-hidden="true" className="size-5 text-slate-800 shrink-0" />
            <h2 className="text-[14px] font-bold text-slate-900 truncate">Overview</h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            aria-label={isExpanded ? 'Collapse Overview' : 'Expand Overview'}
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
            <div className="mt-3.5 flex flex-col gap-2.5 sm:gap-3">
              {OVERVIEW_METRICS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.dotColor }}
                    />
                    <span className="text-slate-600 font-normal truncate text-[11px]">
                      {item.label}
                    </span>
                  </div>

                  <div
                    className={`flex items-center justify-center rounded-full ${item.barBg} ${item.pillWidth} py-0.5 px-3 text-[11.5px] font-bold text-white shadow-xs shrink-0`}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom KPI & Link */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-normal leading-tight">
                  Total Inventory Value
                </div>
                <div className="text-[16px] sm:text-[17px] font-bold text-slate-900 tracking-tight leading-none mt-0.5">
                  ₱493,583
                </div>
              </div>

              <a
                href="#inventory-valuation"
                className="text-[11px] font-medium text-[#0288d1] transition hover:underline whitespace-nowrap"
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
