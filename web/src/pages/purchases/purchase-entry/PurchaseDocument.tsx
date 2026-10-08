import { PaymentDialog } from '../../collections/receive-payment/PaymentDialog'
import { peso, purchasesEndpoint, type PurchaseRecord } from './api'
import '../../collections/receive-payment/receive-payment.css'

export function PurchaseDocument({
  record,
  preview = false,
  onClose,
}: {
  record: PurchaseRecord
  preview?: boolean
  onClose: () => void
}) {
  return (
    <PaymentDialog
      title={preview ? 'Preview Purchase' : 'Purchase Details'}
      onClose={onClose}
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
        <div className="purchase-document-scroll">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
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
      <div className="collection-dialog-actions">
        <button onClick={onClose}>Close</button>
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
