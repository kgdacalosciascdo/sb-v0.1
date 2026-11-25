import { useRef, useState } from 'react'
import { PaymentDialog } from '../../collections/receive-payment/PaymentDialog'
import {
  intendedUses,
  cents,
  peso,
  PurchaseApiError,
  purchaseRequest,
  purchasesEndpoint,
  receivingLabels,
  today,
  type PurchaseRecord,
} from './api'
import '../../collections/receive-payment/receive-payment.css'

export function PurchaseDocument({
  record: initialRecord,
  preview = false,
  onClose,
  onReceived,
}: {
  record: PurchaseRecord
  preview?: boolean
  onClose: () => void
  onReceived?: (record: PurchaseRecord) => void
}) {
  const [updatedRecord, setUpdatedRecord] = useState<PurchaseRecord | null>(
    null,
  )
  const record = updatedRecord || initialRecord
  const [receiving, setReceiving] = useState(false)
  const [date, setDate] = useState(today)
  const [quantities, setQuantities] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [retrying, setRetrying] = useState(false)
  const pending = useRef<{ key: string; body: string } | null>(null)
  const outstanding = record.totals.lines.flatMap((line) => {
    const remaining =
      (Math.round(Number(line.quantity) * 10000) -
        Math.round(Number(line.received_quantity ?? line.quantity) * 10000)) /
      10000
    return line.line_id && remaining > 0
      ? [{ id: line.line_id, name: line.name, remaining }]
      : []
  })

  async function receive() {
    if (busy) return
    const items = outstanding
      .filter((line) => Number(quantities[line.id]) > 0)
      .map((line) => ({ line_id: line.id, quantity: quantities[line.id] }))
    if (!pending.current && !items.length) {
      setError('Enter at least one quantity received.')
      return
    }
    pending.current ??= {
      key: crypto.randomUUID(),
      body: JSON.stringify({ received_on: date, items }),
    }
    setBusy(true)
    setError('')
    try {
      const { data } = await purchaseRequest<{ data: PurchaseRecord }>(
        `${record.id}/receiving`,
        {
          method: 'POST',
          body: pending.current.body,
          headers: { 'Idempotency-Key': pending.current.key },
        },
      )
      pending.current = null
      setRetrying(false)
      setUpdatedRecord(data)
      setReceiving(false)
      setQuantities({})
      onReceived?.(data)
    } catch (e) {
      if (
        e instanceof PurchaseApiError &&
        [422, 404, 403, 429].includes(e.status)
      )
        pending.current = null
      setRetrying(!!pending.current)
      setError(
        e instanceof Error ? e.message : 'Unable to record the delivery.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <PaymentDialog
      title={preview ? 'Preview Purchase' : 'Purchase Details'}
      onClose={() => {
        if (!busy) onClose()
      }}
    >
      <article className="collection-receipt purchase-document">
        <header>
          <h3>{record.company.name}</h3>
          <p>{preview ? 'PREVIEW — NOT SAVED' : 'PURCHASE RECORD'}</p>
          <strong>{record.purchase_number}</strong>
        </header>
        <div className="collection-receipt-meta">
          <div>
            <small>Supplier</small>
            <strong>{record.supplier.name}</strong>
            <span>Invoice: {record.invoice_number}</span>
          </div>
          <div>
            <small>Purchase date</small>
            <strong>{record.purchase_date}</strong>
            {record.due_date && <span>Due: {record.due_date}</span>}
          </div>
        </div>
        <p>
          <strong>Receiving:</strong>{' '}
          {receivingLabels[record.receiving_mode || 'all']}
        </p>
        <div className="purchase-document-scroll">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Received</th>
                <th>Intended Use</th>
                <th>Unit Cost</th>
                <th>Discount</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {record.totals.lines.map((l, i) => (
                <tr key={i}>
                  <td>
                    <strong>{l.name}</strong>
                    <small>
                      {l.code} · {l.unit}
                    </small>
                  </td>
                  <td>{l.quantity}</td>
                  <td>{l.received_quantity ?? l.quantity}</td>
                  <td>{intendedUses[l.intended_use || 'sale']}</td>
                  <td>{peso(centsValue(l.unit_cost))}</td>
                  <td>{l.discount_percent}%</td>
                  <td>{peso(l.net_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl>
          <div>
            <dt>Total before discount</dt>
            <dd>{peso(record.totals.gross_cents)}</dd>
          </div>
          <div>
            <dt>Line discounts</dt>
            <dd>{peso(record.totals.discount_cents)}</dd>
          </div>
          <div>
            <dt>Subtotal</dt>
            <dd>{peso(record.totals.subtotal_cents)}</dd>
          </div>
          <div>
            <dt>Tax</dt>
            <dd>{peso(record.totals.tax_cents)}</dd>
          </div>
          <div>
            <dt>Total purchase</dt>
            <dd>{peso(record.total_cents)}</dd>
          </div>
          <div>
            <dt>Amount paid</dt>
            <dd>{peso(record.paid_cents)}</dd>
          </div>
          <div>
            <dt>Amount due</dt>
            <dd>{peso(record.due_cents)}</dd>
          </div>
        </dl>
        {record.payment.method && (
          <p>
            Initial payment: <strong>{record.payment.method}</strong>
            {record.payment.reference ? ` · ${record.payment.reference}` : ''}
            {record.payment.check_date
              ? ` · Check date: ${record.payment.check_date}`
              : ''}
          </p>
        )}
        {!!record.payments.length && (
          <>
            <h4>Supplier payments</h4>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Method / Reference</th>
                  <th>Paid</th>
                </tr>
              </thead>
              <tbody>
                {record.payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.payment_date}</td>
                    <td>
                      {p.method}
                      <small>{p.reference}</small>
                    </td>
                    <td>{peso(p.amount_cents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {(record.postdated_check || record.payment.pdc) && (
          <p className="purchase-pdc-note">
            Post-dated check:{' '}
            {record.postdated_check?.check_number ||
              record.payment.pdc?.check_number}{' '}
            ·{' '}
            {record.postdated_check?.check_date ||
              record.payment.pdc?.check_date}{' '}
            · {record.postdated_check?.status || 'Pending'}
            {' · '}
            {peso(
              record.postdated_check?.amount_cents ??
                cents(record.payment.pdc?.amount || '0'),
            )}
            {record.postdated_check?.status !== 'cleared' &&
              ' — does not reduce the amount due until cleared.'}
          </p>
        )}
        {record.notes && (
          <p className="collection-receipt-remarks">Notes: {record.notes}</p>
        )}
        {!!record.attachments.length && (
          <div className="collection-receipt-files">
            <h4>Attachment</h4>
            {record.attachments.map((a) =>
              preview ? (
                <span key={a.index}>{a.name}</span>
              ) : (
                <a
                  key={a.index}
                  href={`${purchasesEndpoint}/${record.id}/attachments/${a.index}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {a.name}
                </a>
              ),
            )}
          </div>
        )}
        <footer>
          {preview
            ? 'Preview only. No transaction has been saved.'
            : 'Saved purchase record. Supplier invoice and payment evidence are retained separately.'}
        </footer>
      </article>
      {receiving && (
        <form
          className="rp-customer-form"
          onSubmit={(e) => {
            e.preventDefault()
            void receive()
          }}
        >
          <h3>Record Delivery</h3>
          {error && <p role="alert">{error}</p>}
          <fieldset disabled={busy || retrying} className="pe-line-form">
            <label>
              Receiving date
              <input
                type="date"
                required
                min={record.purchase_date}
                max={today()}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            {outstanding.map((line) => (
              <label key={line.id}>
                {line.name} ({line.remaining} outstanding)
                <input
                  type="number"
                  min="0"
                  max={line.remaining}
                  step="0.0001"
                  value={quantities[line.id] || ''}
                  onChange={(e) =>
                    setQuantities({ ...quantities, [line.id]: e.target.value })
                  }
                />
              </label>
            ))}
          </fieldset>
          <div className="collection-dialog-actions">
            <button
              type="button"
              disabled={busy || retrying}
              onClick={() => setReceiving(false)}
            >
              Cancel
            </button>
            <button className="primary" disabled={busy}>
              {busy ? 'Saving…' : retrying ? 'Retry Delivery' : 'Save Delivery'}
            </button>
          </div>
        </form>
      )}
      <div className="collection-dialog-actions">
        {!preview && outstanding.length > 0 && !receiving && (
          <button
            onClick={() => {
              setReceiving(true)
              setError('')
            }}
          >
            Record Delivery
          </button>
        )}
        <button disabled={busy} onClick={onClose}>
          Close
        </button>
        <button className="primary" onClick={() => window.print()}>
          Print
        </button>
      </div>
    </PaymentDialog>
  )
}
function centsValue(value: string) {
  return Math.round(Number(value) * 100)
}
