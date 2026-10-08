import type { ReactNode } from 'react'
import { ChevronDown, GripVertical } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCardCollapse } from '../../../hooks/useCardCollapse'
import { useCountUp } from '../../../hooks/useCountUp'
import { peso } from './api'
import { usePurchaseOverview } from './usePurchaseOverview'

function LiveCard({
  title,
  children,
  expanded = true,
}: {
  title: string
  children: ReactNode
  expanded?: boolean
}) {
  const { isExpanded, isFullHeight, toggle } = useCardCollapse(expanded)
  return (
    <section
      className={`purchase-live-panel ${isFullHeight ? 'h-full' : 'h-auto self-start'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GripVertical className="drag-handle size-4 text-slate-400" />
          <h2 className="!mb-0">{title}</h2>
        </div>
        <button
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title}`}
          onClick={toggle}
        >
          <ChevronDown size={16} className={isExpanded ? 'rotate-180' : ''} />
        </button>
      </div>
      <div
        className={`card-collapse-grid ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}
      >
        <div className="card-collapse-inner pt-3">{children}</div>
      </div>
    </section>
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
    <LiveCard title="Overview">
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p role="status">Fetching purchase totals…</p>
      ) : (
        !error &&
        data && (
          <div className="space-y-3">
            {metrics.map((m) => (
              <div key={m.label}>
                <div className="flex justify-between gap-2">
                  <span>{m.label}</span>
                  <strong>
                    <Amount value={m.value} />
                  </strong>
                </div>
                <div className="mt-1 h-2 rounded bg-slate-100">
                  <div
                    className="h-full rounded transition-[width] duration-700"
                    style={{
                      width: `${(m.value / maximum) * 100}%`,
                      background: m.color,
                    }}
                  />
                </div>
              </div>
            ))}
            <Link
              className="block pt-2 font-semibold text-sky-700"
              to="/purchases/history"
            >
              View Purchase History →
            </Link>
          </div>
        )
      )}
    </LiveCard>
  )
}
export function PurchasesLiveAttentionCard() {
  const { data, error, loading } = usePurchaseOverview()
  const items = [
    { label: 'Payables due today', count: data?.due_today_count || 0 },
    { label: 'Overdue supplier balances', count: data?.overdue_count || 0 },
    { label: 'Due in the next 7 days', count: data?.due_soon_count || 0 },
    {
      label: 'Pending post-dated checks',
      count: data?.pending_check_count || 0,
    },
  ]
  return (
    <LiveCard title="Needs Attention">
      {error && <p role="alert">{error}</p>}
      {loading ? (
        <p role="status">Fetching supplier balances…</p>
      ) : (
        !error &&
        data && (
          <div className="space-y-3">
            {items.map((i) => (
              <Link
                key={i.label}
                to="/purchases/payables"
                className="flex items-center gap-3"
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full font-bold ${i.count ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'}`}
                >
                  {i.count}
                </span>
                <span className="font-semibold">{i.label}</span>
              </Link>
            ))}
            <Link to="/purchases/entry" className="block text-sky-700">
              {data?.draft_count || 0} saved purchase drafts
            </Link>
          </div>
        )
      )}
    </LiveCard>
  )
}
export function PurchasesLiveActivityCard() {
  const { data, error, loading } = usePurchaseOverview()
  return (
    <LiveCard title="Recent Activity" expanded={false}>
      {error && <p role="alert">{error}</p>}
      <div className="purchase-live-scroll">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Purchase / Supplier</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} role="status">
                  Fetching purchases…
                </td>
              </tr>
            )}
            {!loading &&
              data?.recent.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td>
                  <td>
                    <Link to="/purchases/history">
                      {r.number}
                      <small className="block">{r.supplier}</small>
                    </Link>
                  </td>
                  <td>{peso(r.amount_cents)}</td>
                </tr>
              ))}
            {!loading && !error && data && !data.recent.length && (
              <tr>
                <td colSpan={3}>No purchases recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </LiveCard>
  )
}
