import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  Paperclip,
  Plus,
  X,
} from 'lucide-react'
import cashHandImg from '../../../assets/icons/cash-hand.png'
import cardIcon from '../../../assets/svg/card.svg'
import calculatorIcon from '../../../assets/svg/calculator.svg'
import customerLedgerIcon from '../../../assets/svg/Customer-ledger-svg.svg'
import humanIcon from '../../../assets/svg/human.svg'
import messageIcon from '../../../assets/svg/message.svg'
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
const emptyPaymentBootstrap: PaymentBootstrap = {
  company: { name: '', currency: 'PHP' },
  customers: [],
  open_items: [],
  accounts: [],
  payment_methods: [],
}
const bootstrapCacheKey = 'simplebiz.collections.bootstrap.v1'

function readCachedBootstrap(): PaymentBootstrap | null {
  try {
    const stored = window.sessionStorage.getItem(bootstrapCacheKey)
    if (!stored) return null

    const value = JSON.parse(stored) as Partial<PaymentBootstrap>
    if (
      value.company &&
      Array.isArray(value.customers) &&
      Array.isArray(value.open_items) &&
      Array.isArray(value.accounts) &&
      Array.isArray(value.payment_methods)
    ) {
      return value as PaymentBootstrap
    }
  } catch {
    // Browser storage can be unavailable in restricted preview environments.
  }

  return null
}

function cacheBootstrap(value: PaymentBootstrap) {
  try {
    window.sessionStorage.setItem(bootstrapCacheKey, JSON.stringify(value))
  } catch {
    // The page can still use the response when browser storage is unavailable.
  }
}

function clearCachedBootstrap() {
  try {
    window.sessionStorage.removeItem(bootstrapCacheKey)
  } catch {
    // The live page state can still be invalidated if storage is unavailable.
  }
}

function withBootstrapDefaults(
  form: PaymentPayload,
  value: PaymentBootstrap | null,
): PaymentPayload {
  if (!value) return form

  const customerKey = value.customers.some(
    (customer) => customer.key === form.customer_key,
  )
    ? form.customer_key
    : value.open_items[0]?.customer_key || value.customers[0]?.key || ''
  const tenders = form.tenders.map((tender) => {
    const account =
      value.accounts.find(
        (candidate) =>
          candidate.id === tender.account_id &&
          candidate.payment_methods.includes(tender.method),
      ) ||
      value.accounts.find((candidate) =>
        candidate.payment_methods.includes(tender.method),
      )
    return { ...tender, account_id: account?.id || '' }
  })

  return {
    ...form,
    customer_key: customerKey,
    tenders,
    applications: form.applications.filter((application) =>
      value.open_items.some(
        (item) =>
          item.id === application.sale_id && item.customer_key === customerKey,
      ),
    ),
  }
}

function SkeletonBar({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`rp-skeleton-bar ${className}`} />
}

