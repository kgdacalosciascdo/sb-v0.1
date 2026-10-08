import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { peso, purchaseRequest } from './api'
import { usePurchaseOverview } from './usePurchaseOverview'
import './purchase-entry.css'

interface Stock {
  items: {
    id: string
    code: string
    name: string
    unit_name: string
    received_quantity: string
    cost_cents: number
  }[]
  recent: {
    id: string
    quantity: string
    movement_date: string
    name: string
    purchase_number: string
  }[]
}
interface Cash {
  accounts: {
    id: string
    name: string
    received_cents: number
    paid_cents: number
    net_cents: number
  }[]
  payments: {
    id: string
    method: string
    reference: string
    payment_date: string
    amount_cents: number
    account_name: string
    purchase_number: string
  }[]
}
export function PurchaseSystemPanel({
  variant = 'summary',
}: {
  variant?:
    'summary' | 'stock' | 'stock-recent' | 'cash' | 'cash-recent' | 'payables'
}) {
  const { data, error, loading } = usePurchaseOverview()
  const [stock, setStock] = useState<Stock | null>(null)
  const [cash, setCash] = useState<Cash | null>(null)
  const [requestError, setRequestError] = useState('')
  useEffect(() => {
    let active = true
    if (variant.startsWith('stock'))
      purchaseRequest<{ data: Stock }>('stock')
        .then((r) => {
          if (active) setStock(r.data)
        })
        .catch((e) => {
          if (active) setRequestError(e.message)
        })
    if (variant.startsWith('cash'))
      purchaseRequest<{ data: Cash }>('cash')
        .then((r) => {
          if (active) setCash(r.data)
        })
        .catch((e) => {
          if (active) setRequestError(e.message)
        })
    return () => {
      active = false
    }
  }, [variant])
  const title =
    variant === 'stock'
      ? 'Stock Received from Purchases'
      : variant === 'stock-recent'
        ? 'Recent Purchase Receipts'
        : variant === 'cash'
          ? 'Recorded Cash Movements'
          : variant === 'cash-recent'
            ? 'Supplier Payment Activity'
            : variant === 'payables'
              ? 'Supplier Payments Due'
              : 'Purchases & Supplier Balances'
  return (
    <section className="purchase-live-panel h-full">
      <h2>{title}</h2>
      {(error || requestError) && (
        <p role="alert" className="text-rose-700">
          {error || requestError}
        </p>
      )}
      {(variant.startsWith('stock')
        ? !stock && !requestError
        : variant.startsWith('cash')
          ? !cash && !requestError
          : loading) && <p role="status">Fetching data…</p>}
      {variant === 'summary' && data && (
        <div className="purchase-live-metrics">
          <Link to="/purchases/history">
            <small>Purchases This Month</small>
            <strong>{peso(data.purchases_month_cents)}</strong>
          </Link>
          <Link to="/purchases/history">
            <small>Supplier Payments</small>
            <strong>{peso(data.payments_month_cents)}</strong>
          </Link>
          <Link to="/purchases/payables">
            <small>Amount to Pay</small>
            <strong>{peso(data.outstanding_cents)}</strong>
          </Link>
          <Link to="/purchases/payables">
            <small>Overdue Payables</small>
            <strong>{peso(data.overdue_cents)}</strong>
          </Link>
        </div>
      )}
      {variant === 'payables' && data && (
        <div className="purchase-live-scroll">
          <table>
            <thead>
              <tr>
                <th>Supplier / Purchase</th>
                <th>Due Date</th>
                <th>Amount Due</th>
              </tr>
            </thead>
            <tbody>
              {data.payables.slice(0, 6).map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to="/purchases/payables">
                      {p.supplier_name}
                      <small className="block">{p.purchase_number}</small>
                    </Link>
                  </td>
                  <td>{p.due_date}</td>
                  <td>{peso(p.outstanding_cents)}</td>
                </tr>
              ))}
              {!loading && !error && !data.payables.length && (
                <tr>
                  <td colSpan={3}>No supplier balances due.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {variant === 'stock' && stock && (
        <>
          <p className="purchase-live-note">
            Quantities and cost received through saved purchases.
          </p>
          <div className="purchase-live-scroll">
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Received</th>
                  <th>Purchase Cost</th>
                </tr>
              </thead>
              <tbody>
                {stock.items.map((i) => (
                  <tr key={i.id}>
                    <td>
                      {i.name}
                      <small className="block">{i.code}</small>
                    </td>
                    <td>
                      {Number(i.received_quantity).toLocaleString()}{' '}
                      {i.unit_name}
                    </td>
                    <td>{peso(i.cost_cents)}</td>
                  </tr>
                ))}
                {!stock.items.length && (
                  <tr>
                    <td colSpan={3}>No stock purchases received yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      {variant === 'stock-recent' && stock && (
        <div className="purchase-live-scroll">
          <table>
            <thead>
              <tr>
                <th>Date / Purchase</th>
                <th>Item</th>
                <th>Qty</th>
              </tr>
            </thead>
            <tbody>
              {stock.recent.map((i) => (
                <tr key={i.id}>
                  <td>
                    {i.movement_date}
                    <Link className="block" to="/purchases/history">
                      {i.purchase_number}
                    </Link>
                  </td>
                  <td>{i.name}</td>
                  <td>{Number(i.quantity).toLocaleString()}</td>
                </tr>
              ))}
              {!stock.recent.length && (
                <tr>
                  <td colSpan={3}>No purchase receipts yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {variant === 'cash' && cash && (
        <>
          <p className="purchase-live-note">
            Collections received and supplier payments recorded, excluding
            opening balances.
          </p>
          <div className="purchase-live-scroll">
            <table>
              <thead>
                <tr>
                  <th>Account</th>
                  <th>Received</th>
                  <th>Paid Out</th>
                  <th>Net Movement</th>
                </tr>
              </thead>
              <tbody>
                {cash.accounts.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{peso(a.received_cents)}</td>
                    <td>{peso(a.paid_cents)}</td>
                    <td>{peso(a.net_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {variant === 'cash-recent' && cash && (
        <div className="purchase-live-scroll">
          <table>
            <thead>
              <tr>
                <th>Date / Purchase</th>
                <th>Account / Method</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {cash.payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.payment_date}
                    <Link className="block" to="/purchases/history">
                      {p.purchase_number}
                    </Link>
                  </td>
                  <td>
                    {p.account_name}
                    <small className="block">
                      {p.method} · {p.reference}
                    </small>
                  </td>
                  <td>{peso(p.amount_cents)}</td>
                </tr>
              ))}
              {!cash.payments.length && (
                <tr>
                  <td colSpan={3}>No supplier payments yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <Link
        to={
          variant === 'payables' ? '/purchases/payables' : '/purchases/history'
        }
      >
        {variant === 'payables' ? 'Pay Suppliers →' : 'View Purchases →'}
      </Link>
    </section>
  )
}
