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
    id: 'cash-in-bank',
    label: 'Cash in Bank',
    amount: 493583,
    dotColor: 'bg-[#1976d2]',
    barBgColor: 'bg-[#1976d2]',
    barWidthPercent: 52,
    delay: 100,
  },
  {
    id: 'cash-in-vault',
    label: 'Cash in Vault',
    amount: 176200,
    dotColor: 'bg-[#e53935]',
    barBgColor: 'bg-[#e53935]',
    barWidthPercent: 22,
    delay: 250,
  },
  {
    id: 'cash-box-petty-cash',
    label: 'Cash Box / Petty Cash',
    amount: 84300,
    dotColor: 'bg-[#fb8c00]',
    barBgColor: 'bg-[#fb8c00]',
    barWidthPercent: 14,
    delay: 400,
  },
  {
    id: 'digital-wallet',
    label: 'Digital Wallet',
    amount: 312900,
    dotColor: 'bg-[#388e3c]',
    barBgColor: 'bg-[#388e3c]',
    barWidthPercent: 38,
    delay: 550,
  },
]

export function CashAccountsOverviewCard() {
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
                  <div className="flex w-[150px] sm:w-[160px] shrink-0 items-center gap-2 min-w-0">
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

            {/* Bottom Summary Callout & View All */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-normal leading-tight">
                  Total Cash Position
                </div>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-[16px] sm:text-[17px] font-bold text-slate-900 tracking-tight leading-none">
                    <AnimatedNumber target={1066983} delay={300} duration={1000} isCurrency prefix="₱" />
                  </span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    12.6% increase vs last month
                  </span>
                </div>
              </div>

              <a
                href="#cash-position"
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