function ReceivePaymentSkeleton() {
  return (
    <div
      className="rp-skeleton"
      role="status"
      aria-label="Loading receive payment data"
    >
      <div className="rp-skeleton-workspace">
        <SkeletonBar className="rp-skeleton-breadcrumb" />
        <div className="rp-skeleton-heading">
          <SkeletonBar className="rp-skeleton-page-icon" />
          <div>
            <SkeletonBar className="rp-skeleton-page-title" />
            <SkeletonBar className="rp-skeleton-page-description" />
          </div>
        </div>
        <div className="rp-skeleton-main">
          <section className="rp-panel rp-skeleton-card rp-skeleton-customer">
            <div className="rp-skeleton-card-heading">
              <SkeletonBar className="rp-skeleton-section-title" />
              <SkeletonBar className="rp-skeleton-button" />
              <SkeletonBar className="rp-skeleton-button rp-skeleton-button-wide" />
            </div>
            <div className="rp-skeleton-customer-fields">
              {[0, 1, 2].map((field) => (
                <div className="rp-skeleton-field" key={field}>
                  <SkeletonBar className="rp-skeleton-label" />
                  <SkeletonBar className="rp-skeleton-input" />
                </div>
              ))}
            </div>
            <div className="rp-skeleton-customer-details">
              <SkeletonBar className="rp-skeleton-detail-name" />
              <SkeletonBar className="rp-skeleton-detail-line" />
              <SkeletonBar className="rp-skeleton-balance-label" />
              <SkeletonBar className="rp-skeleton-balance-value" />
            </div>
          </section>
          <section className="rp-panel rp-skeleton-card rp-skeleton-amount">
            <SkeletonBar className="rp-skeleton-section-title" />
            <SkeletonBar className="rp-skeleton-amount-input" />
          </section>
          <section className="rp-panel rp-skeleton-card rp-skeleton-methods">
            <div className="rp-skeleton-card-heading">
              <SkeletonBar className="rp-skeleton-section-title" />
              <SkeletonBar className="rp-skeleton-button rp-skeleton-button-wide" />
            </div>
            <div className="rp-skeleton-method-columns">
              {[0, 1, 2, 3].map((column) => (
                <SkeletonBar className="rp-skeleton-label" key={column} />
              ))}
            </div>
            <div className="rp-skeleton-table-rows">
              {[0, 1, 2, 3, 4].map((row) => (
                <div className="rp-skeleton-method-row" key={row}>
                  {[0, 1, 2, 3].map((column) => (
                    <SkeletonBar className="rp-skeleton-input" key={column} />
                  ))}
                </div>
              ))}
            </div>
          </section>
          <section className="rp-panel rp-skeleton-card rp-skeleton-balances">
            <div className="rp-skeleton-card-heading">
              <SkeletonBar className="rp-skeleton-section-title rp-skeleton-section-title-wide" />
              <SkeletonBar className="rp-skeleton-button" />
              <SkeletonBar className="rp-skeleton-button rp-skeleton-button-wide" />
            </div>
            <div className="rp-skeleton-table-heading">
              {[0, 1, 2, 3, 4, 5].map((column) => (
                <SkeletonBar className="rp-skeleton-label" key={column} />
              ))}
            </div>
            <div className="rp-skeleton-table-rows">
              {[0, 1, 2, 3].map((row) => (
                <div className="rp-skeleton-balance-row" key={row}>
                  {[0, 1, 2, 3, 4, 5].map((column) => (
                    <SkeletonBar className="rp-skeleton-cell" key={column} />
                  ))}
                </div>
              ))}
            </div>
          </section>
        </div>
        <aside className="rp-panel rp-skeleton-card rp-skeleton-summary">
          <SkeletonBar className="rp-skeleton-section-title" />
          <div className="rp-skeleton-summary-block">
            {[0, 1, 2].map((row) => (
              <div className="rp-skeleton-summary-row" key={row}>
                <SkeletonBar className="rp-skeleton-label" />
                <SkeletonBar className="rp-skeleton-summary-value" />
              </div>
            ))}
          </div>
          <SkeletonBar className="rp-skeleton-divider" />
          <div className="rp-skeleton-summary-block">
            {[0, 1, 2].map((row) => (
              <div className="rp-skeleton-summary-row" key={row}>
                <SkeletonBar className="rp-skeleton-label" />
                <SkeletonBar className="rp-skeleton-summary-value" />
              </div>
            ))}
          </div>
          <SkeletonBar className="rp-skeleton-divider" />
          <SkeletonBar className="rp-skeleton-summary-wide" />
          <SkeletonBar className="rp-skeleton-summary-wide rp-skeleton-summary-emphasis" />
          <SkeletonBar className="rp-skeleton-summary-wide rp-skeleton-summary-short" />
          <SkeletonBar className="rp-skeleton-summary-emphasis rp-skeleton-summary-total" />
          <SkeletonBar className="rp-skeleton-summary-note" />
        </aside>
      </div>
      <div className="rp-skeleton-bottom-row">
        <div className="rp-panel rp-skeleton-card rp-skeleton-remarks">
          <SkeletonBar className="rp-skeleton-message-icon" />
          <SkeletonBar className="rp-skeleton-section-title" />
          <SkeletonBar className="rp-skeleton-chevron" />
        </div>
        <div className="rp-skeleton-actions">
          {[0, 1, 2, 3, 4].map((button) => (
            <SkeletonBar className="rp-skeleton-action-button" key={button} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ReceivePaymentPage() {
  const navigate = useNavigate()
  const [initialData] = useState<PaymentBootstrap | null>(readCachedBootstrap)
  const [data, setData] = useState<PaymentBootstrap>(
    initialData || emptyPaymentBootstrap,
  )
  const [hasLiveBootstrap, setHasLiveBootstrap] = useState(Boolean(initialData))
  const [bootstrapLoading, setBootstrapLoading] = useState(!initialData)
  const [form, setForm] = useState<PaymentPayload>(() =>
    withBootstrapDefaults(emptyForm(), initialData),
  )
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [validationAttempted, setValidationAttempted] = useState(false)
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
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 10_000)

    collectionRequest<{ data: PaymentBootstrap }>('bootstrap', {
      signal: controller.signal,
    })
      .then(({ data: value }) => {
        if (!active) return
        setData(value)
        setHasLiveBootstrap(true)
        cacheBootstrap(value)
        setError('')
        setForm((f) => withBootstrapDefaults(f, value))
      })
      .catch((e: unknown) => {
        if (!active) return
        if (e instanceof Error && e.name === 'AbortError') {
          setError(
            'Loading payment data timed out. Check that the backend and database are responding, then retry.',
          )
        } else if (e instanceof Error) {
          setError(e.message)
        } else {
          setError('Unable to load payment data.')
        }
      })
      .finally(() => {
        window.clearTimeout(timeoutId)
        if (active) setBootstrapLoading(false)
      })
    return () => {
      active = false
      window.clearTimeout(timeoutId)
      controller.abort()
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
  const tenderHasAccount = (tender: Tender) =>
    data.accounts.some(
      (account) =>
        account.id === tender.account_id &&
        account.payment_methods.includes(tender.method),
    )
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
    if (!form.receipt_date) return 'Enter a receipt date.'
    if (received <= 0) return 'Enter an amount greater than zero.'
    for (const [index, tender] of form.tenders.entries()) {
      const row = index + 1
      if (!tender.method) return `Choose a payment method for row ${row}.`
      if (!tenderHasAccount(tender))
        return `Select a cash account for payment method ${row}.`
      if (cents(tender.amount) <= 0)
        return `Enter a positive amount for payment method ${row}.`
      if (tender.method !== 'Cash' && !tender.reference.trim())
        return `Enter a reference number for payment method ${row}.`
    }
    if (tenderTotal !== received)
      return `Payment method amounts total ${peso(tenderTotal)}; they must equal ${peso(received)} received.`
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
  const validationMessage = validationAttempted ? validate() : ''
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
    setValidationAttempted(true)
    setError('')
    const message = validate()
    if (message) return
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
    setValidationAttempted(true)
    setError('')
    const message = validate()
    if (message) return
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
      setValidationAttempted(false)
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
        setHasLiveBootstrap(true)
        cacheBootstrap(fresh.data)
      } catch {
        clearCachedBootstrap()
        setHasLiveBootstrap(false)
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


      {error && !validationMessage && (
        <div className="rp-message error" role="alert">
          {error}
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}
      {validationMessage && (
        <div className="rp-message error" role="alert">
          {validationMessage}
        </div>
      )}
      {notice && (
        <div className="rp-message success" role="status">
          {notice}
        </div>
      )}
      {hasLiveBootstrap ? (
        <>
          {!data.accounts.length && (
            <div className="rp-message error">
              No receiving accounts are configured. Run the collection account
              setup on the backend before posting payments.
            </div>
          )}
          <fieldset className="rp-layout" disabled={busy}>
            <div className="rp-workspace">
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
              <div className="rp-main">
                <section className="rp-panel rp-customer">
                  <div className="rp-section-heading">
                    <h2>
                      <img alt="" aria-hidden="true" className="rp-customer-icon" src={humanIcon} />
                      Customer
                    </h2>
                    <div className="rp-actions">
                      <button
                        disabled={!hasLiveBootstrap || !customer}
                        onClick={() => setModal('ledger')}
                      >
                        Customer Ledger
                      </button>
                      <button disabled={!hasLiveBootstrap} onClick={() => setModal('customer')}>
                        + Add New Customer
                      </button>
                    </div>
                  </div>
                  <div className="rp-customer-inputs">
                    <label>
                      Customer
                      <select
                        aria-invalid={validationAttempted && !customer}
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
                        aria-invalid={validationAttempted && !form.receipt_date}
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
                    <img
                      alt=""
                      aria-hidden="true"
                      className="rp-amount-icon"
                      src={cashHandImg}
                    />
                    Amount Received
                  </h2>
                  <label>
                    Amount Received (₱)
                    <input
                      aria-label="Amount received"
                      aria-invalid={validationAttempted && received <= 0}
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
                      <img
                        alt=""
                        aria-hidden="true"
                        className="rp-payment-icon"
                        src={cardIcon}
                      />
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
                                aria-invalid={validationAttempted && !t.method}
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
                                aria-invalid={validationAttempted && !tenderHasAccount(t)}
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
                                aria-invalid={
                                  validationAttempted &&
                                  t.method !== 'Cash' &&
                                  !t.reference.trim()
                                }
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
                                aria-invalid={
                                  validationAttempted &&
                                  (cents(t.amount) <= 0 || tenderTotal !== received)
                                }
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
                      <img
                        alt=""
                        aria-hidden="true"
                        className="rp-ledger-icon"
                        src={customerLedgerIcon}
                      />
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
                                aria-invalid={
                                  validationAttempted &&
                                  !!allocation(i.id) &&
                                  (cents(allocation(i.id)!.amount) <= 0 ||
                                    cents(allocation(i.id)!.amount) > i.balance_cents ||
                                    applied > received)
                                }
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

              </div>
              <aside className="rp-panel rp-summary">
                <h2>
                  <img
                    alt=""
                    aria-hidden="true"
                    className="rp-summary-icon"
                    src={calculatorIcon}
                  />
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
                  <span className="rp-summary-note-icon" aria-hidden="true">
                    i
                  </span>
                  <span>
                    Posting creates a Payment Receipt and updates the selected
                    balances. You can print or send the receipt afterward.
                  </span>
                </p>
              </aside>
            </div>
            <div className="rp-bottom-row">
              <details className="rp-panel rp-remarks">
                <summary>
                  <img
                    alt=""
                    aria-hidden="true"
                    className="rp-message-icon"
                    src={messageIcon}
                  />
                  <span>
                    <strong>Remarks &amp; Attachments</strong>
                    <small>Add a note or attach proof of payment</small>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="rp-remarks-chevron"
                    size={22}
                  />
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
              <div className="rp-actions-area">
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
                    disabled={busy || !hasLiveBootstrap}
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
                  <button disabled={busy || !hasLiveBootstrap} onClick={() => void saveDraft()}>
                    Save as Draft
                  </button>
                  <button disabled={busy} onClick={previewReceipt}>
                    Preview Receipt
                  </button>
                  <button
                    className="primary"
                    disabled={busy || !hasLiveBootstrap || !data.accounts.length}
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
              </div>
            </div>
          </fieldset>
        </>
      ) : bootstrapLoading ? (
        <ReceivePaymentSkeleton />
      ) : (
        <div className="rp-panel rp-bootstrap-unavailable" role="status">
          Customer and open balance data could not be loaded. Use Retry to try again.
        </div>
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
