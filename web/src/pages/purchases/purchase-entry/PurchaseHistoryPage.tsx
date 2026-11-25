import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, RefreshCw } from 'lucide-react'
import truckIcon from '../../../assets/icons/truck.png'
import { PurchaseDialog } from './PurchaseDialog'
import { PurchaseDocument } from './PurchaseDocument'
import {
  decimal,
  peso,
  PurchaseApiError,
  purchaseRequest,
  receivingLabels,
  today,
  type Overview,
  type PurchaseBootstrap,
  type PurchaseRecord,
  type PurchaseRow,
} from './api'

export function PurchaseHistoryPage() {
  const location = useLocation()
  const isPayables = location.pathname === '/purchases/payables'
  const overdueOnly =
    new URLSearchParams(location.search).get('overdue') === '1'
  const [page, setPage] = useState(1)
  const awaitingDelivery =
    !isPayables &&
    new URLSearchParams(location.search).get('awaiting_delivery') === '1'
  const [supplier, setSupplier] = useState(
    () => new URLSearchParams(location.search).get('supplier') || '',
  )
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<PurchaseRow[]>([])
  const [meta, setMeta] = useState({ total: 0, last_page: 1 })
  const [overview, setOverview] = useState<Overview | null>(null)
  const [bootstrap, setBootstrap] = useState<PurchaseBootstrap | null>(null)
  const [historyKey, setHistoryKey] = useState('')
  const [overviewVersion, setOverviewVersion] = useState(-1)
  const [historyError, setHistoryError] = useState('')
  const [overviewError, setOverviewError] = useState('')
  const [error, setError] = useState('')
  const [record, setRecord] = useState<PurchaseRecord | null>(null)
  const [payment, setPayment] = useState<PurchaseRecord | null>(null)
  const [busy, setBusy] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const requestKey = `${page}:${supplier}:${refresh}:${awaitingDelivery}`
  const loading = isPayables
    ? overviewVersion !== refresh
    : historyKey !== requestKey
  const fetchError = loading ? '' : isPayables ? overviewError : historyError
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Bank Transfer')
  const [account, setAccount] = useState('')
  const [reference, setReference] = useState('')
  const [date, setDate] = useState(today)
  const pending = useRef<{ path: string; body: string; key: string } | null>(
    null,
  )
  useEffect(() => {
    if (isPayables) return
    let active = true
    purchaseRequest<{ data: PurchaseRow[]; meta: typeof meta }>(
      `?page=${page}${supplier ? `&supplier_id=${encodeURIComponent(supplier)}` : ''}${awaitingDelivery ? '&awaiting_delivery=1' : ''}`,
    )
      .then((history) => {
        if (!active) return
        setRows(history.data)
        setMeta(history.meta)
        setHistoryError('')
      })
      .catch((e) => {
        if (active) setHistoryError(e.message)
      })
      .finally(() => {
        if (active) setHistoryKey(requestKey)
      })
    return () => {
      active = false
    }
  }, [page, supplier, refresh, requestKey, isPayables, awaitingDelivery])
  useEffect(() => {
    let active = true
    purchaseRequest<{ data: Overview }>('overview')
      .then((summary) => {
        if (active) {
          setOverview(summary.data)
          setOverviewError('')
        }
      })
      .catch((e) => {
        if (active) setOverviewError(e.message)
      })
      .finally(() => {
        if (active) setOverviewVersion(refresh)
      })
    purchaseRequest<{ data: PurchaseBootstrap }>('bootstrap')
      .then((options) => {
        if (active) setBootstrap(options.data)
      })
      .catch((e) => {
        if (active)
          setError(`Payment options could not be loaded: ${e.message}`)
      })
    return () => {
      active = false
    }
  }, [refresh])
  async function open(id: string, pay = false) {
    setBusy(true)
    setError('')
    try {
      const result = await purchaseRequest<{ data: PurchaseRecord }>(id)
      if (pay) {
        setPayment(result.data)
        setAmount(decimal(result.data.due_cents))
        setMethod('Bank Transfer')
        setAccount(
          bootstrap?.accounts.find((a) =>
            a.payment_methods.includes('Bank Transfer'),
          )?.id || '',
        )
        setReference('')
        setDate(today())
      } else setRecord(result.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to open purchase.')
    } finally {
      setBusy(false)
    }
  }
  async function submit(clear = false) {
    if (!payment || busy) return
    const body = clear
      ? { cleared_date: date }
      : {
          method,
          cash_account_id: account,
          reference,
          payment_date: date,
          amount,
        }
    const path = `${payment.id}/${clear ? 'clear-check' : 'payments'}`
    const json = JSON.stringify(body)
    if (
      pending.current &&
      (pending.current.path !== path || pending.current.body !== json)
    ) {
      setError(
        'Retry the unchanged payment or check purchase details for an uncertain submission.',
      )
      return
    }
    pending.current ??= { path, body: json, key: crypto.randomUUID() }
    setBusy(true)
    setError('')
    try {
      const result = await purchaseRequest<{ data: PurchaseRecord }>(path, {
        method: 'POST',
        headers: { 'Idempotency-Key': pending.current.key },
        body: pending.current.body,
      })
      pending.current = null
      setPayment(null)
      setRecord(result.data)
      setRefresh((v) => v + 1)
    } catch (e) {
      if (
        e instanceof PurchaseApiError &&
        e.status >= 400 &&
        e.status < 500 &&
        e.status !== 409
      )
        pending.current = null
      setError(
        e instanceof Error ? e.message : 'Unable to record supplier payment.',
      )
    } finally {
      setBusy(false)
    }
  }
  const visible = rows.filter(
    (r) =>
      (!isPayables || r.due_cents > 0) &&
      `${r.purchase_number} ${r.supplier.name} ${r.invoice_number}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  )
  const accounts =
    bootstrap?.accounts.filter((a) =>
      a.payment_methods.includes(method === 'Check' ? 'Cheque' : method),
    ) || []
  const visiblePayables = (overview?.payables || [])
    .filter((p) => !supplier || p.supplier_id === supplier)
    .filter((p) => !overdueOnly || p.due_date < (overview?.today || ''))
    .filter((p) =>
      `${p.purchase_number} ${p.supplier_name} ${p.supplier_invoice_number}`
        .toLowerCase()
        .includes(search.toLowerCase()),
    )
  return (
    <div className="space-y-4 pb-12 animate-in fade-in duration-200 text-[#0c3761] text-[13px] leading-relaxed">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
        <Link to="/purchases" className="hover:text-sky-700 transition">
          Purchases &amp; Suppliers
        </Link>
        <span>›</span>
        <span className="text-slate-700 font-semibold">
          {isPayables
            ? overdueOnly
              ? 'Overdue Supplier Payables'
              : 'Supplier Payables'
            : 'Purchase History'}
        </span>
      </nav>

      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center sm:size-12 overflow-hidden">
            <img
              src={truckIcon}
              alt=""
              aria-hidden="true"
              className="size-11 sm:size-12 object-contain scale-[1.6] drop-shadow-xs"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0c3761]">
              {isPayables
                ? overdueOnly
                  ? 'Overdue Supplier Payables'
                  : 'Supplier Payables'
                : 'Purchase History'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Review purchases, supplier invoices, payments, and outstanding balances.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/purchases/entry"
            className="px-3.5 py-1.5 rounded-lg bg-[#087ae6] hover:bg-[#0964c2] text-xs font-semibold text-white shadow-xs transition"
          >
            + New Purchase
          </Link>
          <Link
            to={isPayables ? '/purchases/history' : '/purchases/payables'}
            className="px-3.5 py-1.5 rounded-lg border border-[#9fd0e2] bg-white hover:bg-[#e0f6fd] text-xs font-semibold text-[#0c3761] shadow-2xs transition"
          >
            {isPayables ? 'All Purchases' : 'Supplier Payables'}
          </Link>
          {!isPayables && (
            <Link
              onClick={() => setPage(1)}
              to={
                awaitingDelivery
                  ? '/purchases/history'
                  : '/purchases/history?awaiting_delivery=1'
              }
              className="px-3.5 py-1.5 rounded-lg border border-[#9fd0e2] bg-white hover:bg-[#e0f6fd] text-xs font-semibold text-[#0c3761] shadow-2xs transition"
            >
              {awaitingDelivery ? 'All Deliveries' : 'Awaiting Delivery'}
            </Link>
          )}
          <button
            disabled={loading}
            onClick={() => {
              setError('')
              setRefresh((v) => v + 1)
            }}
            className="px-3 py-1.5 rounded-lg border border-[#9fd0e2] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </header>

      {/* Error Notices */}
      {(error || fetchError) && (
        <div
          className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 shadow-xs"
          role="alert"
        >
          {fetchError || error}
        </div>
      )}

      {/* Overview Stat Cards */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="rounded-xl border border-[#9fd0e2] bg-white p-3.5 shadow-2xs">
            <span className="text-[11.5px] font-semibold text-slate-500 block">
              Purchases This Month
            </span>
            <strong className="text-base sm:text-lg font-bold font-mono text-[#0c3761] mt-0.5 block">
              {peso(overview.purchases_month_cents)}
            </strong>
          </div>
          <div className="rounded-xl border border-[#9fd0e2] bg-white p-3.5 shadow-2xs">
            <span className="text-[11.5px] font-semibold text-slate-500 block">
              Outstanding Payables
            </span>
            <strong className="text-base sm:text-lg font-bold font-mono text-amber-700 mt-0.5 block">
              {peso(overview.outstanding_cents)}
            </strong>
          </div>
          <div className="rounded-xl border border-[#9fd0e2] bg-white p-3.5 shadow-2xs">
            <span className="text-[11.5px] font-semibold text-slate-500 block">
              Overdue Payables
            </span>
            <strong className="text-base sm:text-lg font-bold font-mono text-rose-600 mt-0.5 block">
              {peso(overview.overdue_cents)}
            </strong>
          </div>
          <div className="rounded-xl border border-[#9fd0e2] bg-white p-3.5 shadow-2xs">
            <span className="text-[11.5px] font-semibold text-slate-500 block">
              Supplier Payments This Month
            </span>
            <strong className="text-base sm:text-lg font-bold font-mono text-emerald-700 mt-0.5 block">
              {peso(overview.payments_month_cents)}
            </strong>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-[#9fd0e2] bg-[#e0f6fd]">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <select
              aria-label="Filter purchases by supplier"
              value={supplier}
              onChange={(e) => {
                setSupplier(e.target.value)
                setPage(1)
              }}
              className="w-full appearance-none rounded-lg border border-[#507ea1] bg-white px-3 py-1.5 pr-8 text-xs text-[#0c3761] focus:outline-none focus:ring-1 focus:ring-[#159de9]"
            >
              <option value="">All suppliers</option>
              {bootstrap?.suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
          <div className="relative flex-1">
            <input
              aria-label="Search purchases"
              placeholder="Search this page…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-[#507ea1] bg-white px-3 py-1.5 text-xs text-[#0c3761] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#159de9]"
            />
          </div>
        </div>
        <span className="text-xs font-semibold text-[#0c3761]">
          {loading
            ? 'Fetching data…'
            : fetchError
              ? 'Data unavailable'
              : isPayables
                ? `${visiblePayables.length} outstanding balance${visiblePayables.length === 1 ? '' : 's'}`
                : `${meta.total} purchase${meta.total === 1 ? '' : 's'}`}
        </span>
      </div>

      {/* Table Section */}
      {isPayables ? (
        <section className="rounded-xl border border-[#9fd0e2] bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f0f9ff] border-b border-[#9fd0e2] text-xs font-bold text-[#0c3761]">
                <tr>
                  <th className="py-3 px-4">Purchase</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-right">Amount Due</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0f2fe]">
                {loading ? (
                  <tr>
                    <td colSpan={5} role="status" className="py-6 text-center text-slate-400 italic">
                      Fetching supplier balances…
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-rose-600 font-semibold">
                      Unable to load supplier balances. Please use Refresh.
                    </td>
                  </tr>
                ) : (
                  visiblePayables.map((p) => (
                    <tr key={p.id} className="hover:bg-[#f8fcff] transition">
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#0c3761]">{p.purchase_number}</span>
                        <small className="block text-slate-500 text-[11px]">
                          Invoice: {p.supplier_invoice_number}
                        </small>
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#0c3761]">{p.supplier_name}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{p.due_date}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-amber-700">
                        {peso(p.outstanding_cents)}
                      </td>
                      <td className="py-3 px-4 text-center space-x-2 whitespace-nowrap">
                        <button
                          disabled={busy || !bootstrap}
                          onClick={() => void open(p.purchase_id, true)}
                          className="px-3 py-1.5 rounded-md bg-[#087ae6] hover:bg-[#0964c2] text-white font-semibold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                        >
                          Pay Supplier
                        </button>
                        <button
                          disabled={busy}
                          onClick={() => void open(p.purchase_id)}
                          className="px-3 py-1.5 rounded-md border border-[#9fd0e2] bg-white hover:bg-slate-50 text-[#0c3761] font-semibold text-xs shadow-2xs transition cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
                {!loading && !fetchError && !visiblePayables.length && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                      {overview?.payables.length
                        ? 'No supplier balances match your filters.'
                        : 'No outstanding supplier balances.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-[#9fd0e2] bg-white shadow-2xs overflow-hidden">
          {loading ? (
            <p role="status" className="py-6 text-center text-slate-400 italic text-xs">
              Fetching purchases…
            </p>
          ) : fetchError ? (
            <p className="py-6 text-center text-rose-600 font-semibold text-xs">
              Unable to load purchases. Please use Refresh.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#f0f9ff] border-b border-[#9fd0e2] text-xs font-bold text-[#0c3761]">
                  <tr>
                    <th className="py-3 px-4">Purchase No.</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Supplier / Invoice</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Paid</th>
                    <th className="py-3 px-4 text-right">Due</th>
                    <th className="py-3 px-4">Receiving</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e0f2fe]">
                  {visible.map((r) => (
                    <tr key={r.id} className="hover:bg-[#f8fcff] transition">
                      <td className="py-3 px-4 font-bold text-[#0c3761]">{r.purchase_number}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{r.purchase_date}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#0c3761]">{r.supplier.name}</span>
                        <small className="block text-slate-500 text-[11px]">{r.invoice_number}</small>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-slate-800">
                        {peso(r.total_cents)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700">
                        {peso(r.paid_cents)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-amber-700">
                        {peso(r.due_cents)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {receivingLabels[r.receiving_mode || 'all']}
                      </td>
                      <td className="py-3 px-4 text-center space-x-2 whitespace-nowrap">
                        <button
                          disabled={busy}
                          onClick={() => void open(r.id)}
                          className="px-3 py-1.5 rounded-md border border-[#9fd0e2] bg-white hover:bg-slate-50 text-[#0c3761] font-semibold text-xs shadow-2xs transition cursor-pointer"
                        >
                          Details
                        </button>
                        {r.due_cents > 0 && (
                          <button
                            disabled={busy || !bootstrap}
                            onClick={() => void open(r.id, true)}
                            className="px-3 py-1.5 rounded-md bg-[#087ae6] hover:bg-[#0964c2] text-white font-semibold text-xs shadow-xs transition cursor-pointer disabled:opacity-50"
                          >
                            Pay Supplier
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!visible.length && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-slate-400 italic">
                        {awaitingDelivery
                          ? 'No purchases awaiting delivery.'
                          : 'No purchases found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between p-3.5 border-t border-[#9fd0e2] bg-[#f0f9ff] text-xs">
            <button
              disabled={page <= 1 || loading}
              onClick={() => {
                setPage((p) => p - 1)
              }}
              className="px-3 py-1.5 rounded-md border border-[#9fd0e2] bg-white hover:bg-slate-50 text-xs font-semibold text-[#0c3761] shadow-2xs transition cursor-pointer disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-slate-600 font-medium">
              Page {page} of {meta.last_page}
            </span>
            <button
              disabled={page >= meta.last_page || loading}
              onClick={() => {
                setPage((p) => p + 1)
              }}
              className="px-3 py-1.5 rounded-md border border-[#9fd0e2] bg-white hover:bg-slate-50 text-xs font-semibold text-[#0c3761] shadow-2xs transition cursor-pointer disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </section>
      )}

      {/* Supplier Balances Summary Section */}
      {overview && (
        <section className="rounded-xl border border-[#9fd0e2] bg-white p-4 shadow-2xs space-y-3">
          <h2 className="text-sm font-bold text-[#0c3761] tracking-tight">Supplier Balances Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#f0f9ff] border-b border-[#9fd0e2] text-[#0c3761] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3 text-right">Amount Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0f2fe]">
                {overview.suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-[#f8fcff] transition">
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => {
                          setSupplier(s.id)
                          setPage(1)
                        }}
                        className="font-semibold text-[#087ae6] hover:underline cursor-pointer"
                      >
                        {s.name}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono">{s.code}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#0c3761]">
                      {peso(s.outstanding_cents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {record && (
        <PurchaseDocument
          key={record.id}
          record={record}
          onClose={() => setRecord(null)}
          onReceived={(updated) => {
            setRecord(updated)
            setRefresh((value) => value + 1)
          }}
        />
      )}
      {payment && (
        <PurchaseDialog
          className="w-[min(540px,calc(100vw-24px))]"
          title={`Pay Supplier — ${payment.purchase_number}`}
          onClose={() => !busy && setPayment(null)}
        >
          <form
            className="p-5 sm:p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              void submit()
            }}
          >
            <div className="p-3 rounded-lg bg-[#f0f9ff] border border-[#9fd0e2] text-xs">
              <span className="font-bold text-[#0c3761]">{payment.supplier.name}</span>
              <span className="text-slate-500"> · Current amount due: </span>
              <strong className="font-mono text-amber-700 font-bold">{peso(payment.due_cents)}</strong>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Payment Date
              </label>
              <input
                aria-label="Supplier payment date"
                type="date"
                min={payment.purchase_date}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-md border border-[#93afd3] bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#159de9] focus:outline-none focus:ring-1 focus:ring-[#159de9]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Payment Method
              </label>
              <select
                aria-label="Supplier payment method"
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value)
                  setAccount(
                    bootstrap?.accounts.find((a) =>
                      a.payment_methods.includes(
                        e.target.value === 'Check' ? 'Cheque' : e.target.value,
                      ),
                    )?.id || '',
                  )
                }}
                className="w-full rounded-md border border-[#93afd3] bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#159de9] focus:outline-none focus:ring-1 focus:ring-[#159de9]"
              >
                {[
                  'Bank Transfer',
                  'Cash',
                  'Check',
                  'E-Wallet',
                  'Credit Card',
                ].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Paid From
              </label>
              <select
                aria-label="Supplier payment account"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
                className="w-full rounded-md border border-[#93afd3] bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#159de9] focus:outline-none focus:ring-1 focus:ring-[#159de9]"
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option value={a.id} key={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Reference / Check Number
              </label>
              <input
                aria-label="Supplier payment reference"
                value={reference}
                maxLength={120}
                onChange={(e) => setReference(e.target.value)}
                required={method !== 'Cash'}
                className="w-full rounded-md border border-[#93afd3] bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#159de9] focus:outline-none focus:ring-1 focus:ring-[#159de9]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Amount Paid
              </label>
              <input
                aria-label="Supplier payment amount"
                type="number"
                min="0.01"
                max={decimal(payment.due_cents)}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full rounded-md border border-[#93afd3] bg-white px-3 py-2 text-xs text-slate-800 text-right font-mono focus:border-[#159de9] focus:outline-none focus:ring-1 focus:ring-[#159de9]"
              />
            </div>
            {error && <p role="alert" className="text-xs text-rose-600 font-semibold">{error}</p>}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#deebf2]">
              <button
                type="button"
                onClick={() => setPayment(null)}
                className="px-4 py-2 rounded-md border border-[#9fd0e2] bg-white hover:bg-slate-50 text-xs font-semibold text-[#0c3761] shadow-2xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-md bg-[#087ae6] hover:bg-[#0964c2] text-xs font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {busy ? 'Saving…' : 'Record Payment'}
              </button>
            </div>
            {payment.postdated_check?.status === 'pending' && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs space-y-2">
                <p className="text-slate-700">
                  Pending check {payment.postdated_check.check_number}, dated{' '}
                  {payment.postdated_check.check_date}, for{' '}
                  {peso(payment.postdated_check.amount_cents)}. Confirm clearing
                  only after the bank has cleared it.
                </p>
                <button
                  type="button"
                  disabled={
                    busy ||
                    date < payment.postdated_check.check_date.slice(0, 10)
                  }
                  onClick={() => void submit(true)}
                  className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50"
                >
                  Confirm PDC Cleared
                </button>
              </div>
            )}
          </form>
        </PurchaseDialog>
      )}
    </div>
  )
}
