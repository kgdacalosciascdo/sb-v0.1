import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PaymentDialog } from '../../collections/receive-payment/PaymentDialog'
import { PurchaseDocument } from './PurchaseDocument'
import {
  decimal,
  peso,
  PurchaseApiError,
  purchaseRequest,
  today,
  type Overview,
  type PurchaseBootstrap,
  type PurchaseRecord,
  type PurchaseRow,
} from './api'
import './purchase-entry.css'

export function PurchaseHistoryPage() {
  const location = useLocation()
  const isPayables = location.pathname === '/purchases/payables'
  const overdueOnly =
    new URLSearchParams(location.search).get('overdue') === '1'
  const [page, setPage] = useState(1)
  const [supplier, setSupplier] = useState(
    () => new URLSearchParams(location.search).get('supplier') || '',
  )
  const [search, setSearch] = useState('')
  const [rows, setRows] = useState<PurchaseRow[]>([])
  const [meta, setMeta] = useState({ total: 0, last_page: 1 })
  const [overview, setOverview] = useState<Overview | null>(null)
  const [bootstrap, setBootstrap] = useState<PurchaseBootstrap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [record, setRecord] = useState<PurchaseRecord | null>(null)
  const [payment, setPayment] = useState<PurchaseRecord | null>(null)
  const [busy, setBusy] = useState(false)
  const [refresh, setRefresh] = useState(0)
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('Bank Transfer')
  const [account, setAccount] = useState('')
  const [reference, setReference] = useState('')
  const [date, setDate] = useState(today)
  const pending = useRef<{ path: string; body: string; key: string } | null>(
    null,
  )
  useEffect(() => {
    let active = true
    Promise.all([
      purchaseRequest<{ data: PurchaseRow[]; meta: typeof meta }>(
        `?page=${page}${supplier ? `&supplier_id=${encodeURIComponent(supplier)}` : ''}`,
      ),
      purchaseRequest<{ data: Overview }>('overview'),
      purchaseRequest<{ data: PurchaseBootstrap }>('bootstrap'),
    ])
      .then(([history, summary, options]) => {
        if (!active) return
        setRows(history.data)
        setMeta(history.meta)
        setOverview(summary.data)
        setBootstrap(options.data)
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [page, supplier, refresh])
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
  return (
    <div className="purchase-register">
      <h1>
        {isPayables
          ? overdueOnly
            ? 'Overdue Supplier Payables'
            : 'Supplier Payables'
          : 'Purchase History'}
      </h1>
      <p className="purchase-live-note">
        Review purchases, supplier invoices, payments, and outstanding balances.
      </p>
      <div className="purchase-register-toolbar">
        <Link to="/purchases">← Purchases &amp; Suppliers</Link>
        <Link to="/purchases/entry">+ New Purchase</Link>
        <Link to={isPayables ? '/purchases/history' : '/purchases/payables'}>
          {isPayables ? 'All Purchases' : 'Supplier Payables'}
        </Link>
      </div>
      {error && (
        <div className="pe-message pe-error" role="alert">
          {error}
        </div>
      )}
      {overview && (
        <div className="purchase-live-metrics">
          <Link to="/purchases/history">
            <small>Purchases This Month</small>
            <strong>{peso(overview.purchases_month_cents)}</strong>
          </Link>
          <Link to="/purchases/payables">
            <small>Outstanding Payables</small>
            <strong>{peso(overview.outstanding_cents)}</strong>
          </Link>
          <Link to="/purchases/payables">
            <small>Overdue</small>
            <strong>{peso(overview.overdue_cents)}</strong>
          </Link>
          <Link to="/purchases/history">
            <small>Supplier Payments This Month</small>
            <strong>{peso(overview.payments_month_cents)}</strong>
          </Link>
        </div>
      )}
      <div className="purchase-register-toolbar">
        <select
          aria-label="Filter purchases by supplier"
          value={supplier}
          onChange={(e) => {
            setLoading(true)
            setSupplier(e.target.value)
            setPage(1)
          }}
        >
          <option value="">All suppliers</option>
          {bootstrap?.suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          aria-label="Search purchases"
          placeholder="Search this page…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span>{meta.total} purchases</span>
      </div>
      {isPayables ? (
        <section className="pe-panel">
          <div className="purchase-register-table">
            <table>
              <thead>
                <tr>
                  <th>Purchase</th>
                  <th>Supplier</th>
                  <th>Due Date</th>
                  <th>Amount Due</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {overview?.payables
                  .filter((p) => !supplier || p.supplier_id === supplier)
                  .filter(
                    (p) => !overdueOnly || p.due_date < (overview?.today || ''),
                  )
                  .filter((p) =>
                    `${p.purchase_number} ${p.supplier_name} ${p.supplier_invoice_number}`
                      .toLowerCase()
                      .includes(search.toLowerCase()),
                  )
                  .map((p) => (
                    <tr key={p.id}>
                      <td>
                        {p.purchase_number}
                        <small className="block">
                          Invoice: {p.supplier_invoice_number}
                        </small>
                      </td>
                      <td>{p.supplier_name}</td>
                      <td>{p.due_date}</td>
                      <td>{peso(p.outstanding_cents)}</td>
                      <td>
                        <button
                          disabled={busy}
                          onClick={() => void open(p.purchase_id, true)}
                        >
                          Pay Supplier
                        </button>{' '}
                        <button
                          disabled={busy}
                          onClick={() => void open(p.purchase_id)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                {!overview?.payables.length && (
                  <tr>
                    <td colSpan={5}>No outstanding supplier balances.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="pe-panel">
          {loading ? (
            <p role="status">Loading purchases…</p>
          ) : (
            <div className="purchase-register-table">
              <table>
                <thead>
                  <tr>
                    <th>Purchase No.</th>
                    <th>Date</th>
                    <th>Supplier / Invoice</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => (
                    <tr key={r.id}>
                      <td>{r.purchase_number}</td>
                      <td>{r.purchase_date}</td>
                      <td>
                        {r.supplier.name}
                        <small className="block">{r.invoice_number}</small>
                      </td>
                      <td>{peso(r.total_cents)}</td>
                      <td>{peso(r.paid_cents)}</td>
                      <td>{peso(r.due_cents)}</td>
                      <td>
                        <button disabled={busy} onClick={() => void open(r.id)}>
                          Details / Receipt
                        </button>
                        {r.due_cents > 0 && (
                          <button
                            disabled={busy}
                            onClick={() => void open(r.id, true)}
                          >
                            Pay Supplier
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!visible.length && (
                    <tr>
                      <td colSpan={7}>No purchases found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="purchase-register-toolbar">
            <button
              disabled={page <= 1 || loading}
              onClick={() => {
                setLoading(true)
                setPage((p) => p - 1)
              }}
            >
              Previous
            </button>
            <span>
              Page {page} of {meta.last_page}
            </span>
            <button
              disabled={page >= meta.last_page || loading}
              onClick={() => {
                setLoading(true)
                setPage((p) => p + 1)
              }}
            >
              Next
            </button>
          </div>
        </section>
      )}
      {overview && (
        <section className="purchase-live-panel mt-4">
          <h2>Supplier Balances</h2>
          <div className="purchase-live-scroll">
            <table>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Code</th>
                  <th>Amount Due</th>
                </tr>
              </thead>
              <tbody>
                {overview.suppliers.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <button
                        onClick={() => {
                          setSupplier(s.id)
                          setPage(1)
                        }}
                      >
                        {s.name}
                      </button>
                    </td>
                    <td>{s.code}</td>
                    <td>{peso(s.outstanding_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      {record && (
        <PurchaseDocument record={record} onClose={() => setRecord(null)} />
      )}
      {payment && (
        <PaymentDialog
          title={`Pay Supplier — ${payment.purchase_number}`}
          onClose={() => !busy && setPayment(null)}
        >
          <form
            className="rp-customer-form"
            onSubmit={(e) => {
              e.preventDefault()
              void submit()
            }}
          >
            <p>
              {payment.supplier.name} · Current amount due:{' '}
              <strong>{peso(payment.due_cents)}</strong>
            </p>
            <label>
              Payment Date
              <input
                aria-label="Supplier payment date"
                type="date"
                min={payment.purchase_date}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>
            <label>
              Payment Method
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
            </label>
            <label>
              Paid From
              <select
                aria-label="Supplier payment account"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                required
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option value={a.id} key={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Reference / Check Number
              <input
                aria-label="Supplier payment reference"
                value={reference}
                maxLength={120}
                onChange={(e) => setReference(e.target.value)}
                required={method !== 'Cash'}
              />
            </label>
            <label>
              Amount Paid
              <input
                aria-label="Supplier payment amount"
                type="number"
                min="0.01"
                max={decimal(payment.due_cents)}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
            {error && <p role="alert">{error}</p>}
            <button disabled={busy} className="primary">
              {busy ? 'Saving…' : 'Record Payment'}
            </button>
            {payment.postdated_check?.status === 'pending' && (
              <div className="purchase-pdc-note">
                <p>
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
                >
                  Confirm PDC Cleared
                </button>
              </div>
            )}
          </form>
        </PaymentDialog>
      )}
    </div>
  )
}
