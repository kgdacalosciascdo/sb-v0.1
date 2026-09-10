import { useState, useEffect } from 'react'
import { ChevronDown, GripVertical, LayoutList } from 'lucide-react'
import { useCountUp } from '../../../hooks/useCountUp'
import { useCardCollapse } from '../../../hooks/useCardCollapse'

function AnimatedNumber({
  target,
  delay = 0,
  duration = 900,
  prefix = '',
  suffix = '',
  isCurrency = false,
}: {
  target: number
  delay?: number
  duration?: number
  prefix?: string
  suffix?: string
  isCurrency?: boolean
}) {
  const value = useCountUp(target, { delay, duration, prefix, suffix, isCurrency })
  return <>{value}</>
}

interface OverviewMetric {
  id: string
  label: string
  amount: number
  dotColor: string
  barBgColor: string
  barWidthPercent: number
  delay: number
}

const METRICS: OverviewMetric[] = [
  {
    id: 'purchases-month',
    label: 'Purchases This Month',
    amount: 493583,
    dotColor: 'bg-[#1976d2]',
    barBgColor: 'bg-[#1976d2]',
    barWidthPercent: 72,
    delay: 100,
  },
  {
    id: 'supplier-payments-month',
    label: 'Supplier Payments This Month',
    amount: 176200,
    dotColor: 'bg-[#e53935]',
    barBgColor: 'bg-[#e53935]',
    barWidthPercent: 28,
    delay: 250,
  },
  {
    id: 'outstanding-payables',
    label: 'Outstanding Payables',
    amount: 84300,
    dotColor: 'bg-[#fb8c00]',
    barBgColor: 'bg-[#fb8c00]',
    barWidthPercent: 16,
    delay: 400,
  },
  {
    id: 'overdue-payables',
    label: 'Overdue Payables',
    amount: 312900,
    dotColor: 'bg-[#388e3c]',
    barBgColor: 'bg-[#388e3c]',
    barWidthPercent: 50,
    delay: 550,
  },
]

export function PurchasesOverviewCard() {
  const { isExpanded, isFullHeight, toggle } = useCardCollapse(true)
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 60)
    return () => clearTimeout(timer)
  }, [])

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
            <LayoutList aria-hidden="true" className="size-5 text-slate-800 shrink-0" />
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
            {/* Horizontal Bar Graph Section */}
            <div className="mt-3.5 flex flex-col gap-2.5 sm:gap-3">
              {METRICS.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-center gap-2 text-xs"
                >
                  {/* Left Label Column */}
                  <div className="flex w-[165px] sm:w-[175px] shrink-0 items-center gap-2 min-w-0">
                    <span className={`size-2.5 shrink-0 rounded-full ${metric.dotColor}`} />
                    <span className="truncate text-[11px] text-slate-600 font-normal">
                      {metric.label}
                    </span>
                  </div>

                  {/* Right Bar Graph Area with Value Attached to Bar Tip */}
                  <div className="flex-1 min-w-0 flex items-center">
                    <div
                      style={{
                        width: isAnimated ? `${metric.barWidthPercent}%` : '0%',
                        transition: `width 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${metric.delay / 1000}s`,
                      }}
                      className={`h-5 sm:h-5.5 rounded-xs shrink-0 ${metric.barBgColor}`}
                    />
                    <span className="ml-2 shrink-0 text-[11px] font-medium text-slate-600">
                      <AnimatedNumber
                        target={metric.amount}
                        delay={metric.delay}
                        duration={800}
                        isCurrency
                        prefix="₱"
                      />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Summary Callout & View Report */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* 3-bar trend graphic */}
                <svg
                  className="size-7 text-[#1976d2] shrink-0 drop-shadow-2xs"
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <rect x="3.5" y="14" width="3.5" height="11" rx="0.5" fill="#1976d2" />
                  <rect x="9.5" y="9" width="3.5" height="16" rx="0.5" fill="#1976d2" />
                  <rect x="15.5" y="4" width="3.5" height="21" rx="0.5" fill="#1976d2" />
                  <path
                    d="M2 19L8.5 11.5L13 16L22.5 6"
                    stroke="#0d47a1"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.5 6H22.5V11"
                    stroke="#0d47a1"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div>
                  <div className="text-[10px] text-slate-500 font-normal leading-tight">
                    Total Purchases This Month
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-[16px] sm:text-[17px] font-bold text-slate-900 tracking-tight leading-none">
                      <AnimatedNumber target={493583} delay={300} duration={1000} isCurrency prefix="₱" />
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      12.6% increase vs last month
                    </span>
                  </div>
                </div>
              </div>

              <a
                href="#purchases-report"
                className="text-[11px] font-medium text-[#1976d2] transition hover:underline whitespace-nowrap"
              >
                View report
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
