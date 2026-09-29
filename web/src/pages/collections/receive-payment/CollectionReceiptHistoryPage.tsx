import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReceiptText } from 'lucide-react'
import { collectionRequest, peso, type Receipt, type ReceiptRow } from './api'
import { PaymentReceipt } from './PaymentReceipt'
import './receive-payment.css'

export function CollectionReceiptHistoryPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [result, setResult] = useState<{
    data: ReceiptRow[]
    meta: { total: number; last_page: number }
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [opening, setOpening] = useState(false)
  useEffect(() => {
    let active = true
    collectionRequest<{
      data: ReceiptRow[]
      meta: { total: number; last_page: number }
    }>(`receipts?page=${page}`)
      .then((r) => {
        if (active) setResult(r)
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
  }, [page])
  async function open(id: string) {
    setOpening(true)
    setError('')
    try {
      const r = await collectionRequest<{ data: Receipt }>(`receipts/${id}`)
      setReceipt(r.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to open receipt.')
    } finally {
      setOpening(false)
    }
  }
  return (
    <div className="receive-payment">
      <header className="rp-heading">
        <ReceiptText size={34} />
        <div>
          <h1>Receipt History</h1>
          <p>Posted customer payments and their invoice allocations.</p>
        </div>
      </header>
      <div className="rp-history-toolbar">
        <button onClick={() => navigate('/collections')}>
          Back to Collections
        </button>
        <button
          className="primary"
          onClick={() => navigate('/collections/receive-payment')}
        >
          Receive Payment
        </button>
      </div>
      {error && (
        <div className="rp-message error" role="alert">
          {error}
        </div>
      )}
      <section className="rp-panel">
        <h2>{result?.meta.total || 0} posted receipts</h2>
        {loading ? (
          <p role="status">Loading receipts…</p>
        ) : (
          <div className="rp-table-scroll">
            <table className="rp-table">
              <thead>
                <tr>
                  <th>Receipt No.</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Received</th>
                  <th>Unapplied</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {result?.data.map((r) => (
                  <tr key={r.id}>
                    <td>{r.receipt_number}</td>
                    <td>{r.receipt_date}</td>
                    <td>{r.customer_name}</td>
                    <td>{peso(r.amount_cents)}</td>
                    <td>{peso(r.unapplied_cents)}</td>
                    <td>
                      <button
                        disabled={opening}
                        onClick={() => void open(r.id)}
                      >
                        View Receipt / Details
                      </button>
                    </td>
                  </tr>
                ))}
                {!result?.data.length && (
                  <tr>
                    <td colSpan={6}>No payment receipts recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="rp-history-toolbar">
          <button
            disabled={page <= 1 || loading}
            onClick={() => {
              setLoading(true)
              setError('')
              setPage((p) => p - 1)
            }}
          >
            Previous
          </button>
          <span>
            Page {page} of {result?.meta.last_page || 1}
          </span>
          <button
            disabled={!result || page >= result.meta.last_page || loading}
            onClick={() => {
              setLoading(true)
              setError('')
              setPage((p) => p + 1)
            }}
          >
            Next
          </button>
        </div>
      </section>
      {receipt && (
        <PaymentReceipt receipt={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  )
}
