import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Banknote,
  CreditCard,
  List,
  MessageCircle,
  Paperclip,
  Plus,
  ReceiptText,
  UserRound,
  X,
} from 'lucide-react'
import cashHandImg from '../../../assets/icons/cash-hand.png'
import {
  cents,
  CollectionApiError,
  collectionRequest,
  decimal,
  peso,
  today,
  type DraftRow,
  type PaymentBootstrap,
  type PaymentCustomer,
  type PaymentPayload,
  type ProofFile,
  type Receipt,
  type Tender,
} from './api'
import { PaymentDialog } from './PaymentDialog'
import { PaymentReceipt } from './PaymentReceipt'
import './receive-payment.css'

const emptyTender = (): Tender => ({
  method: 'Bank Transfer',
  account_id: '',
  reference: '',
  amount: '',
})
const emptyForm = (): PaymentPayload => ({
  customer_key: '',
  receipt_date: today(),
  amount: '',
  tenders: [emptyTender()],
  applications: [],
  remarks: '',
  attachments: [],
})

export function ReceivePaymentPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<PaymentBootstrap | null>(null)
  const [form, setForm] = useState<PaymentPayload>(emptyForm)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const requestRef = useRef<{ key: string; payload: string } | null>(null)
  const [order, setOrder] = useState('oldest')
  const [modal, setModal] = useState<'customer' | 'ledger' | 'drafts' | null>(
    null,
  )
  const [newName, setNewName] = useState('')
  const [drafts, setDrafts] = useState<DraftRow[]>([])
  const [receipt, setReceipt] = useState<{
    value: Receipt
    preview: boolean
  } | null>(null)

  useEffect(() => {
    let active = true
    collectionRequest<{ data: PaymentBootstrap }>('bootstrap')
      .then(({ data: value }) => {
        if (!active) return
        setData(value)
        setForm((f) => ({
          ...f,
          customer_key:
            value.open_items[0]?.customer_key || value.customers[0]?.key || '',
          tenders: [
            {
              ...emptyTender(),
              account_id:
                value.accounts.find((a) =>
                  a.payment_methods.includes('Bank Transfer'),
                )?.id || '',
            },
          ],
        }))
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
  }, [])

  const customer = data?.customers.find((c) => c.key === form.customer_key)
  const items = (
    data?.open_items.filter((i) => i.customer_key === form.customer_key) || []
  ).sort((a, b) => {
    const first = Date.parse(a.due_date || a.date) || 0
    const second = Date.parse(b.due_date || b.date) || 0
    return order === 'oldest' ? first - second : second - first
  })
  const outstanding = items.reduce((sum, i) => sum + i.balance_cents, 0)
  const received = cents(form.amount)
  const applied = form.applications.reduce((sum, a) => sum + cents(a.amount), 0)
  const tenderTotal = form.tenders.reduce((sum, t) => sum + cents(t.amount), 0)
  const allocation = (id: string) =>
    form.applications.find((a) => a.sale_id === id)

  function update<K extends keyof PaymentPayload>(
    key: K,
    value: PaymentPayload[K],
  ) {
    setForm((f) => ({ ...f, [key]: value }))
    setNotice('')
  }
  function setApplication(id: string, value: string, selected = true) {
    setForm((f) => ({
      ...f,
      applications: [
        ...f.applications.filter((a) => a.sale_id !== id),
        ...(selected ? [{ sale_id: id, amount: value }] : []),
      ],
    }))
  }
  function autoApply() {
    let remaining = received
    const applications = items.flatMap((i) => {
      const value = Math.min(i.balance_cents, remaining)
      remaining -= value
      return value > 0 ? [{ sale_id: i.id, amount: decimal(value) }] : []
    })
    update('applications', applications)
  }
  function changeAmount(amount: string) {
    setForm((f) => ({
      ...f,
      amount,
      tenders:
        f.tenders.length === 1 ? [{ ...f.tenders[0], amount }] : f.tenders,
    }))
  }
  function changeTender(index: number, patch: Partial<Tender>) {
    setForm((f) => ({
      ...f,
      tenders: f.tenders.map((t, i) => (i === index ? { ...t, ...patch } : t)),
    }))
  }
  function validate(): string {
    if (!customer) return 'Select a customer.'
    if (!form.receipt_date || received <= 0)
      return 'Enter a receipt date and an amount greater than zero.'
    if (
      form.tenders.some(
        (t) =>
          !t.account_id ||
          cents(t.amount) <= 0 ||
          (t.method !== 'Cash' && !t.reference.trim()),
      )
    )
      return 'Complete every payment method, cash account, amount, and non-cash reference number.'
    if (tenderTotal !== received)
      return 'Payment method amounts must equal the amount received.'
    if (applied > received)
      return 'Applied amounts cannot exceed the amount received.'
    if (
      form.applications.some(
        (a) =>
          cents(a.amount) <= 0 ||
          cents(a.amount) >
            (items.find((i) => i.id === a.sale_id)?.balance_cents ?? 0),
      )
    )
      return 'Each selected invoice needs a positive amount no greater than its balance.'
    return ''
  }
  async function run(action: () => Promise<void>) {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await action()
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Unable to complete the request.',
      )
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }
  function previewReceipt() {
    const message = validate()
    if (message) {
      setError(message)
      return
    }
    if (!data || !customer) return
    setError('')
    setReceipt({
      preview: true,
      value: {
        id: '',
        receipt_number: '[Assigned when posted]',
        receipt_date: form.receipt_date,
        amount_cents: received,
        applied_cents: applied,
        unapplied_cents: received - applied,
        company: data.company,
        customer,
        remarks: form.remarks,
        tenders: form.tenders.map((t) => ({
          ...t,
          account_name:
            data.accounts.find((a) => a.id === t.account_id)?.name || '',
          amount_cents: cents(t.amount),
        })),
        applications: form.applications.map((a) => {
          const item = items.find((i) => i.id === a.sale_id)!
          return {
            ...item,
            amount_cents: cents(a.amount),
            remaining_cents: item.balance_cents - cents(a.amount),
          }
        }),
        attachments: form.attachments.map((a, index) => ({ ...a, index })),
      },
    })
  }
  async function post() {
    const message = validate()
    if (message) {
      setError(message)
      return
    }
    await run(async () => {
      const payload = JSON.stringify(form)
      // Retain the same key and body after a timeout; retrying must not issue a second receipt.
      if (requestRef.current && requestRef.current.payload !== payload)
        throw new Error(
          'A previous posting has an uncertain result. Retry its unchanged form, or check Receipt History before starting another payment.',
        )
      requestRef.current ??= { key: crypto.randomUUID(), payload }
      let saved: Receipt
      try {
        const result = await collectionRequest<{ data: Receipt }>('receipts', {
          method: 'POST',
          headers: { 'Idempotency-Key': requestRef.current.key },
          body: requestRef.current.payload,
        })
        saved = result.data
      } catch (e) {
        if (
          e instanceof CollectionApiError &&
          e.status >= 400 &&
          e.status < 500 &&
          e.status !== 409
        )
          requestRef.current = null
        throw e
      }
      requestRef.current = null
      setReceipt({ value: saved, preview: false })
      setForm({
        ...emptyForm(),
        customer_key: form.customer_key,
        tenders: [
          {
            ...emptyTender(),
            account_id:
              data?.accounts.find((a) =>
                a.payment_methods.includes('Bank Transfer'),
              )?.id || '',
          },
        ],
      })
      setNotice(`Receipt ${saved.receipt_number} posted successfully.`)
      try {
        const fresh = await collectionRequest<{ data: PaymentBootstrap }>(
          'bootstrap',
        )
        setData(fresh.data)
      } catch {
        setData(null)
        setError(
          'Receipt posted successfully, but balances could not refresh. Reload before entering another payment.',
        )
      }
    })
  }
  async function saveDraft() {
    if (!customer || form.tenders.some((t) => !t.account_id)) {
      setError('Select a customer and cash account before saving a draft.')
      return
    }
    await run(async () => {
      const body = {
        ...form,
        amount: form.amount || '0',
        tenders: form.tenders.map((t) => ({ ...t, amount: t.amount || '0' })),
      }
      const result = await collectionRequest<{ data: { id: string } }>(
        'drafts',
        { method: 'POST', body: JSON.stringify(body) },
      )
      setForm((f) => ({ ...f, draft_id: result.data.id }))
      setNotice('Draft saved to the database. No balances have changed.')
    })
  }
  async function loadDraft(id: string) {
    await run(async () => {
      const [draft, fresh] = await Promise.all([
        collectionRequest<{ data: PaymentPayload }>(`drafts/${id}`),
        collectionRequest<{ data: PaymentBootstrap }>('bootstrap'),
      ])
      setForm(draft.data)
      setData(fresh.data)
      setModal(null)
      setNotice(
        'Draft loaded. Review allocations against the latest balances before posting.',
      )
    })
  }
  async function attach(files: FileList | null) {
    if (!files) return
    await run(async () => {
      const next: ProofFile[] = [...form.attachments]
      for (const file of Array.from(files)) {
        if (
          !['image/png', 'image/jpeg', 'application/pdf'].includes(file.type) ||
          file.size > 2 * 1024 * 1024
        )
          throw new Error('Use PNG, JPG, or PDF files up to 2 MB each.')
        const content = await new Promise<string>((resolve, reject) => {
          const r = new FileReader()
          r.onload = () => resolve(String(r.result).split(',')[1])
          r.onerror = reject
          r.readAsDataURL(file)
        })
        next.push({ name: file.name, mime: file.type, content })
      }
      if (
        next.length > 3 ||
        next.reduce((s, f) => s + Math.floor((f.content.length * 3) / 4), 0) >
          3 * 1024 * 1024
      )
        throw new Error('Attach up to 3 files, totaling no more than 3 MB.')
      update('attachments', next)
    })
  }

  return (
    <div className="receive-payment">
      <nav className="rp-breadcrumb" aria-label="Breadcrumb">
        <button onClick={() => navigate('/collections')}>
          Collections &amp; Receipts
        </button>
        <span>›</span>
        <span>Receive Payment</span>
      </nav>
      <header className="rp-heading">
        <img src={cashHandImg} alt="" />
        <div>
          <h1>Receive Payment</h1>
          <p>
            Record money received from a customer and apply it to outstanding
            balances.
          </p>
        </div>
      </header>
      {error && (
        <div className="rp-message error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="rp-message success" role="status">
          {notice}
        </div>
      )}
      {loading ? (
        <div className="rp-panel rp-loading" role="status">
          Loading customers and open balances…
        </div>
      ) : !data ? (
        <div className="rp-panel rp-loading">
          <p>Unable to load payment data.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : (
        <>
          {!data.accounts.length && (
            <div className="rp-message error">
              No receiving accounts are configured. Run the collection account
              setup on the backend before posting payments.
            </div>
          )}
          <fieldset className="rp-workspace" disabled={busy}>
            <div className="rp-main">
              <section className="rp-panel rp-customer">
                <div className="rp-section-heading">
                  <h2>
                    <UserRound className="purple" size={17} />
                    Customer
                  </h2>
                  <div className="rp-actions">
                    <button
                      disabled={!customer}
                      onClick={() => setModal('ledger')}
                    >
                      Customer Ledger
                    </button>
                    <button onClick={() => setModal('customer')}>
                      + Add New Customer
                    </button>
                  </div>
                </div>
                <div className="rp-customer-inputs">
                  <label>
                    Customer
                    <select
                      value={form.customer_key}
                      onChange={(e) => {
                        update('customer_key', e.target.value)
                        update('applications', [])
                      }}
                    >
                      <option value="">Select a customer</option>
                      {data.customers.map((c) => (
                        <option key={c.key} value={c.key}>
                          {c.name} — {c.code}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Receipt Date *
                    <input
                      type="date"
                      value={form.receipt_date}
                      onChange={(e) => update('receipt_date', e.target.value)}
                    />
                  </label>
                  <label>
                    Receipt No.
                    <input value="[ Auto-generated ]" disabled />
                  </label>
                </div>
                <div className="rp-customer-info">
                  <div>
                    <strong>{customer?.name || 'Select a customer'}</strong>
                    <p>
                      {customer
                        ? `${customer.code}${customer.terms ? ` | Terms: ${customer.terms}` : ''} | Open items: ${items.length}`
                        : 'Choose a customer to view outstanding balances.'}
                    </p>
                  </div>
                  <div>
                    <span>Outstanding Balance</span>
                    <strong>{peso(outstanding)}</strong>
                  </div>
                </div>
              </section>
              <section className="rp-panel rp-amount">
                <h2>
                  <Banknote className="green" size={17} />
                  Amount Received
                </h2>
                <label>
                  Amount Received (₱)
                  <input
                    aria-label="Amount received"
                    type="number"
                    min="0"
                    max="999999999.99"
                    step="0.01"
                    value={form.amount}
                    placeholder="0.00"
                    onChange={(e) => changeAmount(e.target.value)}
                  />
                </label>
              </section>
              <section className="rp-panel">
                <div className="rp-section-heading">
                  <h2>
                    <CreditCard size={17} />
                    Payment Method
                  </h2>
                  <button
                    disabled={form.tenders.length >= 10}
                    onClick={() =>
                      update('tenders', [
                        ...form.tenders,
                        {
                          ...emptyTender(),
                          account_id:
                            data.accounts.find((a) =>
                              a.payment_methods.includes('Bank Transfer'),
                            )?.id || '',
                          amount: decimal(Math.max(0, received - tenderTotal)),
                        },
                      ])
                    }
                  >
                    + Add Another Payment Method
                  </button>
                </div>
                <div className="rp-table-scroll">
                  <table className="rp-table rp-tenders">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Method</th>
                        <th>Received Into (Cash Account)</th>
                        <th>Reference No.</th>
                        <th>Amount (₱)</th>
                        <th>
                          <span className="sr-only">Remove</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.tenders.map((t, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>
                            <select
                              aria-label={`Payment method ${index + 1}`}
                              value={t.method}
                              onChange={(e) =>
                                changeTender(index, {
                                  method: e.target.value,
                                  account_id:
                                    data.accounts.find((a) =>
                                      a.payment_methods.includes(
                                        e.target.value,
                                      ),
                                    )?.id || '',
                                })
                              }
                            >
                              {data.payment_methods.map((m) => (
                                <option key={m}>{m}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select
                              aria-label={`Cash account ${index + 1}`}
                              value={t.account_id}
                              onChange={(e) =>
                                changeTender(index, {
                                  account_id: e.target.value,
                                })
                              }
                            >
                              <option value="">Select account</option>
                              {data.accounts
                                .filter((a) =>
                                  a.payment_methods.includes(t.method),
                                )
                                .map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {a.name}
                                  </option>
                                ))}
                            </select>
                          </td>
                          <td>
                            <input
                              aria-label={`Reference number ${index + 1}`}
                              maxLength={120}
                              value={t.reference}
                              placeholder={
                                t.method === 'Cash' ? 'Optional' : 'Required'
                              }
                              onChange={(e) =>
                                changeTender(index, {
                                  reference: e.target.value,
                                })
                              }
                            />
                          </td>
                          <td>
                            <input
                              aria-label={`Payment amount ${index + 1}`}
                              type="number"
                              min="0"
                              step="0.01"
                              value={t.amount}
                              onChange={(e) =>
                                changeTender(index, { amount: e.target.value })
                              }
                            />
                          </td>
                          <td>
                            <button
                              aria-label={`Remove payment method ${index + 1}`}
                              disabled={form.tenders.length === 1}
                              onClick={() =>
                                update(
                                  'tenders',
                                  form.tenders.filter((_, i) => i !== index),
                                )
                              }
                            >
                              <X size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {received > 0 && tenderTotal !== received && (
                  <p className="rp-inline-error">
                    Payment methods total {peso(tenderTotal)}. Difference:{' '}
                    {peso(received - tenderTotal)}.
                  </p>
                )}
              </section>
              <section className="rp-panel rp-balances">
                <div className="rp-section-heading">
                  <h2>
                    <List size={17} />
                    Apply Payment to Open Balances
                  </h2>
                  <div className="rp-actions">
                    <button
                      disabled={!items.length || received <= 0}
                      onClick={autoApply}
                    >
                      Auto Apply
                    </button>
                    <select
                      aria-label="Allocation order"
                      value={order}
                      onChange={(e) => setOrder(e.target.value)}
                    >
                      <option value="oldest">Oldest due first</option>
                      <option value="newest">Newest due first</option>
                    </select>
                    <button onClick={() => update('applications', [])}>
                      Clear
                    </button>
                  </div>
                </div>
                <div className="rp-table-scroll">
                  <table className="rp-table rp-invoices">
                    <thead>
                      <tr>
                        <th>
                          <input
                            type="checkbox"
                            aria-label="Select all open balances"
                            checked={
                              items.length > 0 &&
                              items.every((i) => !!allocation(i.id))
                            }
                            onChange={(e) =>
                              update(
                                'applications',
                                e.target.checked
                                  ? items.map((i) => ({
                                      sale_id: i.id,
                                      amount: decimal(i.balance_cents),
                                    }))
                                  : [],
                              )
                            }
                          />
                        </th>
                        <th>Document No.</th>
                        <th>Date</th>
                        <th>Due Date</th>
                        <th>Total Amount</th>
                        <th>Balance Due</th>
                        <th>Apply Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((i) => (
                        <tr key={i.id}>
                          <td>
                            <input
                              aria-label={`Apply to ${i.document_number}`}
                              type="checkbox"
                              checked={!!allocation(i.id)}
                              onChange={(e) =>
                                setApplication(
                                  i.id,
                                  decimal(
                                    Math.min(
                                      i.balance_cents,
                                      Math.max(0, received - applied),
                                    ),
                                  ),
                                  e.target.checked,
                                )
                              }
                            />
                          </td>
                          <td>{i.document_number}</td>
                          <td>{i.date || '—'}</td>
                          <td>{i.due_date || '—'}</td>
                          <td>{peso(i.total_cents)}</td>
                          <td>{peso(i.balance_cents)}</td>
                          <td>
                            <input
                              aria-label={`Apply amount for ${i.document_number}`}
                              type="number"
                              min="0"
                              max={decimal(i.balance_cents)}
                              step="0.01"
                              value={allocation(i.id)?.amount ?? ''}
                              placeholder="0.00"
                              onChange={(e) =>
                                setApplication(
                                  i.id,
                                  e.target.value,
                                  !!e.target.value,
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                      {!items.length && (
                        <tr>
                          <td colSpan={7} className="rp-empty">
                            No outstanding sales for this customer. You can
                            receive an advance as unapplied customer credit.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
              <details className="rp-panel rp-remarks">
                <summary>
                  <MessageCircle size={15} />
                  <span>
                    <strong>Remarks &amp; Attachments</strong>
                    <small>Add a note or attach proof of payment</small>
                  </span>
                </summary>
                <label className="sr-only" htmlFor="payment-remarks">
                  Remarks
                </label>
                <textarea
                  id="payment-remarks"
                  rows={3}
                  maxLength={2000}
                  value={form.remarks}
                  placeholder="Add payment notes…"
                  onChange={(e) => update('remarks', e.target.value)}
                />
                <label className="rp-upload">
                  <Paperclip size={14} /> Attach proof of payment
                  <input
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,application/pdf"
                    onChange={(e) => {
                      void attach(e.target.files)
                      e.target.value = ''
                    }}
                  />
                </label>
                <small>
                  PNG, JPG, PDF · 2 MB per file · 3 files / 3 MB total
                </small>
                {form.attachments.map((a, i) => (
                  <div className="rp-file" key={i}>
                    <span>{a.name}</span>
                    <button
                      aria-label={`Remove ${a.name}`}
                      onClick={() =>
                        update(
                          'attachments',
                          form.attachments.filter((_, n) => n !== i),
                        )
                      }
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </details>
            </div>
            <aside className="rp-panel rp-summary">
              <h2>
                <ReceiptText size={18} />
                Payment Summary
              </h2>
              <dl>
                <div>
                  <dt>Amount Received</dt>
                  <dd>{peso(received)}</dd>
                </div>
                <div>
                  <dt>Applied to Balances</dt>
                  <dd>{peso(applied)}</dd>
                </div>
                <div>
                  <dt>Unapplied Amount</dt>
                  <dd className={received < applied ? 'rp-inline-error' : ''}>
                    {peso(received - applied)}
                  </dd>
                </div>
              </dl>
              <hr />
              {form.tenders.map((t, i) => (
                <dl key={i} className="rp-summary-tender">
                  <div>
                    <dt>
                      Payment Method{form.tenders.length > 1 ? ` ${i + 1}` : ''}
                    </dt>
                    <dd>{t.method}</dd>
                  </div>
                  <div>
                    <dt>Received Into</dt>
                    <dd>
                      {data.accounts.find((a) => a.id === t.account_id)?.name ||
                        '—'}
                    </dd>
                  </div>
                  <div>
                    <dt>Reference No.</dt>
                    <dd>{t.reference || '—'}</dd>
                  </div>
                </dl>
              ))}
              <hr />
              <div className="rp-application-summary">
                <span>Payment Application</span>
                <strong>
                  {form.applications.filter((a) => cents(a.amount) > 0).length}{' '}
                  open balances will be updated
                </strong>
                <span>Remaining Customer Balance</span>
                <strong>{peso(Math.max(0, outstanding - applied))}</strong>
              </div>
              <p className="rp-summary-note">
                ⓘ Posting issues a payment receipt and updates the selected
                balances. Unapplied money remains as customer credit.
              </p>
            </aside>
          </fieldset>
          <footer className="rp-footer">
            <button
              disabled={busy}
              onClick={() => {
                if (
                  (form.amount || form.remarks || form.attachments.length) &&
                  !window.confirm(
                    'Leave this payment? Unsaved changes will be lost.',
                  )
                )
                  return
                navigate('/collections')
              }}
            >
              Cancel
            </button>
            <button
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  const result = await collectionRequest<{ data: DraftRow[] }>(
                    'drafts',
                  )
                  setDrafts(result.data)
                  setModal('drafts')
                })
              }
            >
              Load Draft
            </button>
            <button disabled={busy} onClick={() => void saveDraft()}>
              Save as Draft
            </button>
            <button disabled={busy} onClick={previewReceipt}>
              Preview Receipt
            </button>
            <button
              className="primary"
              disabled={busy || !data.accounts.length}
              onClick={() => void post()}
            >
              {busy ? 'Please wait…' : 'Post & Issue Receipt'}
            </button>
          </footer>
          <div className="rp-history-link">
            <button onClick={() => navigate('/collections/receipts')}>
              View Receipt History →
            </button>
          </div>
        </>
      )}
      {receipt && (
        <PaymentReceipt
          receipt={receipt.value}
          preview={receipt.preview}
          onClose={() => setReceipt(null)}
        />
      )}
      {modal === 'customer' && (
        <PaymentDialog
          title="Add New Customer"
          onClose={() => !busy && setModal(null)}
        >
          <form
            className="rp-customer-form"
            onSubmit={(e) => {
              e.preventDefault()
              void run(async () => {
                const result = await collectionRequest<{
                  data: PaymentCustomer
                }>('customers', {
                  method: 'POST',
                  body: JSON.stringify({ name: newName }),
                })
                setData((d) =>
                  d ? { ...d, customers: [...d.customers, result.data] } : d,
                )
                setForm((f) => ({
                  ...f,
                  customer_key: result.data.key,
                  applications: [],
                }))
                setNewName('')
                setModal(null)
              })
            }}
          >
            <label>
              Customer name
              <input
                autoFocus
                required
                maxLength={160}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </label>
            <p>
              Creates a customer with no opening balance. Existing saved sales
              keep their original customer identity.
            </p>
            {error && <p role="alert">{error}</p>}
            <button className="primary" disabled={busy || !newName.trim()}>
              <Plus size={14} /> Add Customer
            </button>
          </form>
        </PaymentDialog>
      )}
      {modal === 'ledger' && (
        <PaymentDialog
          title={`Open Balance Ledger — ${customer?.name || ''}`}
          onClose={() => setModal(null)}
        >
          <div className="rp-ledger">
            <p>
              Outstanding: <strong>{peso(outstanding)}</strong>
            </p>
            <p>Current open sales balances after posted collection receipts.</p>
            <table>
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Due date</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>{i.document_number}</td>
                    <td>{i.due_date || '—'}</td>
                    <td>{peso(i.balance_cents)}</td>
                  </tr>
                ))}
                {!items.length && (
                  <tr>
                    <td colSpan={3}>No open balances.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <button onClick={() => navigate('/collections/receipts')}>
              View payment receipts
            </button>
          </div>
        </PaymentDialog>
      )}
      {modal === 'drafts' && (
        <PaymentDialog
          title="Load Draft"
          onClose={() => !busy && setModal(null)}
        >
          <div className="rp-draft-list">
            {error && <p role="alert">{error}</p>}
            {!drafts.length && <p>No saved drafts yet.</p>}
            {drafts.map((d) => (
              <button
                disabled={busy}
                key={d.id}
                onClick={() => void loadDraft(d.id)}
              >
                <strong>
                  {data?.customers.find((c) => c.key === d.customer_key)
                    ?.name || 'Customer'}
                </strong>
                <span>
                  {d.receipt_date} · {peso(cents(d.amount))}
                </span>
                <small>Saved {new Date(d.updated_at).toLocaleString()}</small>
              </button>
            ))}
          </div>
        </PaymentDialog>
      )}
    </div>
  )
}
