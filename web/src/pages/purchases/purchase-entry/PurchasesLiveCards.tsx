import type { ReactNode } from 'react'
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  GripVertical,
  LayoutList,
  ListFilter,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCardCollapse } from '../../../hooks/useCardCollapse'
import { useCountUp } from '../../../hooks/useCountUp'
import { peso } from './api'
import { usePurchaseOverview } from './usePurchaseOverview'

function LiveCard({
  title,
  icon,
  badge,
  children,
  expanded = true,
}: {
  title: string
  icon: ReactNode
  badge?: ReactNode
  children: ReactNode
  expanded?: boolean
}) {
  const { isExpanded, isFullHeight, toggle } = useCardCollapse(expanded)

  return (
    <div
      className={`w-full flex flex-col justify-between rounded-xl border border-[#72bee9] bg-white p-3.5 shadow-2xs transition-shadow duration-200 hover:shadow-xs ${
        isFullHeight ? 'h-full' : 'h-auto self-start'
      }`}
    >
      <div>
        {/* Header */}
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={toggle}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="drag-handle p-0.5 text-slate-300 hover:text-slate-600 transition shrink-0 cursor-grab active:cursor-grabbing"
              title="Drag to reposition"
            >
              <GripVertical className="size-3.5" />
            </span>
            {icon}
            <h2 className="text-[14px] font-bold text-slate-900 truncate">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {badge}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                toggle()
              }}
              aria-label={isExpanded ? `Collapse ${title}` : `Expand ${title}`}
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
          <div className="card-collapse-inner pt-3">{children}</div>
        </div>
      </div>
    </div>
  )
}

function Amount({ value }: { value: number }) {
  const number = useCountUp(value / 100, {
    isCurrency: true,
    prefix: '₱',
    duration: 800,
  })
  return <>{number}</>
}

export function PurchasesLiveOverviewCard() {
  const { data, error, loading } = usePurchaseOverview()
  const metrics = [
    {
      label: 'Purchases This Month',
      value: data?.purchases_month_cents || 0,
      color: '#1976d2',
    },
    {
      label: 'Supplier Payments This Month',
      value: data?.payments_month_cents || 0,
      color: '#e53935',
    },
    {
      label: 'Outstanding Payables',
      value: data?.outstanding_cents || 0,
      color: '#fb8c00',
    },
    {
      label: 'Overdue Payables',
      value: data?.overdue_cents || 0,
      color: '#388e3c',
    },
  ]
  const maximum = Math.max(1, ...metrics.map((m) => m.value))

  return (
    <LiveCard
      title="Overview"
      icon={<LayoutList aria-hidden="true" className="size-5 text-slate-800 shrink-0" />}
    >
      {error && <p role="alert" className="text-xs text-rose-600 font-semibold">{error}</p>}
      {loading ? (
        <p role="status" className="text-xs text-slate-500 italic py-2">Fetching purchase totals…</p>
      ) : (
        !error &&
        data && (
          <div className="space-y-3">
            {metrics.map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 font-medium">{m.label}</span>
                  <strong className="text-slate-900 font-bold font-mono">
                    <Amount value={m.value} />
                  </strong>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(m.value > 0 ? 4 : 0, (m.value / maximum) * 100))}%`,
                      background: m.color,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                className="text-xs font-semibold text-[#0369a1] hover:underline"
                to="/purchases/history"
              >
                View Purchase History →
              </Link>
            </div>
          </div>
        )
      )}
    </LiveCard>
  )
}

export function PurchasesLiveAttentionCard() {
  const { data, error, loading } = usePurchaseOverview()
  const items = [
    {
      id: 'payables-due-today',
      label: 'Payables due today',
      count: data?.due_today_count || 0,
      urgent: true,
    },
    {
      id: 'overdue-supplier-balances',
      label: 'Overdue supplier balances',
      count: data?.overdue_count || 0,
      urgent: true,
    },
    {
      id: 'due-next-7-days',
      label: 'Due in the next 7 days',
      count: data?.due_soon_count || 0,
      urgent: false,
    },
    {
      id: 'pending-checks',
      label: 'Pending post-dated checks',
      count: data?.pending_check_count || 0,
      urgent: false,
    },
  ]

  const totalCount =
    (data?.due_today_count || 0) +
    (data?.overdue_count || 0) +
    (data?.due_soon_count || 0) +
    (data?.pending_check_count || 0)

  return (
    <LiveCard
      title="Needs Attention"
      icon={<AlertTriangle aria-hidden="true" className="size-5 text-slate-800 shrink-0" />}
      badge={
        totalCount > 0 ? (
          <span className="text-xs font-normal text-slate-500">
            {totalCount} item{totalCount === 1 ? '' : 's'}
          </span>
        ) : undefined
      }
    >
      {error && <p role="alert" className="text-xs text-rose-600 font-semibold">{error}</p>}
      {loading ? (
        <p role="status" className="text-xs text-slate-500 italic py-2">Fetching supplier balances…</p>
      ) : (
        !error &&
        data && (
          <div>
            <div className="space-y-1.5">
              {items.map((i) => (
                <Link
                  key={i.id}
                  to="/purchases/payables"
                  className="group flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold leading-none shadow-2xs ${
                        i.count > 0
                          ? i.urgent
                            ? 'bg-[#e53935] text-white'
                            : 'bg-[#f57c00] text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {i.count}
                    </span>
                    <span className="truncate text-slate-800 font-medium group-hover:text-[#0288d1] transition">
                      {i.label}
                    </span>
                  </div>
                  <ChevronRight className="size-3.5 text-slate-400 shrink-0 group-hover:translate-x-0.5 group-hover:text-[#0288d1] transition" />
                </Link>
              ))}
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <Link
                to="/purchases/entry"
                className="text-[11.5px] font-medium text-[#0369a1] hover:underline"
              >
                {data.draft_count || 0} saved purchase draft{data.draft_count === 1 ? '' : 's'}
              </Link>
              <Link
                to="/purchases/payables"
                className="text-[11px] font-medium text-[#0288d1] hover:underline"
              >
                View all →
              </Link>
            </div>
          </div>
        )
      )}
    </LiveCard>
  )
}

export function PurchasesLiveActivityCard() {
  const { data, error, loading } = usePurchaseOverview()

  return (
    <LiveCard
      title="Recent Activity"
      icon={<ListFilter aria-hidden="true" className="size-5 text-slate-800 shrink-0" />}
      expanded={false}
    >
      {error && <p role="alert" className="text-xs text-rose-600 font-semibold">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold">
              <th className="py-1.5 pr-2">Date</th>
              <th className="py-1.5 px-2">Purchase / Supplier</th>
              <th className="py-1.5 pl-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={3} role="status" className="py-3 text-center text-slate-400 italic">
                  Fetching purchases…
                </td>
              </tr>
            )}
            {!loading &&
              data?.recent.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2 pr-2 text-slate-600 whitespace-nowrap">{r.date}</td>
                  <td className="py-2 px-2">
                    <Link
                      to="/purchases/history"
                      className="text-sky-700 hover:underline font-semibold block"
                    >
                      {r.number}
                    </Link>
                    <span className="text-[11px] text-slate-500 block truncate max-w-[140px]">
                      {r.supplier}
                    </span>
                  </td>
                  <td className="py-2 pl-2 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {peso(r.amount_cents)}
                  </td>
                </tr>
              ))}
            {!loading && !error && data && !data.recent.length && (
              <tr>
                <td colSpan={3} className="py-3 text-center text-slate-400 italic">
                  No purchases recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </LiveCard>
  )
}
