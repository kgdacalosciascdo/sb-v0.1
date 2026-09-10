import { type ReactNode } from 'react'
import { ChevronDown, ChevronRight, Info, GripVertical } from 'lucide-react'
import { useCountUp } from '../../../hooks/useCountUp'
import { useCardCollapse } from '../../../hooks/useCardCollapse'

function AnimatedAmount({
  target,
  delay = 0,
  duration = 900,
}: {
  target: number
  delay?: number
  duration?: number
}) {
  const value = useCountUp(target, { delay, duration, isCurrency: true, prefix: '₱' })
  return <>{value}</>
}

interface BusinessOverviewItem {
  id: string
  label: string
  amountValue: number
  delay: number
  icon: ReactNode
  href: string
}

export function BusinessOverviewCard() {
  const items: BusinessOverviewItem[] = [
    {
      id: 'sales-month',
      label: 'Sales This Month:',
      amountValue: 248600,
      delay: 150,
      icon: (
        <svg
          className="size-7 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 20v-5" />
          <path d="M11 20v-10" />
          <path d="M16 20v-7" />
          <path d="M3 16l6-6 4 3 7-7" />
          <path d="M16 6h4v4" />
        </svg>
      ),
      href: '#sales-overview',
    },
    {
      id: 'receivables',
      label: 'Receivables:',
      amountValue: 82400,
      delay: 350,
      icon: (
        <svg
          className="size-7 text-slate-500"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V21h19.2v-1.8c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      ),
      href: '#receivables-overview',
    },
    {
      id: 'overdue-collection',
      label: 'Overdue for Collection:',
      amountValue: 18750,
      delay: 550,
      icon: (
        <svg
          className="size-7 text-slate-500"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h5" />
          <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          <path d="M8 9h6" />
          <path d="M8 13h4" />
          <circle cx="17.5" cy="17.5" r="4.5" fill="white" stroke="currentColor" strokeWidth="2" />
          <path d="M17.5 15.5v2l1.2 1" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
      href: '#overdue-collection',
    },
    {
      id: 'outstanding-payables',
      label: 'Outstanding Payables:',
      amountValue: 12300,
      delay: 750,
      icon: (
        <svg
          className="size-7 text-slate-500"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8V21h19.2v-1.8c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      ),
      href: '#payables-overview',
    },
  ]

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
            <Info aria-hidden="true" className="size-5 text-slate-800 shrink-0" />
            <h2 className="text-[14px] font-bold text-slate-900 truncate">Business Overview</h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            aria-label={isExpanded ? 'Collapse Business Overview' : 'Expand Business Overview'}
            className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-300 ease-in-out ${
                isExpanded ? 'rotate-180 text-slate-600' : 'rotate-0 text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Metric Rows Container with Smooth Transition */}
        <div
          className={`card-collapse-grid ${
            isExpanded ? 'is-expanded' : 'is-collapsed'
          }`}
        >
          <div className="card-collapse-inner">
            <div className="mt-3.5 flex flex-col gap-2.5">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="group flex items-center justify-between py-1 transition hover:opacity-85"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Standalone large gray icon */}
                    <div className="shrink-0 flex items-center justify-center">
                      {item.icon}
                    </div>

                    {/* 2-line Label & Amount */}
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700">
                        {item.label}
                      </div>
                      <div className="text-[15px] font-bold tracking-tight text-slate-800">
                        <AnimatedAmount target={item.amountValue} delay={item.delay} />
                      </div>
                    </div>
                  </div>

                  {/* Right Chevron */}
                  <ChevronRight className="size-4 shrink-0 text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600 transition" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



