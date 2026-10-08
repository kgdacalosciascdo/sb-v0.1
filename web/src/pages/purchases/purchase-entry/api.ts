export type PaymentMode = 'full' | 'partial' | 'later'
export interface Supplier {
  id: string
  name: string
  code: string
  terms_days: number
}
export interface Product {
  id: string
  code: string
  name: string
  unit: string
  cost: string
  tax_id: string | null
  track_inventory: boolean
}
export interface Tax {
  id: string
  name: string
  rate_basis_points: number
}
export interface Account {
  id: string
  name: string
  payment_methods: string[]
}
export interface PurchaseBootstrap {
  company: { id: string; name: string; currency: string }
  suppliers: Supplier[]
  products: Product[]
  taxes: Tax[]
  accounts: Account[]
  next_number: string
}
export interface PurchaseItem {
  product_id: string
  quantity: string
  unit_cost: string
  discount_percent: string
  tax_id: string | null
}
export interface Proof {
  name: string
  mime: string
  content: string
}
export interface Pdc {
  account_id: string
  check_number: string
  check_date: string
  amount: string
}
export interface PurchaseForm {
  draft_id?: string
  supplier_id: string
  purchase_date: string
  invoice_number: string
  items: PurchaseItem[]
  notes: string
  attachments: Proof[]
  payment_mode: PaymentMode
  payment_method: string | null
  cash_account_id: string | null
  amount_paid: string
  due_date: string | null
  reference: string
  pdc: Pdc | null
}
export interface CalculatedLine extends PurchaseItem {
  code: string
  name: string
  unit: string
  gross_cents: number
  discount_cents: number
  net_cents: number
  tax_cents: number
  tax_name: string
  track_inventory: boolean
}
export interface Totals {
  lines: CalculatedLine[]
  gross_cents: number
  discount_cents: number
  subtotal_cents: number
  tax_cents: number
  total_cents: number
}
export interface PurchaseRecord {
  id: string
  purchase_number: string
  purchase_date: string
  invoice_number: string
  due_date: string | null
  company: PurchaseBootstrap['company']
  supplier: Supplier
  total_cents: number
  paid_cents: number
  due_cents: number
  totals: Totals
  payment: {
    mode: PaymentMode
    method: string | null
    account_id: string | null
    reference: string
    check_date: string | null
    pdc: Pdc | null
  }
  notes: string
  attachments: { index: number; name: string; mime: string }[]
  payments: {
    id: string
    method: string
    payment_date: string
    amount_cents: number
    reference: string
  }[]
  postdated_check: {
    id: string
    check_number: string
    check_date: string
    amount_cents: number
    status: string
  } | null
}
export type PurchaseRow = Pick<
  PurchaseRecord,
  | 'id'
  | 'purchase_number'
  | 'purchase_date'
  | 'invoice_number'
  | 'supplier'
  | 'total_cents'
  | 'paid_cents'
  | 'due_cents'
  | 'due_date'
  | 'postdated_check'
>
export interface Payable {
  id: string
  purchase_id: string
  supplier_id: string
  purchase_number: string
  supplier_invoice_number: string
  supplier_name: string
  outstanding_cents: number
  due_date: string
}
export interface Overview {
  today: string
  purchases_month_cents: number
  payments_month_cents: number
  outstanding_cents: number
  overdue_cents: number
  due_today_count: number
  overdue_count: number
  due_soon_count: number
  draft_count: number
  pending_check_count: number
  suppliers: (Pick<Supplier, 'id' | 'name' | 'code'> & {
    outstanding_cents: number
  })[]
  payables: Payable[]
  recent: {
    id: string
    date: string
    number: string
    supplier: string
    amount_cents: number
  }[]
}
export const purchasesEndpoint = `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}/api/v1/demo/purchases`
export class PurchaseApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}
export async function purchaseRequest<T>(
  path = '',
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${purchasesEndpoint}${path ? `${path.startsWith('?') ? '' : '/'}${path}` : ''}`,
    {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
        ...options?.headers,
      },
    },
  )
  const body = await response.json().catch(() => ({}))
  if (!response.ok)
    throw new PurchaseApiError(
      Object.values(body.errors || {})
        .flat()
        .join(' ') ||
        (response.status >= 500
          ? 'The purchase service is unavailable. Please try again shortly.'
          : body.message) ||
        `Request failed (${response.status}).`,
      response.status,
    )
  return body as T
}
export const peso = (value: number): string =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(
    Number(value) / 100,
  )
export const cents = (value: string | number): number =>
  Math.round((Number(value) || 0) * 100)
export const decimal = (value: number): string =>
  (Number(value) / 100).toFixed(2)
export function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00`)
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
export function calculate(
  items: PurchaseItem[],
  data: PurchaseBootstrap,
): Totals {
  const round = (a: bigint, b: bigint) => Number((a + b / 2n) / b)
  const bounded = (value: number, maximum: number) =>
    Number.isFinite(value) ? Math.max(0, Math.min(maximum, value)) : 0
  const lines = items.map((item) => {
    const product = data.products.find((p) => p.id === item.product_id)
    const tax = data.taxes.find((t) => t.id === item.tax_id)
    const qty = bounded(
      Math.round((Number(item.quantity) || 0) * 10000),
      100000000,
    )
    const cost = bounded(cents(item.unit_cost), 9999999999)
    const discountRate = Math.max(
      0,
      bounded(cents(item.discount_percent), 10000),
    )
    const gross = round(BigInt(qty) * BigInt(cost), 10000n)
    const discount = round(BigInt(gross) * BigInt(discountRate), 10000n)
    const net = gross - discount
    const vat = round(BigInt(net) * BigInt(tax?.rate_basis_points || 0), 10000n)
    return {
      ...item,
      code: product?.code || '',
      name: product?.name || '',
      unit: product?.unit || '',
      gross_cents: gross,
      discount_cents: discount,
      net_cents: net,
      tax_cents: vat,
      tax_name: tax?.name || 'No tax',
      track_inventory: product?.track_inventory || false,
    }
  })
  const gross = lines.reduce((s, l) => s + l.gross_cents, 0)
  const discount = lines.reduce((s, l) => s + l.discount_cents, 0)
  const tax = lines.reduce((s, l) => s + l.tax_cents, 0)
  return {
    lines,
    gross_cents: gross,
    discount_cents: discount,
    subtotal_cents: gross - discount,
    tax_cents: tax,
    total_cents: gross - discount + tax,
  }
}
