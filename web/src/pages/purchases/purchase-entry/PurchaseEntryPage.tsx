import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Calculator,
  ChevronDown,
  CreditCard,
  Info,
  MessageSquare,
  PackagePlus,
  Paperclip,
  Plus,
  Search,
  Ellipsis,
  PackageCheck,
  TriangleAlert,
  X,
} from 'lucide-react'
import purchaseIcon from '../../../assets/icons/cashier.png'
import { PaymentDialog } from '../../collections/receive-payment/PaymentDialog'
import { PurchaseDocument } from './PurchaseDocument'
import { PurchaseLineDialog } from './PurchaseLineDialog'
import {
  addDays,
  calculate,
  intendedUses,
  receivingLabels,
  type ReceivingMode,
  cents,
  decimal,
  peso,
  PurchaseApiError,
  purchaseRequest,
  today,
  type PaymentMode,
  type Product,
  type PurchaseBootstrap,
  type PurchaseForm,
  type PurchaseItem,
  type PurchaseRecord,
  type Supplier,
} from './api'
import './purchase-entry.css'

const METHODS = ['Cash', 'Bank Transfer', 'Check', 'E-Wallet', 'Credit Card']
function initialForm(mode: PaymentMode): PurchaseForm {
  return {
    supplier_id: '',
    purchase_date: today(),
    invoice_number: '',
    items: [],
    notes: '',
    attachments: [],
    payment_mode: mode,
    payment_method: 'Bank Transfer',
    cash_account_id: '',
    amount_paid: '0.00',
    due_date: addDays(today(), 30),
    reference: '',
    pdc: null,
    receiving_mode: 'all',
  }
}

