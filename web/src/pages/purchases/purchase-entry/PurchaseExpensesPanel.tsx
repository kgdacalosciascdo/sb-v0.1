import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { intendedUses, peso, purchaseRequest, type IntendedUse } from './api'
import './purchase-entry.css'

interface PurchaseExpense {
  id: string
  received_on: string
  purchase_number: string
  name: string
  quantity: string
  intended_use: IntendedUse
  cost_cents: number
}

export function PurchaseExpensesPanel() {
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<{
    page: number
    rows: PurchaseExpense[]
    last: number
    error: string
  }>()
  useEffect(() => {
    let active = true
    purchaseRequest<{ data: PurchaseExpense[]; meta: { last_page: number } }>(
      `expenses?page=${page}`,
    )
      .then(({ data, meta }) => {
        if (active)
          setResult({ page, rows: data, last: meta.last_page, error: '' })
      })
      .catch((e: Error) => {
        if (active) setResult({ page, rows: [], last: page, error: e.message })
      })
    return () => {
      active = false
    }
  }, [page])
  const loaded = result?.page === page ? result : undefined
  return (
    <section className="purchase-live-panel">
      <h2>Expenses from Purchases</h2>
      {!loaded && <p role="status">Fetching purchase expenses…</p>}
      {loaded?.error && <p role="alert">{loaded.error}</p>}
      {loaded &&
        !loaded.error &&
        (loaded.rows.length ? (
          <div className="purchase-live-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date / Purchase</th>
                  <th>Item</th>
                  <th>Intended Use</th>
                  <th>Received</th>
                  <th>Cost before Tax</th>
                </tr>
              </thead>
              <tbody>
                {loaded.rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      {row.received_on}
                      <small className="block">{row.purchase_number}</small>
                    </td>
                    <td>{row.name}</td>
                    <td>{intendedUses[row.intended_use]}</td>
                    <td>{Number(row.quantity)}</td>
                    <td>{peso(row.cost_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No purchase expenses recorded.</p>
        ))}
      <div className="purchase-register-toolbar">
        <Link to="/purchases/history">View Purchase History</Link>
        {loaded && loaded.last > 1 && (
          <div>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span className="mx-3">
              Page {page} of {loaded.last}
            </span>
            <button
              disabled={page >= loaded.last}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
