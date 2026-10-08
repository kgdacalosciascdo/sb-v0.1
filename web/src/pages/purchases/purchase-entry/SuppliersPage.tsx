import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { PaymentDialog } from '../../collections/receive-payment/PaymentDialog'
import {
  peso,
  purchaseRequest,
  type Overview,
  type PurchaseBootstrap,
  type Supplier,
} from './api'
import './purchase-entry.css'

export function SuppliersPage() {
  const location = useLocation()
  const [data, setData] = useState<PurchaseBootstrap | null>(null)
  const [overview, setOverview] = useState<Overview | null>(null)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(
    () => new URLSearchParams(location.search).get('add') === '1',
  )
  const [name, setName] = useState('')
  const [terms, setTerms] = useState('30')
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  useEffect(() => {
    let active = true
    Promise.all([
      purchaseRequest<{ data: PurchaseBootstrap }>('bootstrap'),
      purchaseRequest<{ data: Overview }>('overview'),
    ])
      .then(([options, totals]) => {
        if (active) {
          setData(options.data)
          setOverview(totals.data)
        }
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
    return () => {
      active = false
    }
  }, [])
  async function save() {
    if (busy) return
    setBusy(true)
    setError('')
    try {
      const result = await purchaseRequest<{ data: Supplier }>('suppliers', {
        method: 'POST',
        body: JSON.stringify({ name, terms_days: Number(terms) }),
      })
      setData((d) =>
        d ? { ...d, suppliers: [...d.suppliers, result.data] } : d,
      )
      setModal(false)
      setName('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to add supplier.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <div className="purchase-register">
      <h1>Suppliers</h1>
      <p className="purchase-live-note">
        Manage purchasing contacts, payment terms, and outstanding balances.
      </p>
      <div className="purchase-register-toolbar">
        <Link to="/purchases">← Purchases &amp; Suppliers</Link>
        <input
          aria-label="Search suppliers"
          placeholder="Search suppliers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={() => setModal(true)}>+ Add Supplier</button>
      </div>
      {error && (
        <div role="alert" className="pe-message pe-error">
          {error}
        </div>
      )}
      <section className="pe-panel">
        <div className="purchase-register-table">
          <table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Code</th>
                <th>Payment Terms</th>
                <th>Amount Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.suppliers
                .filter((s) =>
                  `${s.name} ${s.code}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
                )
                .map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.code}</td>
                    <td>
                      {s.terms_days ? `Net ${s.terms_days}` : 'Due on Receipt'}
                    </td>
                    <td>
                      {peso(
                        overview?.suppliers.find((o) => o.id === s.id)
                          ?.outstanding_cents || 0,
                      )}
                    </td>
                    <td>
                      <Link to={`/purchases/history?supplier=${s.id}`}>
                        Purchase History
                      </Link>
                    </td>
                  </tr>
                ))}
              {data && !data.suppliers.length && (
                <tr>
                  <td colSpan={5}>
                    No suppliers yet. Add a supplier to begin.
                  </td>
                </tr>
              )}
              {!data && !error && (
                <tr>
                  <td colSpan={5}>Loading suppliers…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      {modal && (
        <PaymentDialog
          title="Add Supplier"
          onClose={() => !busy && setModal(false)}
        >
          <form
            className="rp-customer-form"
            onSubmit={(e) => {
              e.preventDefault()
              void save()
            }}
          >
            <label>
              Supplier name
              <input
                required
                maxLength={160}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              Payment terms (days)
              <input
                type="number"
                min="0"
                max="365"
                value={terms}
                required
                onChange={(e) => setTerms(e.target.value)}
              />
            </label>
            {error && <p role="alert">{error}</p>}
            <button className="primary" disabled={busy}>
              Add Supplier
            </button>
          </form>
        </PaymentDialog>
      )}
    </div>
  )
}
