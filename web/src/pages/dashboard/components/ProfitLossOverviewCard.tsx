import { useState, useEffect } from 'react'
import { ChevronDown, TrendingUp, GripVertical } from 'lucide-react'
import { useCountUp } from '../../../hooks/useCountUp'
import { useCardCollapse } from '../../../hooks/useCardCollapse'

function AnimatedNumber({
  target,
  delay = 0,
  duration = 900,
  prefix = '',
  suffix = '',
  isCurrency = false,
  isNegative = false,
}: {
  target: number
  delay?: number
  duration?: number
  prefix?: string
  suffix?: string
  isCurrency?: boolean
  isNegative?: boolean
}) {
  const value = useCountUp(target, { delay, duration, prefix, suffix, isCurrency, isNegative })
  return <>{value}</>
}

export function ProfitLossOverviewCard() {
  const { isExpanded, isFullHeight, toggle } = useCardCollapse(true)
  const [isAnimated, setIsAnimated] = useState(false)

  useEffect(() => {
    // Trigger graph animation shortly after mounting
    const timer = setTimeout(() => setIsAnimated(true), 60)
    return () => clearTimeout(timer)
  }, [])

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
            {/* Custom Mini Bar Icon */}
            <div className="flex items-end gap-0.5 text-slate-800 shrink-0">
              <span className="h-2.5 w-1 rounded-2xs bg-slate-800" />
              <span className="h-4 w-1 rounded-2xs bg-slate-800" />
              <span className="h-3 w-1 rounded-2xs bg-slate-800" />
            </div>
            <h2 className="text-[14px] font-bold text-slate-900 truncate">Profit &amp; Loss Overview</h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            aria-label={isExpanded ? 'Collapse Profit & Loss' : 'Expand Profit & Loss'}
            className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-300 ease-in-out ${
                isExpanded ? 'rotate-180 text-slate-600' : 'rotate-0 text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Collapsible Content with Smooth Transition */}
        <div
          className={`card-collapse-grid ${
            isExpanded ? 'is-expanded' : 'is-collapsed'
          }`}
        >
          <div className="card-collapse-inner">
            {/* Stepped Waterfall Breakdown Bars */}
            <div className="mt-3.5 flex flex-col gap-3.5">
              {/* 1. Net Sales */}
              <div className="grid grid-cols-[1.25fr_1.75fr_0.9fr] items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#1e88e5]" />
                  <span className="truncate text-[11px] font-medium text-slate-700">Net Sales</span>
                </div>
                <div className="relative flex h-5 w-full items-center">
                  {/* 100% Full Bar */}
                  <div
                    style={{
                      width: isAnimated ? '100%' : '0%',
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
                    }}
                    className="flex h-full items-center justify-center rounded-xs bg-[#1e88e5] text-[10px] font-bold text-white shadow-2xs overflow-hidden"
                  >
                    <AnimatedNumber target={100} delay={100} duration={800} suffix="%" />
                  </div>
                </div>
                <div className="text-right text-[11px] font-semibold text-slate-900">
                  <AnimatedNumber target={493583} delay={100} duration={800} isCurrency prefix="₱" />
                </div>
              </div>

              {/* 2. Less: Cost of Goods Sold */}
              <div className="grid grid-cols-[1.25fr_1.75fr_0.9fr] items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#e53935]" />
                  <span className="truncate text-[11px] font-medium text-slate-700">Less: Cost of Goods Sold</span>
                </div>
                <div className="relative flex h-5 w-full items-center">
                  {/* Dashed connector from Net Sales */}
                  <span
                    style={{
                      opacity: isAnimated ? 1 : 0,
                      transition: 'opacity 0.4s ease 0.3s',
                    }}
                    className="absolute left-[51%] -top-3.5 h-3.5 w-0 border-l border-dashed border-slate-400"
                  />
                  {/* 49% Bar */}
                  <div
                    style={{
                      width: isAnimated ? '49%' : '0%',
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s',
                    }}
                    className="relative ml-[51%] flex h-full items-center justify-center rounded-xs bg-[#e53935] text-[10px] font-bold text-white shadow-2xs overflow-hidden"
                  >
                    <AnimatedNumber target={49} delay={300} duration={800} suffix="%" />
                  </div>
                </div>
                <div className="text-right text-[11px] font-semibold text-slate-600">
                  <AnimatedNumber target={240124} delay={300} duration={800} isCurrency prefix="₱" isNegative />
                </div>
              </div>

              {/* 3. Gross Profit */}
              <div className="grid grid-cols-[1.25fr_1.75fr_0.9fr] items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#43a047]" />
                  <span className="truncate text-[11px] font-medium text-slate-700">Gross Profit</span>
                </div>
                <div className="relative flex h-5 w-full items-center">
                  {/* Dashed connector from COGS */}
                  <span
                    style={{
                      opacity: isAnimated ? 1 : 0,
                      transition: 'opacity 0.4s ease 0.5s',
                    }}
                    className="absolute left-[51%] -top-3.5 h-3.5 w-0 border-l border-dashed border-slate-400"
                  />
                  {/* 51% Bar */}
                  <div
                    style={{
                      width: isAnimated ? '49%' : '0%',
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
                    }}
                    className="relative ml-[51%] flex h-full items-center justify-center rounded-xs bg-[#43a047] text-[10px] font-bold text-white shadow-2xs overflow-hidden"
                  >
                    <AnimatedNumber target={51} delay={500} duration={800} suffix="%" />
                  </div>
                </div>
                <div className="text-right text-[11px] font-semibold text-slate-900">
                  <AnimatedNumber target={253459} delay={500} duration={800} isCurrency prefix="₱" />
                </div>
              </div>

              {/* 4. Less: Operating Expenses */}
              <div className="grid grid-cols-[1.25fr_1.75fr_0.9fr] items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#fb8c00]" />
                  <span className="truncate text-[11px] font-medium text-slate-700">Less: Operating Expenses</span>
                </div>
                <div className="relative flex h-5 w-full items-center">
                  {/* Dashed connector from Gross Profit */}
                  <span
                    style={{
                      opacity: isAnimated ? 1 : 0,
                      transition: 'opacity 0.4s ease 0.7s',
                    }}
                    className="absolute left-[69%] -top-3.5 h-3.5 w-0 border-l border-dashed border-slate-400"
                  />
                  {/* 31% Bar */}
                  <div
                    style={{
                      width: isAnimated ? '31%' : '0%',
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.7s',
                    }}
                    className="relative ml-[69%] flex h-full items-center justify-center rounded-xs bg-[#fb8c00] text-[10px] font-bold text-white shadow-2xs overflow-hidden"
                  >
                    <AnimatedNumber target={31} delay={700} duration={800} suffix="%" />
                  </div>
                </div>
                <div className="text-right text-[11px] font-semibold text-slate-600">
                  <AnimatedNumber target={153642} delay={700} duration={800} isCurrency prefix="₱" isNegative />
                </div>
              </div>

              {/* 5. Net Profit */}
              <div className="grid grid-cols-[1.25fr_1.75fr_0.9fr] items-center gap-2 text-xs">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="size-2.5 shrink-0 rounded-full bg-[#fbc02d]" />
                  <span className="truncate text-[11px] font-medium text-slate-700">Net Profit</span>
                </div>
                <div className="relative flex h-5 w-full items-center">
                  {/* Dashed connector from OpEx */}
                  <span
                    style={{
                      opacity: isAnimated ? 1 : 0,
                      transition: 'opacity 0.4s ease 0.9s',
                    }}
                    className="absolute left-[80%] -top-3.5 h-3.5 w-0 border-l border-dashed border-slate-400"
                  />
                  {/* 20% Bar */}
                  <div
                    style={{
                      width: isAnimated ? '20%' : '0%',
                      transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.9s',
                    }}
                    className="relative ml-[80%] flex h-full items-center justify-center rounded-xs bg-[#fbc02d] text-[10px] font-bold text-slate-900 shadow-2xs overflow-hidden"
                  >
                    <AnimatedNumber target={20} delay={900} duration={800} suffix="%" />
                  </div>
                </div>
                <div className="text-right text-[11px] font-semibold text-slate-900">
                  <AnimatedNumber target={99817} delay={900} duration={800} isCurrency prefix="₱" />
                </div>
              </div>
            </div>

            {/* Bottom Summary Callout & View Report */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="grid size-8 place-items-center rounded-lg bg-sky-50 text-[#1e88e5]">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <div className="text-[10px] font-medium text-slate-500">Net Profit This Month</div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[14px] font-bold text-slate-900">
                      <AnimatedNumber target={99817} delay={500} duration={1000} isCurrency prefix="₱" />
                    </span>
                    <span className="text-[10px] text-slate-500">12.6% increase vs last month</span>
                  </div>
                </div>
              </div>

              <a
                href="#profit-loss-report"
                className="text-[11px] font-medium text-[#1e88e5] transition hover:underline whitespace-nowrap"
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