export function PurchaseEntryPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState<PurchaseForm>(() =>
    initialForm(params.get('payment') === 'later' ? 'later' : 'full'),
  )
  const [data, setData] = useState<PurchaseBootstrap | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const working = useRef(false)
  const pending = useRef<{ body: string; key: string } | null>(null)
  const [uncertain, setUncertain] = useState(false)
  const [picker, setPicker] = useState(false)
  const [editor, setEditor] = useState<{
    index: number | null
    initial?: PurchaseItem
    useOnly?: boolean
  } | null>(null)
  const [menu, setMenu] = useState<{
    index: number
    x: number
    y: number
  } | null>(null)
  const [removeIndex, setRemoveIndex] = useState<number | null>(null)
  const [receivingHelp, setReceivingHelp] = useState(false)
  const [pdcOpen, setPdcOpen] = useState(true)
  const [showUse, setShowUse] = useState(false)
  const [search, setSearch] = useState('')
  const searchBox = useRef<HTMLInputElement>(null)
  const [infoOpen, setInfoOpen] = useState(true)
  const [modal, setModal] = useState<'supplier' | 'drafts' | null>(null)
  const [supplierName, setSupplierName] = useState('')
  const [drafts, setDrafts] = useState<
    { id: string; date: string; invoice_number: string }[]
  >([])
  const [document, setDocument] = useState<{
    record: PurchaseRecord
    preview: boolean
  } | null>(null)
  useEffect(() => {
    let active = true
    purchaseRequest<{ data: PurchaseBootstrap }>('bootstrap')
      .then(({ data: value }) => {
        if (!active) return
        setData(value)
        setForm((f) => ({
          ...f,
          cash_account_id:
            value.accounts.find((a) =>
              a.payment_methods.includes('Bank Transfer'),
            )?.id || '',
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
  const totals = useMemo(
    () => (data ? calculate(form.items, data) : null),
    [data, form.items],
  )
  const total = totals?.total_cents || 0
  const paid =
    form.payment_mode === 'full'
      ? total
      : form.payment_mode === 'later'
        ? 0
        : cents(form.amount_paid)
  const due = total - paid
  const supplier = data?.suppliers.find((s) => s.id === form.supplier_id)
  const compatible = (method: string) =>
    data?.accounts.filter((a) =>
      a.payment_methods.includes(method === 'Check' ? 'Cheque' : method),
    ) || []
  const payload = (): PurchaseForm => ({
    ...form,
    amount_paid: decimal(paid),
    due_date: form.payment_mode === 'full' ? null : form.due_date,
    payment_method: form.payment_mode === 'later' ? null : form.payment_method,
    cash_account_id:
      form.payment_mode === 'later' ? null : form.cash_account_id,
    reference: form.payment_mode === 'later' ? '' : form.reference,
    pdc: form.payment_mode === 'later' ? form.pdc : null,
  })
  function update(patch: Partial<PurchaseForm>) {
    setForm((f) => ({ ...f, ...patch }))
    setNotice('')
  }
  function add(product: Product) {
    setEditor({
      index: null,
      initial: {
        product_id: product.id,
        quantity: '1',
        unit_cost: product.cost,
        discount_percent: '0',
        tax_id: product.tax_id,
        intended_use: 'sale',
        received_quantity: '0',
      },
    })
    setSearch('')
    setPicker(false)
  }
  async function run(action: () => Promise<void>) {
    if (working.current) return
    working.current = true
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
      working.current = false
      setBusy(false)
    }
  }
  function validate(): string {
    if (!supplier) return 'Select a supplier.'
    if (!form.purchase_date || !form.invoice_number.trim())
      return 'Enter the purchase date and supplier invoice number.'
    if (!form.items.length || total <= 0 || total > 9999999999)
      return 'Add purchased items with a valid positive total.'
    if (form.notes.length > 250)
      return 'Purchase notes must be 250 characters or fewer.'
    if (form.receiving_mode === 'partial') {
      const quantities = form.items.map((item) =>
        Number(item.received_quantity || 0),
      )
      if (
        quantities.some(
          (qty, i) => qty < 0 || qty > Number(form.items[i].quantity),
        ) ||
        !quantities.some((qty) => qty > 0) ||
        !quantities.some((qty, i) => qty < Number(form.items[i].quantity))
      ) {
        return 'Enter quantities received for a delivery with some items still outstanding.'
      }
    }
    if (
      form.items.some(
        (l) =>
          Number(l.quantity) <= 0 ||
          Number(l.quantity) > 10000 ||
          Number(l.unit_cost) < 0 ||
          Number(l.unit_cost) > 99999999.99 ||
          Number(l.discount_percent) < 0 ||
          Number(l.discount_percent) > 100,
      )
    )
      return 'Check item quantities, unit costs, and discounts.'
    if (form.payment_mode === 'partial' && (paid <= 0 || paid >= total))
      return 'A partial payment must be greater than zero and less than the total purchase.'
    if (due > 0 && (!form.due_date || form.due_date < form.purchase_date))
      return 'Choose a due date on or after the purchase date.'
    if (
      paid > 0 &&
      (!form.cash_account_id ||
        (form.payment_method !== 'Cash' && !form.reference.trim()))
    )
      return 'Choose the payment account and enter a reference or check number for non-cash payments.'
    if (
      form.pdc &&
      (form.payment_mode !== 'later' ||
        !form.pdc.account_id ||
        !form.pdc.check_number.trim() ||
        form.pdc.check_date <= form.purchase_date ||
        cents(form.pdc.amount) <= 0 ||
        cents(form.pdc.amount) > total)
    )
      return 'Complete the post-dated check with a future date and an amount no greater than the amount due.'
    return ''
  }
  function preview() {
    const message = validate()
    if (message) {
      setError(message)
      return
    }
    if (!data || !supplier || !totals) return
    setDocument({
      preview: true,
      record: {
        id: '',
        purchase_number: '[Assigned when saved]',
        purchase_date: form.purchase_date,
        invoice_number: form.invoice_number,
        due_date: due > 0 ? form.due_date : null,
        company: data.company,
        supplier,
        totals: {
          ...totals,
          lines: totals.lines.map((item) => ({
            ...item,
            received_quantity:
              form.receiving_mode === 'none'
                ? '0'
                : form.receiving_mode === 'partial'
                  ? item.received_quantity || '0'
                  : item.quantity,
          })),
        },
        receiving_mode: form.receiving_mode || 'all',
        total_cents: total,
        paid_cents: paid,
        due_cents: due,
        notes: form.notes,
        attachments: form.attachments.map((a, index) => ({
          name: a.name,
          mime: a.mime,
          index,
        })),
        payment: {
          mode: form.payment_mode,
          method: paid > 0 ? form.payment_method : null,
          account_id: paid > 0 ? form.cash_account_id : null,
          reference: form.reference,
          check_date:
            form.payment_method === 'Check' && paid > 0
              ? form.purchase_date
              : null,
          pdc: form.pdc,
        },
        payments: [],
        postdated_check: null,
      },
    })
  }
  async function save() {
    const message = validate()
    if (message) {
      setError(message)
      return
    }
    await run(async () => {
      pending.current ??= {
        body: JSON.stringify(payload()),
        key: crypto.randomUUID(),
      }
      try {
        const result = await purchaseRequest<{ data: PurchaseRecord }>('', {
          method: 'POST',
          headers: { 'Idempotency-Key': pending.current.key },
          body: pending.current.body,
        })
        pending.current = null
        setUncertain(false)
        setDocument({ record: result.data, preview: false })
        setForm({
          ...initialForm('full'),
          cash_account_id: compatible('Bank Transfer')[0]?.id || '',
        })
        setNotice(`Purchase ${result.data.purchase_number} saved successfully.`)
      } catch (e) {
        if (
          e instanceof PurchaseApiError &&
          e.status >= 400 &&
          e.status < 500 &&
          e.status !== 409
        ) {
          pending.current = null
          setUncertain(false)
        } else setUncertain(true)
        throw e
      }
    })
  }
  async function saveDraft() {
    await run(async () => {
      const result = await purchaseRequest<{ data: { id: string } }>('drafts', {
        method: 'POST',
        body: JSON.stringify({
          ...payload(),
          supplier_id: form.supplier_id || null,
          invoice_number: form.invoice_number || null,
        }),
      })
      update({ draft_id: result.data.id })
      setNotice('Draft saved. No stock or supplier balances have changed.')
    })
  }
  async function attach(file: File | undefined) {
    if (!file) return
    await run(async () => {
      if (
        !['image/png', 'image/jpeg', 'application/pdf'].includes(file.type) ||
        file.size > 10 * 1024 * 1024
      )
        throw new Error('Use a PNG, JPG, or PDF up to 10 MB.')
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result).split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      update({ attachments: [{ name: file.name, mime: file.type, content }] })
    })
  }
  const matching =
    data?.products.filter((p) =>
      `${p.code} ${p.name}`.toLowerCase().includes(search.toLowerCase()),
    ) || []
  return (
    <div className="purchase-entry">
      <nav className="pe-breadcrumb" aria-label="Breadcrumb">
        <button onClick={() => navigate('/purchases')}>
          Purchases &amp; Suppliers
        </button>
        <span>›</span>
        <span>Purchase Entry</span>
      </nav>
      <header className="pe-header">
        <img src={purchaseIcon} alt="" />
        <div>
          <h1>Purchase</h1>
          <p>
            Record goods, materials, or supplies acquired for your business.
          </p>
        </div>
      </header>
      {error && (
        <div className="pe-message pe-error" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="pe-message pe-success" role="status">
          {notice}
        </div>
      )}
      {uncertain && (
        <div className="pe-message pe-error">
          The last save has an uncertain result. Retry Save Transaction with the
          same submission, or check Purchase History before starting another
          transaction.
        </div>
      )}
      {loading ? (
        <section className="pe-panel" role="status">
          Loading purchase data…
        </section>
      ) : !data || !totals ? (
        <section className="pe-panel">
          <button onClick={() => window.location.reload()}>Retry</button>
        </section>
      ) : (
        <>
          <fieldset disabled={busy || uncertain} className="pe-layout">
            <div className="pe-main">
              <section className="pe-panel">
                <div className="pe-section-head">
                  <h2>
                    <Info size={21} className="pe-info-icon" />
                    Purchase Information
                  </h2>
                  <button
                    className="pe-icon-button"
                    aria-label={
                      infoOpen
                        ? 'Collapse Purchase Information'
                        : 'Expand Purchase Information'
                    }
                    onClick={() => setInfoOpen((v) => !v)}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
                {infoOpen && (
                  <div className="pe-info-grid">
                    <label>
                      Supplier
                      <div className="pe-supplier-select">
                        <select
                          aria-label="Supplier"
                          value={form.supplier_id}
                          onChange={(e) => {
                            const s = data.suppliers.find(
                              (s) => s.id === e.target.value,
                            )
                            update({
                              supplier_id: e.target.value,
                              due_date: addDays(
                                form.purchase_date,
                                s?.terms_days ?? 30,
                              ),
                            })
                          }}
                        >
                          <option value="">Select supplier</option>
                          {data.suppliers.map((s) => (
                            <option value={s.id} key={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        {form.supplier_id && (
                          <button
                            aria-label="Clear supplier"
                            onClick={() => update({ supplier_id: '' })}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                      <button
                        className="pe-inline-link"
                        onClick={() => setModal('supplier')}
                      >
                        + Add Supplier
                      </button>
                    </label>
                    <label>
                      Purchase Date
                      <input
                        aria-label="Purchase date"
                        type="date"
                        value={form.purchase_date}
                        onChange={(e) =>
                          update({
                            purchase_date: e.target.value,
                            due_date: addDays(
                              e.target.value,
                              supplier?.terms_days ?? 30,
                            ),
                          })
                        }
                      />
                    </label>
                    <label>
                      Supplier Invoice No.
                      <input
                        aria-label="Supplier invoice number"
                        maxLength={120}
                        value={form.invoice_number}
                        onChange={(e) =>
                          update({ invoice_number: e.target.value })
                        }
                      />
                    </label>
                    <label>
                      Purchase No.
                      <input value={data.next_number} disabled />
                    </label>
                  </div>
                )}
              </section>
              <section className="pe-panel">
                <div className="pe-section-head">
                  <h2>
                    <PackagePlus size={21} className="pe-gold-icon" />
                    Items Purchased
                  </h2>
                  <div className="pe-item-tools">
                    <button
                      className="pe-inline-link"
                      aria-pressed={showUse}
                      onClick={() => setShowUse(!showUse)}
                    >
                      {showUse ? 'Hide Intended Use' : 'Per-item Intended Use'}
                    </button>
                    <button onClick={() => setEditor({ index: null })}>
                      <Plus size={13} /> Add Item
                    </button>
                  </div>
                </div>
                <div className="pe-table-scroll">
                  <table
                    className={`pe-items ${showUse || form.receiving_mode === 'partial' ? 'pe-items-expanded' : ''}`}
                  >
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Item / Description</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Unit Cost</th>
                        <th>Disc %</th>
                        <th>Tax</th>
                        <th>Amount</th>
                        {form.receiving_mode === 'partial' && (
                          <th>Qty Received</th>
                        )}
                        {showUse && <th>Intended Use</th>}
                        <th>
                          <span className="sr-only">Item actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {totals.lines.map((l, i) => (
                        <tr key={`${l.product_id}-${i}`}>
                          <td>{i + 1}</td>
                          <td>
                            <small>{l.code}</small>
                            <strong>{l.name}</strong>
                          </td>
                          <td>{l.quantity}</td>
                          <td>{l.unit}</td>
                          <td>{peso(cents(l.unit_cost))}</td>
                          <td>{l.discount_percent}</td>
                          <td>{l.tax_name}</td>
                          <td className="pe-line-amount">
                            <strong>{peso(l.net_cents)}</strong>
                          </td>
                          {form.receiving_mode === 'partial' && (
                            <td>{l.received_quantity || '0'}</td>
                          )}
                          {showUse && (
                            <td>{intendedUses[l.intended_use || 'sale']}</td>
                          )}
                          <td>
                            <button
                              className="pe-icon-button"
                              aria-label={`Actions for ${l.code}`}
                              onClick={(event) => {
                                const rect =
                                  event.currentTarget.getBoundingClientRect()
                                setMenu({
                                  index: i,
                                  x: Math.max(8, rect.right - 205),
                                  y: Math.min(
                                    rect.bottom,
                                    window.innerHeight - 122,
                                  ),
                                })
                              }}
                            >
                              <Ellipsis size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {!form.items.length && (
                        <tr>
                          <td
                            colSpan={
                              9 +
                              Number(showUse) +
                              Number(form.receiving_mode === 'partial')
                            }
                            className="pe-empty"
                          >
                            Search below or add an item to start your purchase.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="pe-product-search">
                  <Search size={21} />
                  <input
                    ref={searchBox}
                    aria-label="Search purchase items"
                    value={search}
                    placeholder="Search or enter an item, material, or supply…"
                    onFocus={() => setPicker(true)}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPicker(true)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') setPicker(false)
                      if (e.key === 'Enter' && matching[0]) {
                        e.preventDefault()
                        add(matching[0])
                      }
                    }}
                  />
                  {picker && (
                    <div className="pe-product-options">
                      <div className="pe-product-picker-heading">
                        <span>Choose an item</span>
                        <button
                          aria-label="Close item picker"
                          onClick={() => setPicker(false)}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {matching.map((p) => (
                        <button key={p.id} onClick={() => add(p)}>
                          <span>
                            <strong>{p.name}</strong>
                            <small>
                              {p.code} · {p.unit}
                            </small>
                          </span>
                          <span>{peso(cents(p.cost))}</span>
                        </button>
                      ))}
                      {!matching.length && <p>No matching items.</p>}
                    </div>
                  )}
                </div>
              </section>
              <div className="pe-receiving-row">
                <section className="pe-panel">
                  <div className="pe-section-head">
                    <h2>
                      <MessageSquare size={20} className="pe-gold-icon" />
                      Notes &amp; Attachment
                    </h2>
                  </div>
                  <div className="pe-notes-grid">
                    <div className="pe-notes-field">
                      <textarea
                        aria-label="Purchase notes"
                        placeholder="Notes / remarks…"
                        maxLength={250}
                        rows={3}
                        value={form.notes}
                        onChange={(e) => update({ notes: e.target.value })}
                      />
                      <span>{form.notes.length}/250</span>
                    </div>
                    <div className="pe-attachment">
                      <Paperclip size={20} />
                      <div>
                        <span>
                          Attachment:{' '}
                          {form.attachments[0]?.name || '[ File Name ]'}
                        </span>
                        <small>[Max 10 MB]</small>
                        {form.attachments.length > 0 && (
                          <button
                            className="pe-inline-link"
                            onClick={() => update({ attachments: [] })}
                          >
                            Remove attachment
                          </button>
                        )}
                      </div>
                      <label className="pe-file-button">
                        Attach File
                        <input
                          aria-label="Attach purchase file"
                          type="file"
                          accept="image/png,image/jpeg,application/pdf"
                          onChange={(e) => {
                            void attach(e.target.files?.[0])
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </section>
                <section className="pe-panel pe-receiving">
                  <h2>
                    <PackageCheck size={21} className="pe-gold-icon" />{' '}
                    Receiving
                  </h2>
                  <label htmlFor="purchase-receiving">
                    Have you received the purchased goods?
                  </label>
                  <button
                    className="pe-icon-button"
                    aria-label="About purchase receiving"
                    onClick={() => setReceivingHelp(true)}
                  >
                    <Info size={15} />
                  </button>
                  <select
                    id="purchase-receiving"
                    value={form.receiving_mode || 'all'}
                    onChange={(event) =>
                      update({
                        receiving_mode: event.target.value as ReceivingMode,
                      })
                    }
                  >
                    {Object.entries(receivingLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </section>
              </div>
            </div>
            <aside className="pe-side">
              <section className="pe-panel pe-payment">
                <h2>
                  <CreditCard size={21} className="pe-gold-icon" />
                  Payment
                </h2>
                <label>
                  How was this purchase paid?
                  <select
                    aria-label="Purchase payment status"
                    value={form.payment_mode}
                    onChange={(e) =>
                      update({
                        payment_mode: e.target.value as PaymentMode,
                        pdc: null,
                        amount_paid: '0.00',
                      })
                    }
                  >
                    <option value="full">Paid in full</option>
                    <option value="partial">Partially Paid</option>
                    <option value="later">Pay Later (Accounts Payable)</option>
                  </select>
                </label>
                {form.payment_mode !== 'later' ? (
                  <>
                    <label>
                      Payment Method *
                      <select
                        aria-label="Purchase payment method"
                        value={form.payment_method || 'Bank Transfer'}
                        onChange={(e) =>
                          update({
                            payment_method: e.target.value,
                            cash_account_id:
                              compatible(e.target.value)[0]?.id || '',
                            reference: '',
                          })
                        }
                      >
                        {METHODS.map((m) => (
                          <option key={m}>{m}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Paid From
                      <select
                        aria-label="Paid from account"
                        value={form.cash_account_id || ''}
                        onChange={(e) =>
                          update({ cash_account_id: e.target.value })
                        }
                      >
                        <option value="">Select account</option>
                        {compatible(form.payment_method || '').map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    {form.payment_method !== 'Cash' && (
                      <label>
                        {form.payment_method === 'Check'
                          ? 'Check Number'
                          : 'Reference No.'}
                        <input
                          aria-label={
                            form.payment_method === 'Check'
                              ? 'Check number'
                              : 'Payment reference'
                          }
                          value={form.reference}
                          maxLength={120}
                          onChange={(e) =>
                            update({ reference: e.target.value })
                          }
                        />
                      </label>
                    )}
                    <div className="pe-payment-grid">
                      {form.payment_method === 'Check' && (
                        <label>
                          Date of Check
                          <input
                            aria-label="Date of check"
                            type="date"
                            value={form.purchase_date}
                            readOnly
                            onClick={() =>
                              setNotice(
                                'Paid-in-full and partial-payment checks use the purchase date. To enter a future-dated check, choose Pay Later and Add PDC.',
                              )
                            }
                          />
                        </label>
                      )}
                      <label>
                        Amount Paid
                        <input
                          aria-label="Purchase amount paid"
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            form.payment_mode === 'full'
                              ? decimal(total)
                              : form.amount_paid
                          }
                          readOnly={form.payment_mode === 'full'}
                          onChange={(e) =>
                            update({ amount_paid: e.target.value })
                          }
                        />
                      </label>
                      {form.payment_mode === 'partial' && (
                        <label>
                          Total Purchase
                          <input value={decimal(total)} disabled />
                        </label>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="pe-payment-grid">
                    <label>
                      Total Purchase
                      <input value={decimal(total)} disabled />
                    </label>
                    <label>
                      Amount Due
                      <input value={decimal(total)} disabled />
                    </label>
                  </div>
                )}
                {form.payment_mode !== 'full' && (
                  <div className="pe-payment-grid">
                    {form.payment_mode === 'partial' && (
                      <label>
                        Amount Due
                        <input value={decimal(due)} disabled />
                      </label>
                    )}
                    <label>
                      Due Date
                      <input
                        aria-label="Purchase due date"
                        type="date"
                        min={form.purchase_date}
                        value={form.due_date || ''}
                        onChange={(e) => update({ due_date: e.target.value })}
                      />
                    </label>
                  </div>
                )}
                {form.payment_mode === 'later' && (
                  <div className="pe-pdc">
                    <p>Have a post-dated check?</p>
                    <button
                      aria-expanded={!!form.pdc && pdcOpen}
                      onClick={() => {
                        if (form.pdc) {
                          setPdcOpen(!pdcOpen)
                          return
                        }
                        setPdcOpen(true)
                        update({
                          pdc: {
                            account_id: compatible('Check')[0]?.id || '',
                            check_number: '',
                            check_date:
                              form.due_date || addDays(form.purchase_date, 30),
                            amount: decimal(total),
                          },
                        })
                      }}
                    >
                      {form.pdc && pdcOpen
                        ? 'Hide PDC Details'
                        : '+ Add / View PDC'}
                    </button>
                    {form.pdc && pdcOpen && (
                      <>
                        <label>
                          Paid From
                          <select
                            aria-label="PDC account"
                            value={form.pdc.account_id}
                            onChange={(e) =>
                              update({
                                pdc: {
                                  ...form.pdc!,
                                  account_id: e.target.value,
                                },
                              })
                            }
                          >
                            <option value="">Select bank account</option>
                            {compatible('Check').map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label>
                          Check Number
                          <input
                            aria-label="PDC check number"
                            value={form.pdc.check_number}
                            onChange={(e) =>
                              update({
                                pdc: {
                                  ...form.pdc!,
                                  check_number: e.target.value,
                                },
                              })
                            }
                          />
                        </label>
                        <label>
                          Check Date
                          <input
                            aria-label="PDC check date"
                            type="date"
                            min={addDays(form.purchase_date, 1)}
                            value={form.pdc.check_date}
                            onChange={(e) =>
                              update({
                                pdc: {
                                  ...form.pdc!,
                                  check_date: e.target.value,
                                },
                              })
                            }
                          />
                        </label>
                        <label>
                          Check Amount
                          <input
                            aria-label="PDC amount"
                            type="number"
                            min="0.01"
                            max={decimal(total)}
                            step="0.01"
                            value={form.pdc.amount}
                            onChange={(e) =>
                              update({
                                pdc: { ...form.pdc!, amount: e.target.value },
                              })
                            }
                          />
                        </label>
                        <p>Amount due changes when the check is cleared.</p>
                        <button onClick={() => update({ pdc: null })}>
                          Remove PDC
                        </button>
                      </>
                    )}
                  </div>
                )}
              </section>
              <section className="pe-panel pe-summary">
                <h2>
                  <Calculator size={21} />
                  Summary
                </h2>
                <dl>
                  <div>
                    <dt>Total Before Discount</dt>
                    <dd>{peso(totals.gross_cents)}</dd>
                  </div>
                  <div>
                    <dt>Less: Line Discounts</dt>
                    <dd>{peso(totals.discount_cents)}</dd>
                  </div>
                  <div className="pe-summary-subtotal">
                    <dt>Subtotal</dt>
                    <dd>{peso(totals.subtotal_cents)}</dd>
                  </div>
                  <div>
                    <dt>
                      Add:{' '}
                      {data.taxes.length === 1 ? data.taxes[0].name : 'Tax'}
                    </dt>
                    <dd>{peso(totals.tax_cents)}</dd>
                  </div>
                </dl>
                <div className="pe-grand-total">
                  <span>Total Purchase</span>
                  <strong>{peso(total)}</strong>
                </div>
              </section>
              <section className="pe-paid-panel">
                <div>
                  <span>Amount Paid</span>
                  <strong>{peso(paid)}</strong>
                </div>
                <div>
                  <span>Amount Due</span>
                  <strong>{peso(due)}</strong>
                </div>
              </section>
              <button className="pe-transaction-preview" onClick={preview}>
                Transaction Preview ›
              </button>
            </aside>
          </fieldset>
          <footer className="pe-footer">
            <button
              disabled={busy}
              onClick={() => {
                if (
                  form.items.length &&
                  !window.confirm(
                    'Leave this purchase? Unsaved changes will be lost.',
                  )
                )
                  return
                navigate('/purchases')
              }}
            >
              Cancel
            </button>
            <button
              disabled={busy || uncertain}
              onClick={() => void saveDraft()}
            >
              Save as Draft
            </button>
            <button disabled={busy || uncertain} onClick={preview}>
              Print Preview
            </button>
            <button
              className="pe-primary"
              disabled={busy}
              onClick={() => void save()}
            >
              {busy
                ? 'Please wait…'
                : uncertain
                  ? 'Retry Save Transaction'
                  : 'Save Transaction'}
            </button>
          </footer>
          <div className="pe-bottom-links">
            <button
              disabled={busy || uncertain}
              onClick={() =>
                void run(async () => {
                  const result = await purchaseRequest<{ data: typeof drafts }>(
                    'drafts',
                  )
                  setDrafts(result.data)
                  setModal('drafts')
                })
              }
            >
              Load Draft
            </button>
            <button onClick={() => navigate('/purchases/history')}>
              Purchase History →
            </button>
          </div>
        </>
      )}
      {menu &&
        createPortal(
          <>
            <button
              className="pe-menu-dismiss"
              aria-label="Close item actions"
              onClick={() => setMenu(null)}
            />
            <div
              className="pe-item-menu"
              style={{ left: menu.x, top: menu.y }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setMenu(null)
              }}
            >
              <button
                autoFocus
                onClick={() => {
                  setEditor({
                    index: menu.index,
                    initial: form.items[menu.index],
                  })
                  setMenu(null)
                }}
              >
                View/Edit Item Details
              </button>
              <button
                onClick={() => {
                  setEditor({
                    index: menu.index,
                    initial: form.items[menu.index],
                    useOnly: true,
                  })
                  setMenu(null)
                }}
              >
                Change Intended Use
              </button>
              <button
                onClick={() => {
                  setRemoveIndex(menu.index)
                  setMenu(null)
                }}
              >
                Remove Item
              </button>
            </div>
          </>,
          window.document.body,
        )}
      {data && editor && (
        <PurchaseLineDialog
          data={data}
          initial={editor.initial}
          editing={editor.index !== null}
          useOnly={!!editor.useOnly}
          partial={form.receiving_mode === 'partial'}
          onClose={() => setEditor(null)}
          onRemove={
            editor.index === null || editor.useOnly
              ? undefined
              : () => {
                  setRemoveIndex(editor.index)
                  setEditor(null)
                }
          }
          onSave={(item) => {
            update({
              items:
                editor.index === null
                  ? [...form.items, item]
                  : form.items.map((old, i) =>
                      i === editor.index ? item : old,
                    ),
            })
            setEditor(null)
          }}
        />
      )}
      {removeIndex !== null && (
        <PaymentDialog
          title="Remove Item"
          className="pe-dialog"
          onClose={() => setRemoveIndex(null)}
        >
          <p className="pe-remove-message">
            <TriangleAlert size={25} /> Remove this item from the purchase?
          </p>
          <div className="collection-dialog-actions">
            <button onClick={() => setRemoveIndex(null)}>Cancel</button>
            <button
              className="primary"
              onClick={() => {
                update({
                  items: form.items.filter((_, i) => i !== removeIndex),
                })
                setRemoveIndex(null)
              }}
            >
              Remove Item
            </button>
          </div>
        </PaymentDialog>
      )}
      {receivingHelp && (
        <PaymentDialog
          title="Receiving purchased goods"
          className="pe-dialog"
          onClose={() => setReceivingHelp(false)}
        >
          <dl className="pe-receiving-help">
            <dt>All Received</dt>
            <dd>
              Records every purchased quantity as received when you save. The
              item and its intended use determine the inventory or expense
              treatment.
            </dd>
            <dt>Not Yet Received</dt>
            <dd>Keeps all quantities outstanding for a later delivery.</dd>
            <dt>Partially Received</dt>
            <dd>
              Shows Qty Received in the table. Use View/Edit Item Details to
              enter each delivered quantity.
            </dd>
          </dl>
          <div className="collection-dialog-actions">
            <button onClick={() => setReceivingHelp(false)}>Done</button>
          </div>
        </PaymentDialog>
      )}
      {document && (
        <PurchaseDocument
          record={document.record}
          preview={document.preview}
          onClose={() => setDocument(null)}
        />
      )}
      {modal === 'supplier' && (
        <PaymentDialog title="Add Supplier" onClose={() => setModal(null)}>
          <form
            className="rp-customer-form"
            onSubmit={(e) => {
              e.preventDefault()
              void run(async () => {
                const result = await purchaseRequest<{ data: Supplier }>(
                  'suppliers',
                  {
                    method: 'POST',
                    body: JSON.stringify({
                      name: supplierName,
                      terms_days: 30,
                    }),
                  },
                )
                setData((d) =>
                  d ? { ...d, suppliers: [...d.suppliers, result.data] } : d,
                )
                update({ supplier_id: result.data.id })
                setSupplierName('')
                setModal(null)
              })
            }}
          >
            <label>
              Supplier name
              <input
                required
                value={supplierName}
                maxLength={160}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </label>
            {error && <p role="alert">{error}</p>}
            <button disabled={busy} className="primary">
              Add Supplier
            </button>
          </form>
        </PaymentDialog>
      )}
      {modal === 'drafts' && (
        <PaymentDialog
          title="Load Purchase Draft"
          onClose={() => setModal(null)}
        >
          <div className="rp-draft-list">
            {error && <p role="alert">{error}</p>}
            {!drafts.length && <p>No saved purchase drafts.</p>}
            {drafts.map((d) => (
              <button
                key={d.id}
                disabled={busy}
                onClick={() =>
                  void run(async () => {
                    const result = await purchaseRequest<{
                      data: PurchaseForm
                    }>(`drafts/${d.id}`)
                    setForm({
                      ...result.data,
                      supplier_id: result.data.supplier_id || '',
                      invoice_number: result.data.invoice_number || '',
                      notes: result.data.notes || '',
                      reference: result.data.reference || '',
                    })
                    setModal(null)
                    setNotice(
                      'Draft loaded. Review your purchase before saving.',
                    )
                  })
                }
              >
                <strong>{d.invoice_number || 'Untitled purchase'}</strong>
                <span>{d.date}</span>
              </button>
            ))}
          </div>
        </PaymentDialog>
      )}
    </div>
  )
}
