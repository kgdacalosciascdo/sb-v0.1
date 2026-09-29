import { collectionEndpoint, peso, type Receipt } from './api'
import { PaymentDialog } from './PaymentDialog'

export function PaymentReceipt({
  receipt,
  preview = false,
  onClose,
}: {
  receipt: Receipt
  preview?: boolean
  onClose: () => void
}) {
  return (
    <PaymentDialog
      title={preview ? 'Preview Payment Receipt' : 'Payment Receipt'}
      onClose={onClose}
    >
      <article className="collection-receipt">
        <header>
          <h3>{receipt.company.name}</h3>
          <p>{preview ? 'PREVIEW — NOT POSTED' : 'PAYMENT RECEIPT'}</p>
          <strong>{receipt.receipt_number}</strong>
        </header>
        <div className="collection-receipt-meta">
          <div>
            <small>Received from</small>
            <strong>{receipt.customer.name}</strong>
            <span>{receipt.customer.code}</span>
          </div>
          <div>
            <small>Receipt date</small>
            <strong>{receipt.receipt_date}</strong>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Payment method / account</th>
              <th>Reference</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {receipt.tenders.map((t, i) => (
              <tr key={i}>
                <td>
                  {t.method}
                  <small>{t.account_name}</small>
                </td>
                <td>{t.reference || '—'}</td>
                <td>{peso(t.amount_cents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h4>Applied to outstanding balances</h4>
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>Applied</th>
              <th>Remaining</th>
            </tr>
          </thead>
          <tbody>
            {receipt.applications.map((a) => (
              <tr key={a.id}>
                <td>{a.document_number}</td>
                <td>{peso(a.amount_cents)}</td>
                <td>{peso(a.remaining_cents)}</td>
              </tr>
            ))}
            {!receipt.applications.length && (
              <tr>
                <td colSpan={3}>
                  No invoice allocation — received as customer credit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <dl>
          <div>
            <dt>Amount received</dt>
            <dd>{peso(receipt.amount_cents)}</dd>
          </div>
          <div>
            <dt>Applied to balances</dt>
            <dd>{peso(receipt.applied_cents)}</dd>
          </div>
          <div>
            <dt>Unapplied customer credit</dt>
            <dd>{peso(receipt.unapplied_cents)}</dd>
          </div>
        </dl>
        {receipt.remarks && (
          <p className="collection-receipt-remarks">
            Remarks: {receipt.remarks}
          </p>
        )}
        {!!receipt.attachments.length && (
          <div className="collection-receipt-files">
            <h4>Proof of payment</h4>
            {receipt.attachments.map((a) =>
              preview ? (
                <span key={a.index}>{a.name}</span>
              ) : (
                <a
                  key={a.index}
                  href={`${collectionEndpoint}/receipts/${receipt.id}/attachments/${a.index}`}
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
            ? 'Preview only. No balances have changed.'
            : 'Payment recorded. This acknowledges payment and does not replace the sales invoice.'}
        </footer>
      </article>
      <div className="collection-dialog-actions">
        <button onClick={onClose}>Close</button>
        <button className="primary" onClick={() => window.print()}>
          Print {preview ? 'Preview' : 'Receipt'}
        </button>
      </div>
    </PaymentDialog>
  )
}
