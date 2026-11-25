import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  ChevronDown,
  Info,
  Paperclip,
  Plus,
  Printer,
  Ellipsis,
  ShoppingCart,
  TriangleAlert,
  X,
} from 'lucide-react'
import purchaseIcon from '../../../assets/icons/cashier.png'
import cardIcon from '../../../assets/svg/card.svg'
import calculatorIcon from '../../../assets/svg/calculator.svg'
import cartboxIcon from '../../../assets/svg/cartbox.svg'
import messageIcon from '../../../assets/svg/message.svg'
import receiveItemIcon from '../../../assets/svg/receive-item.svg'
import searchIcon from '../../../assets/svg/search.svg'
import { Select2 } from '../../../components/ui/Select2'
import { PurchaseDialog, lockBodyScroll, unlockBodyScroll } from './PurchaseDialog'
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
  type Totals,
} from './api'

const EMPTY_TOTALS: Totals = {
  lines: [],
  gross_cents: 0,
  discount_cents: 0,
  subtotal_cents: 0,
  tax_cents: 0,
  total_cents: 0,
}

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

function SkeletonBlock({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-[#bce5f7] ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.75) 45%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 255, 255, 0.75) 55%, transparent 100%)',
        }}
      />
    </div>
  )
}

function PetalSpinner({ className = 'size-12' }: { className?: string }) {
  const petals = [
    { rotate: 0, opacity: 0.1 },
    { rotate: 30, opacity: 0.8 },
    { rotate: 60, opacity: 1.0 },
    { rotate: 90, opacity: 0.75 },
    { rotate: 120, opacity: 0.55 },
    { rotate: 150, opacity: 0.42 },
    { rotate: 180, opacity: 0.32 },
    { rotate: 210, opacity: 0.25 },
    { rotate: 240, opacity: 0.2 },
    { rotate: 270, opacity: 0.16 },
    { rotate: 300, opacity: 0.13 },
    { rotate: 330, opacity: 0.1 },
  ]
  return (
    <svg
      className={`${className} animate-spin text-[#1b5895] shrink-0`}
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-hidden="true"
    >
      {petals.map((p, i) => (
        <rect
          key={i}
          x="46"
          y="10"
          width="8"
          height="22"
          rx="4"
          ry="4"
          transform={`rotate(${p.rotate} 50 50)`}
          opacity={p.opacity}
        />
      ))}
    </svg>
  )
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
  const [submittingAction, setSubmittingAction] = useState<'save' | 'draft' | null>(null)
  const [submittingProgress, setSubmittingProgress] = useState<{
    percent: number
    label: string
  }>({ percent: 0, label: 'Processing transaction...' })
  const [errorModal, setErrorModal] = useState<{
    title: string
    message: string
  } | null>(null)
  const [successModal, setSuccessModal] = useState<{
    title: string
    purchaseNumber: string
    supplierName: string
    invoiceNumber?: string
    totalAmount: string
    paidAmount?: string
    dueAmount?: string
    isDraft?: boolean
    record?: PurchaseRecord
  } | null>(null)
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
  const [showUse, setShowUse] = useState(true)
  const [search, setSearch] = useState('')
  const searchBox = useRef<HTMLInputElement>(null)
  const [infoOpen, setInfoOpen] = useState(true)
  const [modal, setModal] = useState<'supplier' | 'drafts' | null>(null)
  const [supplierName, setSupplierName] = useState('')
  const [drafts, setDrafts] = useState<
    { id: string; date: string; invoice_number: string }[]
  >([])
  const [submitted, setSubmitted] = useState(false)
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

  useEffect(() => {
    if (submittingAction || errorModal || successModal) {
      lockBodyScroll()
      return () => {
        unlockBodyScroll()
      }
    }
  }, [submittingAction, errorModal, successModal])

  const totals = useMemo(
    () => (data ? calculate(form.items, data) : EMPTY_TOTALS),
    [data, form.items],
  )
  const total = totals.total_cents
  const paid =
    form.payment_mode === 'full'
      ? total
      : form.payment_mode === 'later'
        ? 0
        : cents(form.amount_paid)
  const due = total - paid
  const supplier = data?.suppliers.find((s) => s.id === form.supplier_id)
  const supplierError = submitted && !form.supplier_id
  const purchaseDateError = submitted && !form.purchase_date
  const invoiceNumberError = submitted && !form.invoice_number.trim()
  const itemsError = submitted && (!form.items.length || total <= 0)
  const dueDateError =
    submitted &&
    due > 0 &&
    (!form.due_date || form.due_date < form.purchase_date)
  const accountError = submitted && paid > 0 && !form.cash_account_id
  const referenceError =
    submitted &&
    paid > 0 &&
    (form.payment_method === 'Bank Transfer' || form.payment_method === 'Check') &&
    !form.reference.trim()
  const amountPaidError =
    submitted &&
    form.payment_mode === 'partial' &&
    (paid <= 0 || paid >= total)
  const pdcAccountError =
    submitted &&
    form.payment_mode === 'later' &&
    !!form.pdc &&
    !form.pdc.account_id
  const pdcNumberError =
    submitted &&
    form.payment_mode === 'later' &&
    !!form.pdc &&
    !form.pdc.check_number.trim()
  const pdcDateError =
    submitted &&
    form.payment_mode === 'later' &&
    !!form.pdc &&
    (!form.pdc.check_date || form.pdc.check_date <= form.purchase_date)
  const pdcAmountError =
    submitted &&
    form.payment_mode === 'later' &&
    !!form.pdc &&
    (cents(form.pdc.amount) <= 0 || cents(form.pdc.amount) > total)
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
      const msg = e instanceof Error ? e.message : 'Unable to complete the request.'
      setError(msg)
      setErrorModal({ title: 'Transaction Error', message: msg })
    } finally {
      working.current = false
      setBusy(false)
    }
  }
  function validate(): { valid: boolean; message: string; firstFieldId?: string } {
    const errors: string[] = []
    let firstFieldId: string | undefined

    if (!supplier) {
      errors.push('Select a supplier.')
      firstFieldId ??= 'purchase-supplier'
    }
    if (!form.purchase_date) {
      errors.push('Enter the purchase date.')
      firstFieldId ??= 'purchase-date'
    }
    if (!form.invoice_number.trim()) {
      errors.push('Enter the supplier invoice number.')
      firstFieldId ??= 'purchase-invoice-number'
    }
    if (!form.items.length || total <= 0 || total > 9999999999) {
      errors.push('Add purchased items with a valid positive total.')
      firstFieldId ??= 'purchase-search-input'
    }
    if (form.notes.length > 250) {
      errors.push('Purchase notes must be 250 characters or fewer.')
      firstFieldId ??= 'purchase-notes'
    }
    if (due > 0 && (!form.due_date || form.due_date < form.purchase_date)) {
      errors.push('Choose a due date on or after the purchase date.')
      firstFieldId ??= 'purchase-due-date'
    }
    if (paid > 0 && !form.cash_account_id) {
      errors.push('Choose the payment account.')
      firstFieldId ??= 'purchase-cash-account'
    }
    if (paid > 0 && form.payment_method === 'Bank Transfer' && !form.reference.trim()) {
      errors.push('Enter a reference number for bank transfer payments.')
      firstFieldId ??= 'purchase-reference'
    }
    if (paid > 0 && form.payment_method === 'Check' && !form.reference.trim()) {
      errors.push('Enter a check number for check payments.')
      firstFieldId ??= 'purchase-reference'
    }
    if (form.payment_mode === 'partial' && (paid <= 0 || paid >= total)) {
      errors.push(
        'A partial payment must be greater than zero and less than the total purchase.',
      )
      firstFieldId ??= 'purchase-amount-paid'
    }
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
        errors.push(
          'Enter quantities received for a delivery with some items still outstanding.',
        )
        firstFieldId ??= 'purchase-items-table'
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
    ) {
      errors.push('Check item quantities, unit costs, and discounts.')
      firstFieldId ??= 'purchase-items-table'
    }
    if (
      form.pdc &&
      (form.payment_mode !== 'later' ||
        !form.pdc.account_id ||
        !form.pdc.check_number.trim() ||
        form.pdc.check_date <= form.purchase_date ||
        cents(form.pdc.amount) <= 0 ||
        cents(form.pdc.amount) > total)
    ) {
      errors.push(
        'Complete the post-dated check with a future date and an amount no greater than the amount due.',
      )
      if (!form.pdc.account_id) firstFieldId ??= 'purchase-pdc-account'
      else if (!form.pdc.check_number.trim()) firstFieldId ??= 'purchase-pdc-number'
      else if (!form.pdc.check_date || form.pdc.check_date <= form.purchase_date) firstFieldId ??= 'purchase-pdc-date'
      else if (cents(form.pdc.amount) <= 0 || cents(form.pdc.amount) > total) firstFieldId ??= 'purchase-pdc-amount'
      else firstFieldId ??= 'purchase-pdc-account'
    }

    if (errors.length === 0) {
      return { valid: true, message: '' }
    }
    return {
      valid: false,
      message:
        errors.length === 1
          ? errors[0]
          : 'Please complete all required fields.',
      firstFieldId,
    }
  }
  function scrollToField(fieldId?: string) {
    if (!fieldId) return
    if (
      ['purchase-supplier', 'purchase-date', 'purchase-invoice-number'].includes(
        fieldId,
      )
    ) {
      setInfoOpen(true)
    }
    if (fieldId.startsWith('purchase-pdc-')) {
      setPdcOpen(true)
    }
    setTimeout(() => {
      const el = window.document.getElementById(fieldId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus({ preventScroll: true })
      }
    }, 120)
  }
  function preview() {
    setSubmitted(true)
    const { valid, message, firstFieldId } = validate()
    if (!valid) {
      setError(message)
      scrollToField(firstFieldId)
      return
    }
    setError('')
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
    setSubmitted(true)
    const { valid, message, firstFieldId } = validate()
    if (!valid) {
      setError(message)
      scrollToField(firstFieldId)
      setErrorModal({ title: 'Validation Required', message })
      return
    }
    setError('')
    setSubmittingProgress({
      percent: 15,
      label: 'Validating purchase entries...',
    })
    setSubmittingAction('save')

    const timer1 = setTimeout(() => {
      setSubmittingProgress({
        percent: 42,
        label: `Encoding ${form.items.length} purchased item${form.items.length === 1 ? '' : 's'}...`,
      })
    }, 200)

    const timer2 = setTimeout(() => {
      setSubmittingProgress({
        percent: 75,
        label: 'Recording transaction & updating inventory...',
      })
    }, 550)

    const timer3 = setTimeout(() => {
      setSubmittingProgress({
        percent: 90,
        label: 'Finalizing purchase & ledger accounts...',
      })
    }, 950)

    try {
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
          clearTimeout(timer1)
          clearTimeout(timer2)
          clearTimeout(timer3)
          setSubmittingProgress({
            percent: 100,
            label: 'Transaction recorded successfully!',
          })
          await new Promise((resolve) => setTimeout(resolve, 350))
          pending.current = null
          setUncertain(false)
          setSubmitted(false)
          setForm({
            ...initialForm('full'),
            cash_account_id: compatible('Bank Transfer')[0]?.id || '',
          })
          setNotice(`Purchase ${result.data.purchase_number} saved successfully.`)
          setSuccessModal({
            title: 'Purchase Submitted Successfully',
            purchaseNumber: result.data.purchase_number,
            supplierName: result.data.supplier?.name || supplier?.name || 'Supplier',
            invoiceNumber: result.data.invoice_number,
            totalAmount: peso(result.data.total_cents),
            paidAmount: peso(result.data.paid_cents),
            dueAmount: peso(result.data.due_cents),
            record: result.data,
          })
        } catch (e) {
          clearTimeout(timer1)
          clearTimeout(timer2)
          clearTimeout(timer3)
          if (
            e instanceof PurchaseApiError &&
            e.status >= 400 &&
            e.status < 500 &&
            e.status !== 409
          ) {
            pending.current = null
            setUncertain(false)
          } else setUncertain(true)
          const msg = e instanceof Error ? e.message : 'Unable to submit purchase transaction.'
          setErrorModal({ title: 'Submission Error', message: msg })
          throw e
        }
      })
    } finally {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      setSubmittingAction(null)
    }
  }
  async function saveDraft() {
    setSubmittingProgress({
      percent: 20,
      label: 'Validating draft details...',
    })
    setSubmittingAction('draft')

    const timer1 = setTimeout(() => {
      setSubmittingProgress({
        percent: 60,
        label: 'Encoding draft details...',
      })
    }, 250)

    const timer2 = setTimeout(() => {
      setSubmittingProgress({
        percent: 85,
        label: 'Saving purchase draft...',
      })
    }, 600)

    try {
      await run(async () => {
        const result = await purchaseRequest<{ data: { id: string } }>('drafts', {
          method: 'POST',
          body: JSON.stringify({
            ...payload(),
            supplier_id: form.supplier_id || null,
            invoice_number: form.invoice_number || null,
          }),
        })
        clearTimeout(timer1)
        clearTimeout(timer2)
        setSubmittingProgress({
          percent: 100,
          label: 'Draft saved successfully!',
        })
        await new Promise((resolve) => setTimeout(resolve, 350))
        update({ draft_id: result.data.id })
        setNotice('Draft saved. No stock or supplier balances have changed.')
        setSuccessModal({
          title: 'Draft Saved Successfully',
          purchaseNumber: 'Draft',
          supplierName: supplier?.name || 'Supplier not specified',
          invoiceNumber: form.invoice_number || undefined,
          totalAmount: peso(total),
          isDraft: true,
        })
      })
    } catch (e) {
      clearTimeout(timer1)
      clearTimeout(timer2)
      const msg = e instanceof Error ? e.message : 'Unable to save purchase draft.'
      setErrorModal({ title: 'Draft Save Error', message: msg })
    } finally {
      clearTimeout(timer1)
      clearTimeout(timer2)
      setSubmittingAction(null)
    }
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
    <div className="space-y-4 pb-12 animate-in fade-in duration-200 text-[#0c3761] text-[13px] leading-relaxed">
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 font-medium" aria-label="Breadcrumb">
        <button
          onClick={() => navigate('/purchases')}
          className="hover:text-sky-700 transition cursor-pointer"
        >
          Purchases &amp; Suppliers
        </button>
        <span>›</span>
        <span className="text-slate-700 font-semibold">Purchase Entry</span>
      </nav>
      {error && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700 shadow-xs" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 shadow-xs" role="status">
          {notice}
        </div>
      )}
      {uncertain && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-800 shadow-xs">
          The last save has an uncertain result. Retry Save Transaction with the
          same submission, or check Purchase History before starting another
          transaction.
        </div>
      )}
      {!loading && !data && (
        <section className="rounded-lg border border-rose-300 bg-rose-50 p-6 text-center">
          <p className="text-xs text-rose-700 font-semibold mb-2">Unable to load purchase data.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-md bg-[#087ae6] text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            Retry
          </button>
        </section>
      )}
      <fieldset disabled={busy || uncertain} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start border-0 p-0 m-0 min-w-0">
        <div className="lg:col-span-8 space-y-4 min-w-0">
          <header className="flex items-center gap-3.5 pb-1">
            <div className="flex w-12 h-12 shrink-0 items-center justify-center overflow-hidden">
              <img
                src={purchaseIcon}
                alt=""
                aria-hidden="true"
                className="w-12 h-12 object-contain scale-[1.8] drop-shadow-xs"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0c3761]">Purchase</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Record goods, materials, or supplies acquired for your business.
              </p>
            </div>
          </header>
          <section className="rounded-lg border border-[#9fd0e2] bg-[#e0f6fd] p-4 sm:p-5 shadow-xs transition-colors hover:border-[#38b4e7]">
            <div className="flex items-center justify-between pb-2.5">
              <div className="flex items-center gap-2">
                <div className="flex size-5 sm:size-5.5 items-center justify-center rounded-full bg-[#0288d1] text-white shrink-0">
                  <Info className="size-3.5" />
                </div>
                <h2 className="text-[14.5px] font-bold text-[#0c3761] tracking-tight">Purchase Information</h2>
              </div>
              <button
                type="button"
                className="rounded p-1 text-slate-400 hover:bg-sky-200/50 hover:text-slate-700 transition cursor-pointer"
                aria-label={
                  infoOpen
                    ? 'Collapse Purchase Information'
                    : 'Expand Purchase Information'
                }
                onClick={() => setInfoOpen((v) => !v)}
              >
                <ChevronDown className={`size-4 transform transition-transform ${infoOpen ? '' : '-rotate-90'}`} />
              </button>
            </div>
            {infoOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">
                    Supplier
                  </label>
                  {loading ? (
                    <div className="space-y-1.5 py-0.5">
                      <SkeletonBlock className="h-[31px] w-full" />
                      <SkeletonBlock className="h-3 w-20" />
                    </div>
                  ) : (
                    <>
                      <Select2
                        id="purchase-supplier"
                        value={form.supplier_id}
                        onChange={(val) => {
                          const s = data?.suppliers.find((s) => s.id === val)
                          update({
                            supplier_id: val,
                            due_date: addDays(
                              form.purchase_date,
                              s?.terms_days ?? 30,
                            ),
                          })
                        }}
                        placeholder="Select supplier"
                        searchPlaceholder="Search suppliers..."
                        clearable
                        error={supplierError}
                        triggerClassName="h-[31px] rounded-md px-2.5 py-1 text-xs"
                        options={
                          data?.suppliers.map((s) => ({
                            value: s.id,
                            label: s.name,
                            sublabel: s.terms_days
                              ? `Terms: ${s.terms_days} days`
                              : undefined,
                          })) ?? []
                        }
                      />
                      <button
                        type="button"
                        className="mt-1 text-[11px] font-semibold text-[#0369a1] hover:underline cursor-pointer"
                        onClick={() => setModal('supplier')}
                      >
                        + Add Supplier
                      </button>
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">
                    Purchase Date
                  </label>
                  <input
                    id="purchase-date"
                    aria-label="Purchase date"
                    aria-invalid={purchaseDateError}
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
                    className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none ${purchaseDateError
                        ? 'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-[#93afd3] focus:border-[#159de9] focus:ring-1 focus:ring-[#159de9]'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">
                    Supplier Invoice No.
                  </label>
                  <input
                    id="purchase-invoice-number"
                    aria-label="Supplier invoice number"
                    aria-invalid={invoiceNumberError}
                    maxLength={120}
                    value={form.invoice_number}
                    onChange={(e) =>
                      update({ invoice_number: e.target.value })
                    }
                    className={`w-full rounded-md border bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none ${invoiceNumberError
                        ? 'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-[#93afd3] focus:border-[#159de9] focus:ring-1 focus:ring-[#159de9]'
                      }`}
                  />
                </div>
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">
                    Purchase No.
                  </label>
                  {loading ? (
                    <SkeletonBlock className="h-[31px] w-full" />
                  ) : (
                    <input
                      value={data?.next_number || '[Auto-generated]'}
                      disabled
                      className="w-full rounded-md border border-[#93afd3] bg-[#d8f1fa] px-2.5 py-1.5 text-xs text-slate-700 cursor-not-allowed font-mono"
                    />
                  )}
                </div>
              </div>
            )}
          </section>
          <section className="rounded-lg border border-[#9fd0e2] bg-[#e0f6fd] p-4 sm:p-5 shadow-xs transition-colors hover:border-[#38b4e7] space-y-3.5">
            <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={cartboxIcon}
                  alt=""
                  aria-hidden="true"
                  className="size-7 shrink-0 object-contain"
                />
                <h2 className="text-base sm:text-lg font-bold text-[#0c3761] tracking-tight">
                  Items Purchased
                </h2>
              </div>
              <div className="flex items-end gap-3.5">
                <button
                  type="button"
                  className="text-xs font-medium text-[#64748b] hover:text-[#0c3761] transition cursor-pointer pb-1"
                  aria-pressed={showUse}
                  onClick={() => setShowUse(!showUse)}
                >
                  {showUse ? '[ Hide Intended Use ]' : '[ Per-item Intended Use ]'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditor({ index: null })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-[#8a8a8a] bg-[#efefef] hover:bg-[#e4e4e4] active:bg-[#dbdbdb] text-xs sm:text-[12.5px] font-medium text-[#111827] shadow-[0_1px_1px_rgba(0,0,0,0.08)] transition cursor-pointer"
                >
                  <Plus size={13} strokeWidth={2.5} className="text-[#111827]" /> Add Item
                </button>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#cbe4ef] bg-white shadow-2xs">
              <table
                id="purchase-items-table"
                className={`w-full text-left text-xs text-slate-700 border-collapse min-w-[700px] ${showUse || form.receiving_mode === 'partial' ? 'min-w-[850px]' : ''}`}
              >
                <thead className="bg-[#f0f4fa] text-[12.5px] font-semibold text-[#71879c] border-b border-[#e2edf4]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center border-r border-[#e8eff5]">#</th>
                    <th className="py-2.5 px-4 min-w-[180px] text-left border-r border-[#e8eff5]">Item / Description</th>
                    <th className="py-2.5 px-3 text-center border-r border-[#e8eff5]">Qty</th>
                    <th className="py-2.5 px-3 text-center border-r border-[#e8eff5]">Unit</th>
                    <th className="py-2.5 px-3 text-center border-r border-[#e8eff5]">Unit Cost</th>
                    <th className="py-2.5 px-3 text-center border-r border-[#e8eff5]">Disc %</th>
                    <th className="py-2.5 px-3 text-center border-r border-[#e8eff5]">Tax</th>
                    <th className="py-2.5 px-4 text-center border-r border-[#e8eff5]">Amount</th>
                    {form.receiving_mode === 'partial' && (
                      <th className="py-2.5 px-3 text-center border-r border-[#e8eff5]">Qty Received</th>
                    )}
                    {showUse && (
                      <th className="py-2.5 px-4 text-left border-r border-[#e8eff5]">Intended Use</th>
                    )}
                    <th className="py-2.5 px-2 w-12 text-center">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {totals.lines.map((l, i) => (
                    <tr key={`${l.product_id}-${i}`} className="border-b border-[#e8eff5] hover:bg-[#f6fbfe] transition">
                      <td className="py-3.5 px-3 text-center text-[#7d91a6] border-r border-[#e8eff5] text-[13px] font-normal">{i + 1}</td>
                      <td className="py-3.5 px-4 border-r border-[#e8eff5]">
                        <span className="block text-[11px] text-[#7d91a6] font-medium leading-tight mb-0.5">{l.code}</span>
                        <span className="block font-semibold text-[#003d73] text-[13px] leading-snug">{l.name}</span>
                      </td>
                      <td className="py-3.5 px-3 text-center text-[#556980] border-r border-[#e8eff5] text-[13px] font-normal">{l.quantity}</td>
                      <td className="py-3.5 px-3 text-center text-[#6b7c93] border-r border-[#e8eff5] text-[13px] font-normal">{l.unit}</td>
                      <td className="py-3.5 px-3 text-center text-[#556980] border-r border-[#e8eff5] text-[13px] font-normal">
                        {peso(cents(l.unit_cost)).replace('₱', '').trim()}
                      </td>
                      <td className="py-3.5 px-3 text-center text-[#556980] border-r border-[#e8eff5] text-[13px] font-normal">
                        {Number(l.discount_percent || 0).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-3 text-center text-[#6b7c93] border-r border-[#e8eff5] text-[12.5px] font-normal">
                        {l.tax_name || 'VAT'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-[#003d73] text-[14px] border-r border-[#e8eff5]">
                        {peso(l.net_cents).replace('₱', '').trim()}
                      </td>
                      {form.receiving_mode === 'partial' && (
                        <td className="py-3.5 px-3 text-center text-[#556980] border-r border-[#e8eff5] text-[13px] font-normal">
                          {l.received_quantity || '0'}
                        </td>
                      )}
                      {showUse && (
                        <td className="py-3.5 px-4 text-left text-[#78889b] border-r border-[#e8eff5] text-[13px] font-normal">
                          {l.intended_use === 'sale' ? 'Sale' : intendedUses[l.intended_use || 'sale'] || l.intended_use}
                        </td>
                      )}
                      <td className="py-3.5 px-2 text-center">
                        <button
                          type="button"
                          className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
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
                          <Ellipsis size={18} />
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
                        className={`py-10 text-center text-xs italic transition-colors ${itemsError
                            ? 'text-rose-600 bg-rose-50/40 font-medium'
                            : 'text-slate-400'
                          }`}
                      >
                        {itemsError
                          ? 'At least one item is required. Search below or click "+ Add Item" to add.'
                          : 'Search below or add an item to start your purchase.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="relative mt-4">
              <div className="relative flex items-center">
                <img
                  src={searchIcon}
                  alt=""
                  aria-hidden="true"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 max-w-[20px] max-h-[20px] object-contain pointer-events-none select-none"
                />
                <input
                  id="purchase-search-input"
                  ref={searchBox}
                  aria-label="Search purchase items"
                  aria-invalid={itemsError}
                  value={search}
                  placeholder="Search or enter an item, material, or supply..."
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
                  className={`w-full h-12 rounded-full border bg-white pl-12 pr-5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none shadow-2xs transition-colors ${itemsError
                      ? 'border-rose-500 ring-1 ring-rose-500/50 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                      : 'border-[#8ec7df] focus:border-[#0070d2] focus:ring-1 focus:ring-[#0070d2]'
                    }`}
                />
              </div>
              {picker && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-20 max-h-60 overflow-y-auto rounded-lg border border-[#9fd0e2] bg-white p-2 shadow-lg space-y-1">
                  <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1">
                    <span>Choose an item</span>
                    <button
                      type="button"
                      aria-label="Close item picker"
                      onClick={() => setPicker(false)}
                      className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  {matching.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => add(p)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-sky-50 text-left text-xs transition cursor-pointer"
                    >
                      <div>
                        <strong className="block text-slate-800 font-semibold">{p.name}</strong>
                        <small className="text-slate-400 font-mono">
                          {p.code} · {p.unit}
                        </small>
                      </div>
                      <span className="font-mono font-bold text-[#0c3761]">{peso(cents(p.cost))}</span>
                    </button>
                  ))}
                  {!matching.length && <p className="py-3 text-center text-xs text-slate-400 italic">No matching items.</p>}
                </div>
              )}
            </div>
          </section>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            <section className="md:col-span-7 lg:col-span-8 rounded-lg border border-[#9fd0e2] bg-[#e0f6fd] px-4 sm:px-5 py-3 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center">
                  <img
                    src={messageIcon}
                    alt=""
                    aria-hidden="true"
                    className="size-5 shrink-0 object-contain scale-[1.55]"
                  />
                </div>
                <h2 className="text-[14.5px] font-bold text-[#0c3761] tracking-tight">
                  Notes &amp; Attachment
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                <div className="relative">
                  <textarea
                    id="purchase-notes"
                    aria-label="Purchase notes"
                    placeholder="Notes / remarks..."
                    maxLength={250}
                    rows={2}
                    value={form.notes}
                    onChange={(e) => update({ notes: e.target.value })}
                    className="w-full h-[66px] rounded-lg border border-[#5b96b5] bg-white p-2.5 pr-14 text-xs text-slate-800 placeholder-slate-400 focus:border-[#0070d2] focus:outline-none focus:ring-1 focus:ring-[#0070d2] resize-none shadow-2xs"
                  />
                  <span className="absolute bottom-2 right-2.5 text-[11px] text-[#7d91a6] pointer-events-none select-none">
                    {form.notes.length}/250
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Paperclip size={24} className="text-[#556980] shrink-0 mt-0.5" />
                  <div className="space-y-1 min-w-0 flex-1">
                    <div>
                      <span className="block truncate text-[12.5px] text-[#556980]">
                        Attachment: [ {form.attachments[0]?.name || 'Name of File'} ]
                      </span>
                    </div>
                    <div className="flex items-center gap-3.5 flex-wrap">
                      <span className="text-[11.5px] text-[#7d91a6]">
                        [Max 10 MB]
                      </span>
                      <label className="inline-flex items-center justify-center px-3.5 py-1 rounded-lg border border-[#94a3b8] bg-[#f8fafc] hover:bg-white text-xs font-semibold text-[#1e293b] shadow-2xs cursor-pointer transition">
                        Attach File
                        <input
                          aria-label="Attach purchase file"
                          type="file"
                          accept="image/png,image/jpeg,application/pdf"
                          onChange={(e) => {
                            void attach(e.target.files?.[0])
                            e.target.value = ''
                          }}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    {form.attachments.length > 0 && (
                      <button
                        type="button"
                        className="block text-[11px] text-rose-500 hover:underline pt-0.5 cursor-pointer"
                        onClick={() => update({ attachments: [] })}
                      >
                        Remove attachment
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
            <section className="md:col-span-5 lg:col-span-4 rounded-lg border border-[#9fd0e2] bg-[#e0f6fd] px-4 sm:px-5 py-3 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center">
                  <img
                    src={receiveItemIcon}
                    alt=""
                    aria-hidden="true"
                    className="size-5 shrink-0 object-contain scale-[1.5]"
                  />
                </div>
                <h2 className="text-[14.5px] font-bold text-[#0c3761] tracking-tight">
                  Receiving
                </h2>
              </div>
              <div>
                <div className="flex items-center gap-1 mb-1.5">
                  <label htmlFor="purchase-receiving" className="text-[11.5px] font-medium text-slate-600">
                    Have you received the purchased goods?
                  </label>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label="About purchase receiving"
                    onClick={() => setReceivingHelp(true)}
                  >
                    <Info size={14} />
                  </button>
                </div>
                <select
                  id="purchase-receiving"
                  value={form.receiving_mode || 'all'}
                  onChange={(event) =>
                    update({
                      receiving_mode: event.target.value as ReceivingMode,
                    })
                  }
                  className="w-full rounded-md border border-[#93afd3] bg-white px-3 py-2 text-xs text-slate-800 focus:border-[#159de9] focus:outline-none focus:ring-1 focus:ring-[#159de9]"
                >
                  {Object.entries(receivingLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          </div>
        </div>
        <aside className="lg:col-span-4 space-y-4 min-w-0">
          <section className="rounded-lg border border-[#9fd0e2] bg-[#e0f6fd] p-4 sm:p-5 shadow-xs transition-colors hover:border-[#38b4e7] space-y-3.5">
            <div className="flex items-center gap-2 pb-1">
              <img
                src={cardIcon}
                alt=""
                aria-hidden="true"
                className="size-6 sm:size-7 shrink-0 object-contain"
              />
              <h2 className="text-[14.5px] font-bold text-[#0c3761] tracking-tight">Payment</h2>
            </div>
            <div>
              <label className="block text-[12px] sm:text-[12.5px] font-semibold text-[#475569] mb-1.5">
                How was this purchase paid?
              </label>
              <div className="relative flex items-center">
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
                  className="w-full appearance-none rounded-lg border border-[#507ea1] bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-[13px] text-[#475569] focus:border-[#159de9] focus:outline-none focus:ring-1 focus:ring-[#159de9] cursor-pointer"
                >
                  <option value="full">Paid in full</option>
                  <option value="partial">Partially Paid</option>
                  <option value="later">Pay Later (Accounts Payable)</option>
                </select>
                <div className="pointer-events-none absolute right-3 flex items-center">
                  <ChevronDown size={18} strokeWidth={2.2} className="text-[#556980]" />
                </div>
              </div>
            </div>
            {form.payment_mode !== 'later' ? (
              <>
                <div>
                  <label className="block text-[12px] sm:text-[12.5px] font-semibold text-[#475569] mb-1.5">
                    Payment Method <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
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
                      className="w-full appearance-none rounded-lg border border-[#507ea1] bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-[13px] text-[#475569] focus:border-[#159de9] focus:outline-none focus:ring-1 focus:ring-[#159de9] cursor-pointer"
                    >
                      {METHODS.map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-3 flex items-center">
                      <ChevronDown size={18} strokeWidth={2.2} className="text-[#556980]" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] sm:text-[12.5px] font-semibold text-[#475569] mb-1.5">
                    Paid From
                  </label>
                  {loading ? (
                    <SkeletonBlock className="h-[38px] w-full" />
                  ) : (
                    <div className="relative flex items-center">
                      <select
                        id="purchase-cash-account"
                        aria-label="Paid from account"
                        aria-invalid={accountError}
                        value={form.cash_account_id || ''}
                        onChange={(e) =>
                          update({ cash_account_id: e.target.value })
                        }
                        className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-[13px] text-[#475569] focus:outline-none cursor-pointer ${accountError
                            ? 'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-[#507ea1] focus:border-[#159de9] focus:ring-1 focus:ring-[#159de9]'
                          }`}
                      >
                        <option value="" className="text-slate-800 bg-white">Select account</option>
                        {compatible(form.payment_method || '').map((a) => (
                          <option key={a.id} value={a.id} className="text-slate-800 bg-white">
                            {a.name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 flex items-center">
                        <ChevronDown size={18} strokeWidth={2.2} className="text-[#556980]" />
                      </div>
                    </div>
                  )}
                </div>
                {(form.payment_method === 'Bank Transfer' || form.payment_method === 'Check') && (
                  <div>
                    <label className="block text-[12px] sm:text-[12.5px] font-semibold text-[#475569] mb-1.5">
                      {form.payment_method === 'Bank Transfer' ? 'Reference Number' : 'Check Number'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="purchase-reference"
                      aria-label={form.payment_method === 'Bank Transfer' ? 'Reference number' : 'Check number'}
                      aria-invalid={referenceError}
                      value={form.reference}
                      maxLength={120}
                      placeholder={form.payment_method === 'Bank Transfer' ? 'e.g. TR-982341' : 'e.g. CHK-123456'}
                      onChange={(e) =>
                        update({ reference: e.target.value })
                      }
                      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-xs sm:text-[13px] text-[#475569] focus:outline-none ${referenceError
                          ? 'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                          : 'border-[#507ea1] focus:border-[#159de9] focus:ring-1 focus:ring-[#159de9]'
                        }`}
                    />
                  </div>
                )}
                <div>
                  <label className="block text-[12px] sm:text-[12.5px] font-semibold text-[#475569] mb-1.5">
                    Amount Paid
                  </label>
                  <input
                    id="purchase-amount-paid"
                    aria-label="Purchase amount paid"
                    aria-invalid={amountPaidError}
                    type="text"
                    value={
                      form.payment_mode === 'full'
                        ? peso(total).replace('₱', '').trim()
                        : form.amount_paid
                    }
                    readOnly={form.payment_mode === 'full'}
                    onChange={(e) =>
                      update({ amount_paid: e.target.value })
                    }
                    className={`w-36 sm:w-40 rounded-lg border bg-white px-3.5 py-2 text-xs sm:text-[13px] text-[#475569] text-right font-mono focus:outline-none ${amountPaidError
                        ? 'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-[#507ea1] focus:border-[#159de9] focus:ring-1 focus:ring-[#159de9]'
                      }`}
                  />
                </div>
                {form.payment_mode === 'partial' && (
                  <div>
                    <label className="block text-[12px] sm:text-[12.5px] font-semibold text-[#475569] mb-1.5">
                      Total Purchase
                    </label>
                    <input
                      value={decimal(total)}
                      disabled
                      className="w-full rounded-lg border border-[#93afd3] bg-[#d8f1fa] px-3.5 py-2 text-xs text-slate-700 cursor-not-allowed font-mono"
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[12px] sm:text-[12.5px] font-semibold text-[#475569] mb-1.5">Total Purchase</label>
                  <input value={decimal(total)} disabled className="w-full rounded-lg border border-[#93afd3] bg-[#d8f1fa] px-3.5 py-2 text-xs text-slate-700 font-mono" />
                </div>
                <div>
                  <label className="block text-[12px] sm:text-[12.5px] font-semibold text-[#475569] mb-1.5">Amount Due</label>
                  <input value={decimal(total)} disabled className="w-full rounded-lg border border-[#93afd3] bg-[#d8f1fa] px-3.5 py-2 text-xs text-slate-700 font-mono" />
                </div>
              </div>
            )}
            {form.payment_mode !== 'full' && (
              <div className="grid grid-cols-2 gap-2.5">
                {form.payment_mode === 'partial' && (
                  <div>
                    <label className="block text-[11.5px] font-semibold text-[#475569] mb-1.5">Amount Due</label>
                    <input value={decimal(due)} disabled className="w-full rounded-md border border-[#93afd3] bg-[#d8f1fa] px-3 py-2 text-xs text-slate-700 font-mono" />
                  </div>
                )}
                <div>
                  <label className="block text-[11.5px] font-semibold text-[#475569] mb-1.5">Due Date</label>
                  <input
                    id="purchase-due-date"
                    aria-label="Purchase due date"
                    aria-invalid={dueDateError}
                    type="date"
                    min={form.purchase_date}
                    value={form.due_date || ''}
                    onChange={(e) => update({ due_date: e.target.value })}
                    className={`w-full rounded-md border bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none ${dueDateError
                        ? 'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                        : 'border-[#93afd3] focus:border-[#159de9] focus:ring-1 focus:ring-[#159de9]'
                      }`}
                  />
                </div>
              </div>
            )}
            {form.payment_mode === 'later' && (
              <div className="mt-3.5 pt-3 border-t border-[#b8dce9] space-y-2.5">
                <p className="text-xs text-slate-500 font-medium">Have a post-dated check?</p>
                <button
                  type="button"
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
                  className={`text-xs font-semibold hover:underline cursor-pointer ${submitted && (pdcAccountError || pdcNumberError || pdcDateError || pdcAmountError)
                      ? 'text-rose-600 font-bold'
                      : 'text-[#0369a1]'
                    }`}
                >
                  {form.pdc && pdcOpen
                    ? 'Hide PDC Details'
                    : '+ Add / View PDC'}
                </button>
                {form.pdc && pdcOpen && (
                  <div className="space-y-2.5 pt-1">
                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">Paid From</label>
                      <div className="relative flex items-center">
                        <select
                          id="purchase-pdc-account"
                          aria-label="PDC account"
                          aria-invalid={pdcAccountError}
                          value={form.pdc.account_id}
                          onChange={(e) =>
                            update({
                              pdc: {
                                ...form.pdc!,
                                account_id: e.target.value,
                              },
                            })
                          }
                          className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-xs sm:text-[13px] text-[#475569] focus:outline-none cursor-pointer ${pdcAccountError
                              ? 'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                              : 'border-[#507ea1] focus:border-[#159de9] focus:ring-1 focus:ring-[#159de9]'
                            }`}
                        >
                          <option value="" className="text-slate-800 bg-white">Select bank account</option>
                          {compatible('Check').map((a) => (
                            <option key={a.id} value={a.id} className="text-slate-800 bg-white">
                              {a.name}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute right-3 flex items-center">
                          <ChevronDown size={18} strokeWidth={2.2} className="text-[#556980]" />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">Check Number</label>
                      <input
                        id="purchase-pdc-number"
                        aria-label="PDC check number"
                        aria-invalid={pdcNumberError}
                        value={form.pdc.check_number}
                        onChange={(e) =>
                          update({
                            pdc: {
                              ...form.pdc!,
                              check_number: e.target.value,
                            },
                          })
                        }
                        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-xs sm:text-[13px] text-[#475569] focus:outline-none ${pdcNumberError
                            ? 'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-[#507ea1] focus:border-[#159de9] focus:ring-1 focus:ring-[#159de9]'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">Check Date</label>
                      <input
                        id="purchase-pdc-date"
                        aria-label="PDC check date"
                        aria-invalid={pdcDateError}
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
                        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-xs sm:text-[13px] text-[#475569] focus:outline-none ${pdcDateError
                            ? 'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-[#507ea1] focus:border-[#159de9] focus:ring-1 focus:ring-[#159de9]'
                          }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11.5px] font-semibold text-[#475569] mb-1">Check Amount</label>
                      <input
                        id="purchase-pdc-amount"
                        aria-label="PDC amount"
                        aria-invalid={pdcAmountError}
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
                        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-xs sm:text-[13px] text-[#475569] focus:outline-none ${pdcAmountError
                            ? 'border-rose-500 bg-rose-50/20 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                            : 'border-[#507ea1] focus:border-[#159de9] focus:ring-1 focus:ring-[#159de9]'
                          }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 italic">Amount due changes when the check is cleared.</p>
                    <button
                      type="button"
                      onClick={() => update({ pdc: null })}
                      className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                    >
                      Remove PDC
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
          <section className="rounded-lg border border-[#9fd0e2] bg-[#e0f6fd] p-4 sm:p-5 shadow-xs transition-colors hover:border-[#38b4e7] space-y-3.5">
            <div className="flex items-center gap-2 pb-1">
              <img
                src={calculatorIcon}
                alt=""
                aria-hidden="true"
                className="size-5 shrink-0 object-contain"
              />
              <h2 className="text-[14.5px] font-bold text-[#0c3761] tracking-tight">Summary</h2>
            </div>
            <dl className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <dt className="text-slate-600 font-medium">Total Before Discount</dt>
                <dd className="font-mono font-bold text-[#0c3761]">{peso(totals.gross_cents)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600 font-medium">Less: Line Discounts</dt>
                <dd className="font-mono font-bold text-[#0c3761]">{peso(totals.discount_cents)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-bold text-[#0c3761]">Subtotal</dt>
                <dd className="font-mono font-bold text-[#0c3761]">{peso(totals.subtotal_cents)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-600 font-medium">
                  Add:{' '}
                  {loading ? (
                    <SkeletonBlock className="inline-block h-3.5 w-16 align-middle ml-1" />
                  ) : (
                    data?.taxes?.length === 1 ? data.taxes[0].name : 'Tax'
                  )}
                </dt>
                <dd className="font-mono font-bold text-[#0c3761]">{peso(totals.tax_cents)}</dd>
              </div>
            </dl>
            {/* Highlighted Cyan Total Box */}
            <div className="mt-3.5 rounded-md border border-[#38bdf8] bg-[#a5f3fc] px-4 py-3 shadow-2xs flex items-center justify-between">
              <span className="text-xs sm:text-[13.5px] font-bold text-[#0c3761]">Total Purchase</span>
              <span className="text-base sm:text-[17.5px] font-black font-mono text-[#0c3761]">{peso(total)}</span>
            </div>
          </section>
          <section className="rounded-lg border border-[#9fd0e2] bg-[#bae6fd] p-4 sm:p-5 shadow-2xs space-y-2 text-[#0c3761]">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <span>Amount Paid</span>
              <span className="font-mono text-sm sm:text-base font-black">{peso(paid)}</span>
            </div>
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <span>Amount Due</span>
              <span className="font-mono text-sm sm:text-base font-black">{peso(due)}</span>
            </div>
          </section>
          <button
            type="button"
            onClick={preview}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-md border border-[#9fd0e2] bg-[#e0f6fd] hover:bg-[#bae6fd] text-[#0369a1] text-xs font-semibold shadow-2xs transition cursor-pointer"
          >
            <span>Transaction Preview</span>
            <span>›</span>
          </button>
        </aside>
      </fieldset>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
        <button
          type="button"
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
          className="text-xs font-semibold text-[#0369a1] hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
        >
          Load Draft
        </button>
        <div className="flex flex-wrap items-center justify-end gap-2.5 w-full sm:w-auto">
          <button
            type="button"
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
            className="min-w-[95px] px-4 py-2 rounded-md border border-[#9fd0e2] bg-white hover:bg-slate-50 text-[#0c3761] text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || uncertain}
            onClick={() => void saveDraft()}
            className="min-w-[105px] px-4 py-2 rounded-md border border-[#9fd0e2] bg-white hover:bg-slate-50 text-[#0c3761] text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={busy || uncertain}
            onClick={preview}
            className="min-w-[105px] px-4 py-2 rounded-md border border-[#9fd0e2] bg-white hover:bg-slate-50 text-[#0c3761] text-xs font-semibold shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            Print Preview
          </button>
          <button
            type="button"
            className="min-w-[140px] px-5 py-2 rounded-md bg-[#087ae6] hover:bg-[#0964c2] text-white text-xs font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
            disabled={busy}
            onClick={() => void save()}
          >
            {busy
              ? 'Please wait…'
              : uncertain
                ? 'Retry Save Transaction'
                : 'Save Transaction'}
          </button>
        </div>
      </div>
      <div className="flex justify-end pt-0.5">
        <button
          type="button"
          onClick={() => navigate('/purchases/history')}
          className="text-xs font-medium text-[#0369a1] hover:underline cursor-pointer"
        >
          Purchase History →
        </button>
      </div>
      {menu &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-transparent border-0 cursor-default"
              aria-label="Close item actions"
              onClick={() => setMenu(null)}
            />
            <div
              className="fixed z-50 w-52 rounded-lg border border-slate-200 bg-white py-1.5 shadow-xl text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
              style={{ left: menu.x, top: menu.y }}
              onKeyDown={(event) => {
                if (event.key === 'Escape') setMenu(null)
              }}
            >
              <button
                type="button"
                autoFocus
                onClick={() => {
                  setEditor({
                    index: menu.index,
                    initial: form.items[menu.index],
                  })
                  setMenu(null)
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-50 font-medium transition cursor-pointer text-[#0c3761]"
              >
                View/Edit Item Details
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditor({
                    index: menu.index,
                    initial: form.items[menu.index],
                    useOnly: true,
                  })
                  setMenu(null)
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-sky-50 font-medium transition cursor-pointer text-[#0c3761]"
              >
                Change Intended Use
              </button>
              <button
                type="button"
                onClick={() => {
                  setRemoveIndex(menu.index)
                  setMenu(null)
                }}
                className="w-full text-left px-3.5 py-2 hover:bg-rose-50 font-medium transition cursor-pointer text-rose-600"
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
        <PurchaseDialog
          title="Remove Item"
          onClose={() => setRemoveIndex(null)}
          className="w-[min(480px,calc(100vw-24px))]"
        >
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-3 py-2 text-slate-700 text-sm font-medium">
              <TriangleAlert className="size-6 text-amber-500 shrink-0" />
              <span>Remove this item from the purchase?</span>
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#deebf2]">
              <button
                type="button"
                onClick={() => setRemoveIndex(null)}
                className="px-4 py-2 rounded-md border border-[#9fd0e2] bg-white hover:bg-slate-50 text-xs font-semibold text-[#0c3761] shadow-2xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  update({
                    items: form.items.filter((_, i) => i !== removeIndex),
                  })
                  setRemoveIndex(null)
                }}
                className="px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-xs transition cursor-pointer"
              >
                Remove Item
              </button>
            </div>
          </div>
        </PurchaseDialog>
      )}
      {receivingHelp && (
        <PurchaseDialog
          title="Receiving purchased goods"
          hideHeader
          onClose={() => setReceivingHelp(false)}
          className="w-[min(560px,calc(100vw-24px))] p-0 rounded-[9px] border-2 border-[#1f68ac] bg-white shadow-[0_22px_60px_rgba(0,0,0,0.45)] overflow-hidden"
        >
          <div className="flex flex-col bg-white text-[#0c3761] select-none text-[12.5px] leading-relaxed relative">
            {/* Window Title Bar */}
            <div className="h-[32px] sm:h-[34px] px-3 bg-gradient-to-b from-[#3782cf] via-[#206ab6] to-[#15589c] border-b border-[#104882] shadow-[inset_0_1px_0_rgba(255,255,255,0.38)] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* 3D Document Sheet Icon with Dog-ear fold and blue lines */}
                <svg
                  width={15}
                  height={17}
                  className="w-[15px] h-[17px] shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                  viewBox="0 0 20 22"
                  fill="none"
                >
                  <path
                    d="M2 1C2 0.45 2.45 0 3 0H14L20 6V21C20 21.55 19.55 22 19 22H3C2.45 22 2 21.55 2 21V1Z"
                    fill="#ffffff"
                  />
                  <path d="M14 0V6H20L14 0Z" fill="#b0c4de" />
                  <rect x="5" y="8" width="10" height="1.6" rx="0.4" fill="#38bdf8" />
                  <rect x="5" y="11.5" width="10" height="1.6" rx="0.4" fill="#94a3b8" />
                  <rect x="5" y="15" width="10" height="1.6" rx="0.4" fill="#94a3b8" />
                  <rect x="5" y="18.5" width="6" height="1.6" rx="0.4" fill="#94a3b8" />
                </svg>
                <span className="text-[13.5px] sm:text-[14px] font-bold text-white tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] whitespace-nowrap">
                  Receiving purchased goods
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReceivingHelp(false)}
                aria-label="Close dialog"
                className="w-[28px] h-[20px] shrink-0 rounded-[3px] border border-[#ff9999]/80 bg-gradient-to-b from-[#f25c5c] via-[#d62828] to-[#991515] hover:brightness-110 active:brightness-95 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.25)] transition cursor-pointer"
              >
                <X className="size-3 text-white stroke-[3] drop-shadow-xs" />
              </button>
            </div>

            {/* Window Body with Authentic Windows 7 / Vista Sky-wave swoosh */}
            <div className="relative bg-white px-7 pt-7 pb-6 overflow-hidden">
              {/* Sky Wave Swoosh Graphic in Top-Right */}
              <svg
                className="pointer-events-none absolute top-0 right-0 w-[360px] h-[155px] overflow-visible select-none"
                viewBox="0 0 360 155"
                fill="none"
              >
                <defs>
                  <linearGradient id="auroraWash" x1="0%" y1="0%" x2="100%" y2="80%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="30%" stopColor="#bae6fd" stopOpacity="0.3" />
                    <stop offset="70%" stopColor="#7dd3fc" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.45" />
                  </linearGradient>
                  <linearGradient id="waveLine" x1="0%" y1="0%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#7dd3fc" stopOpacity="0.4" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,0 C110,48 210,18 360,105 L360,0 Z"
                  fill="url(#auroraWash)"
                />
                <path
                  d="M0,0 C110,48 210,18 360,105"
                  stroke="url(#waveLine)"
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M50,0 C150,55 250,28 360,85"
                  stroke="#bae6fd"
                  strokeWidth="1.2"
                  strokeOpacity="0.6"
                  fill="none"
                />
              </svg>

              {/* Content text */}
              <div className="relative z-10 space-y-4">
                <div>
                  <h4 className="text-[15px] font-bold text-[#0a2f5c] tracking-tight">
                    All Received
                  </h4>
                  <p className="text-[13px] text-slate-800 leading-[1.5] mt-1">
                    Records every purchased quantity as received when you save. The item and its intended use determine the inventory or expense treatment.
                  </p>
                </div>

                <div className="pt-1">
                  <h4 className="text-[15px] font-bold text-[#0a2f5c] tracking-tight">
                    Not Yet Received
                  </h4>
                  <p className="text-[13px] text-slate-800 leading-[1.5] mt-1">
                    Keeps all quantities outstanding for a later delivery.
                  </p>
                </div>

                <div className="pt-1">
                  <h4 className="text-[15px] font-bold text-[#0a2f5c] tracking-tight">
                    Partially Received
                  </h4>
                  <p className="text-[13px] text-slate-800 leading-[1.5] mt-1">
                    Shows Qty Received in the table. Use View/Edit Item Details to enter each delivered quantity.
                  </p>
                </div>

                {/* Divider Line */}
                <div className="h-[1px] w-full bg-[#cce0f0] mt-7 mb-4" />

                {/* Bottom Action */}
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setReceivingHelp(false)}
                    className="min-w-[105px] h-[34px] px-6 rounded-[5px] border-[1.5px] border-[#0a4886] bg-gradient-to-b from-[#4da1ec] via-[#247dce] to-[#105fa9] hover:from-[#5ab0fa] hover:to-[#1268b8] active:brightness-95 text-[13.5px] font-bold text-white tracking-wide shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_3px_rgba(0,0,0,0.22)] transition cursor-pointer flex items-center justify-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </PurchaseDialog>
      )}
      {document && (
        <PurchaseDocument
          record={document.record}
          preview={document.preview}
          onClose={() => setDocument(null)}
        />
      )}
      {modal === 'supplier' && (
        <PurchaseDialog
          title="Add Supplier"
          onClose={() => setModal(null)}
          hideHeader
          className="w-[min(380px,calc(100vw-24px))] bg-[#e0f6fd] border-2 border-[#64a1bf] rounded-xl shadow-2xl"
        >
          <form
            className="p-5 sm:p-6 space-y-3"
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
            {/* Seamless Header */}
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-base sm:text-lg font-bold text-[#0c3761] tracking-tight">
                Add Supplier
              </h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                aria-label="Close dialog"
                className="text-slate-400 hover:text-slate-700 transition p-1 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">
                Supplier name
              </label>
              <input
                required
                value={supplierName}
                maxLength={160}
                placeholder="Enter supplier or vendor name"
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full rounded-lg border border-[#8ec7df] bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:border-[#087ae6] focus:outline-none focus:ring-1 focus:ring-[#087ae6]"
              />
            </div>
            {error && <p role="alert" className="text-xs text-rose-600 font-semibold">{error}</p>}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="min-w-[100px] px-6 py-2.5 rounded-lg border border-[#9fd0e2] bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-[#0c3761] shadow-2xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="min-w-[120px] px-6 py-2.5 rounded-lg bg-[#087ae6] hover:bg-[#0964c2] text-xs sm:text-sm font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                + Add Supplier
              </button>
            </div>
          </form>
        </PurchaseDialog>
      )}
      {modal === 'drafts' && (
        <PurchaseDialog
          title="Load Purchase Draft"
          onClose={() => setModal(null)}
          className="w-[min(560px,calc(100vw-24px))]"
        >
          <div className="p-5 sm:p-6 space-y-2.5 max-h-80 overflow-y-auto">
            {error && <p role="alert" className="text-xs text-rose-600 font-semibold">{error}</p>}
            {!drafts.length && <p className="text-xs text-slate-400 italic py-4 text-center">No saved purchase drafts.</p>}
            {drafts.map((d) => (
              <button
                key={d.id}
                type="button"
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
                className="w-full flex items-center justify-between p-3.5 rounded-lg border border-[#9fd0e2] bg-[#f0f9ff] hover:bg-[#e0f2fe] text-xs text-left transition cursor-pointer"
              >
                <strong className="text-[#0c3761] font-semibold">{d.invoice_number || 'Untitled purchase'}</strong>
                <span className="text-slate-500 font-mono text-[11px]">{d.date}</span>
              </button>
            ))}
          </div>
        </PurchaseDialog>
      )}
      {submittingAction &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            aria-modal="true"
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-150"
          >
            <div className="w-[min(490px,calc(100vw-32px))] overflow-hidden rounded-[8px] border-[1.5px] border-[#256bb2] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.35)] animate-in zoom-in-95 duration-150 select-none">
              {/* Window Title Bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-b from-[#3580cb] via-[#246bb5] to-[#175294] border-b border-[#134479] shadow-[inset_0_1px_0_rgba(255,255,255,0.3)]">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="size-4.5 text-white shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                  <span className="text-[13.5px] sm:text-[14px] font-bold text-white tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] whitespace-nowrap">
                    {submittingAction === 'draft' ? 'Save Draft' : 'Submit Purchase'}
                  </span>
                </div>
                <div
                  className="size-[22px] rounded-[3px] border border-white/40 bg-gradient-to-b from-white/25 via-white/10 to-transparent flex items-center justify-center shadow-xs"
                  aria-hidden="true"
                >
                  <X className="size-3 text-white stroke-[2.5]" />
                </div>
              </div>

              {/* Window Body */}
              <div className="px-6 pt-6 pb-5 bg-white">
                <div className="flex items-center">
                  {/* Daisy Wheel Spinner */}
                  <PetalSpinner className="size-13 sm:size-14" />

                  {/* Vertical Divider */}
                  <div className="h-14 w-[1px] bg-slate-200/90 mx-5 shrink-0 self-center" />

                  {/* Text Information */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[17px] font-bold text-[#0c3761] tracking-tight">
                      {submittingAction === 'draft' ? 'Saving Draft...' : 'Submitting Purchase...'}
                    </h3>
                    <p className="text-[12px] sm:text-[12.5px] text-slate-500 leading-normal mt-1">
                      {submittingAction === 'draft'
                        ? 'Please wait while your purchase draft is being saved.'
                        : 'Please wait while we record and process your purchase transaction.'}
                    </p>
                  </div>
                </div>

                {/* Progress Bar Strip with Real Progress Basis */}
                <div className="mt-5 w-full h-[30px] rounded-[5px] border border-[#a6c7e2] bg-gradient-to-b from-[#e6eff7] via-[#eff5fb] to-[#f6faff] p-[2px] shadow-inner relative flex items-center overflow-hidden">
                  <div
                    className="h-full rounded-[3px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.65),0_1px_2px_rgba(0,0,0,0.15)] relative overflow-hidden transition-[width] duration-300 ease-out"
                    style={{
                      width: `${Math.min(100, Math.max(submittingProgress.percent, 8))}%`,
                      background: 'linear-gradient(180deg, #58a9eb 0%, #2380d4 50%, #1261b0 100%)',
                    }}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage:
                          'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.22) 0, rgba(255, 255, 255, 0.22) 7px, transparent 7px, transparent 14px)',
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-3">
                    <span className="text-[12px] font-semibold text-[#0c3761] drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)] tracking-tight truncate">
                      {submittingProgress.label} ({submittingProgress.percent}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Shelf Panel */}
              <div className="h-7 w-full border-t border-[#d8e3ed] bg-gradient-to-b from-[#f2f5f8] to-[#e4e9ef]" />
            </div>
          </div>,
          window.document.body,
        )}
      {errorModal &&
        createPortal(
          <div
            role="alertdialog"
            aria-live="assertive"
            aria-modal="true"
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
            onClick={() => setErrorModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-[min(490px,calc(100vw-32px))] overflow-hidden rounded-[8px] border-[1.5px] border-[#b91c1c] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.35)] animate-in zoom-in-95 duration-150 select-none"
            >
              {/* Window Title Bar (Error Red) */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-b from-[#e11d48] via-[#be123c] to-[#9f1239] border-b border-[#881337] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                <div className="flex items-center gap-2">
                  <TriangleAlert className="size-4.5 text-white shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                  <span className="text-[13.5px] sm:text-[14px] font-bold text-white tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] whitespace-nowrap">
                    {errorModal.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorModal(null)}
                  className="size-[22px] rounded-[3px] border border-white/40 bg-gradient-to-b from-white/25 via-white/10 to-transparent flex items-center justify-center shadow-xs hover:bg-white/30 transition cursor-pointer"
                  aria-label="Close error dialog"
                >
                  <X className="size-3 text-white stroke-[2.5]" />
                </button>
              </div>

              {/* Window Body */}
              <div className="px-6 pt-6 pb-5 bg-white">
                <div className="flex items-center">
                  {/* Warning / Error Badge */}
                  <div className="size-13 sm:size-14 rounded-full bg-rose-50 border-2 border-rose-300 flex items-center justify-center shrink-0 shadow-inner">
                    <TriangleAlert className="size-7 text-rose-600 drop-shadow-xs stroke-[2.2]" />
                  </div>

                  {/* Vertical Divider */}
                  <div className="h-14 w-[1px] bg-slate-200/90 mx-5 shrink-0 self-center" />

                  {/* Text Information */}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[17px] font-bold text-rose-700 tracking-tight">
                      {errorModal.title}
                    </h3>
                    <p className="text-[12px] sm:text-[12.5px] text-slate-600 leading-normal mt-1">
                      {errorModal.message}
                    </p>
                  </div>
                </div>

                {/* Bottom Error Bar Strip with Dismiss */}
                <div className="mt-5 w-full h-[32px] rounded-[5px] border border-rose-300 bg-gradient-to-b from-rose-50 via-rose-100/60 to-rose-100 p-[2px] shadow-inner relative flex items-center justify-between px-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[12px] font-medium text-rose-800 tracking-normal select-none truncate max-w-[260px] sm:max-w-xs">
                      Transaction halted — please verify details.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorModal(null)}
                    className="px-3.5 py-1 rounded-[3px] border border-rose-600 bg-gradient-to-b from-rose-500 to-rose-700 hover:from-rose-600 hover:to-rose-800 text-white font-bold text-[11.5px] shadow-xs transition cursor-pointer shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Bottom Shelf Panel */}
              <div className="h-7 w-full border-t border-[#d8e3ed] bg-gradient-to-b from-[#f2f5f8] to-[#e4e9ef]" />
            </div>
          </div>,
          window.document.body,
        )}
      {successModal &&
        createPortal(
          <div
            role="alertdialog"
            aria-live="polite"
            aria-modal="true"
            onWheel={(e) => e.preventDefault()}
            onTouchMove={(e) => e.preventDefault()}
            onClick={() => setSuccessModal(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-[1px] p-4 animate-in fade-in duration-150"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-[min(490px,calc(100vw-32px))] overflow-hidden rounded-[8px] border-[1.5px] border-[#107c41] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.35)] animate-in zoom-in-95 duration-150 select-none"
            >
              {/* Window Title Bar (Aero Success Forest Green) */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-b from-[#198754] via-[#146c43] to-[#0f5132] border-b border-[#0d452b] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4.5 text-white shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]" />
                  <span className="text-[13.5px] sm:text-[14px] font-bold text-white tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] whitespace-nowrap">
                    {successModal.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessModal(null)}
                  className="size-[22px] rounded-[3px] border border-white/40 bg-gradient-to-b from-white/25 via-white/10 to-transparent flex items-center justify-center shadow-xs hover:bg-white/30 transition cursor-pointer"
                  aria-label="Close success dialog"
                >
                  <X className="size-3 text-white stroke-[2.5]" />
                </button>
              </div>

              {/* Window Body */}
              <div className="px-6 pt-6 pb-5 bg-white">
                <div className="flex items-start">
                  {/* Glossy Green Success Badge */}
                  <div className="size-13 sm:size-14 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center shrink-0 shadow-inner mt-0.5">
                    <CheckCircle2 className="size-7 text-emerald-600 drop-shadow-xs stroke-[2.3]" />
                  </div>

                  {/* Vertical Divider */}
                  <div className="h-20 w-[1px] bg-slate-200/90 mx-5 shrink-0 self-center" />

                  {/* Text Information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-[17px] font-bold text-[#0f5132] tracking-tight">
                        {successModal.isDraft ? 'Draft Saved!' : 'Transaction Recorded!'}
                      </h3>
                      {successModal.purchaseNumber && (
                        <span className="font-mono text-[11.5px] font-bold text-[#0c3761] bg-[#e7f3fa] px-2 py-0.5 rounded border border-[#b8dce9] shadow-2xs">
                          {successModal.purchaseNumber}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] sm:text-[12.5px] text-slate-600 leading-normal mt-1">
                      {successModal.isDraft
                        ? 'Your purchase draft has been saved. No stock or supplier balances have changed.'
                        : 'The purchase transaction has been successfully processed. Stock levels and supplier accounts have been updated.'}
                    </p>

                    {/* Summary Card */}
                    <div className="mt-3 rounded-[6px] border border-slate-200 bg-[#f8fafc] p-2.5 text-[11.5px] space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Supplier:</span>
                        <strong className="text-slate-800 font-semibold truncate max-w-[220px]">
                          {successModal.supplierName}
                        </strong>
                      </div>
                      {successModal.invoiceNumber && (
                        <div className="flex justify-between text-slate-600">
                          <span>Invoice No:</span>
                          <span className="font-mono text-slate-800 font-medium">
                            {successModal.invoiceNumber}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200/80">
                        <span>Total Purchase:</span>
                        <strong className="text-[#0c3761] font-bold">
                          {successModal.totalAmount}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Bar Strip */}
                <div className="mt-5 w-full min-h-[36px] rounded-[5px] border border-emerald-300 bg-gradient-to-b from-emerald-50 via-emerald-100/60 to-emerald-100 p-1.5 shadow-inner flex flex-wrap items-center justify-between gap-2 px-3">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[12px] font-medium text-emerald-800 tracking-normal select-none">
                      {successModal.isDraft ? 'Status: Draft Saved' : 'Status: Posted to Ledger'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {successModal.record && (
                      <button
                        type="button"
                        onClick={() => {
                          const rec = successModal.record!
                          setSuccessModal(null)
                          setDocument({ record: rec, preview: false })
                        }}
                        className="px-3 py-1 rounded-[3px] border border-[#1b62a5] bg-gradient-to-b from-[#3a8fdf] via-[#2378cb] to-[#125ea8] hover:from-[#4799e8] hover:to-[#1868b8] text-white font-bold text-[11.5px] shadow-xs transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Printer className="size-3.5 stroke-[2.2]" />
                        Print / View Slip
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSuccessModal(null)}
                      className="px-3.5 py-1 rounded-[3px] border border-emerald-600 bg-gradient-to-b from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white font-bold text-[11.5px] shadow-xs transition cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Shelf Panel */}
              <div className="h-7 w-full border-t border-[#d8e3ed] bg-gradient-to-b from-[#f2f5f8] to-[#e4e9ef]" />
            </div>
          </div>,
          window.document.body,
        )}
    </div>
  )
}
