export interface PaymentCustomer {
  key: string
  name: string
  code: string
  terms: string
  phone: string
  address: string
}
export interface OpenItem {
  id: string
  customer_key: string
  document_number: string
  date: string
  due_date: string
  total_cents: number
  balance_cents: number
}
export interface CashAccount {
  id: string
  name: string
  payment_methods: string[]
}
export interface PaymentBootstrap {
  company: { name: string; currency: string }
  customers: PaymentCustomer[]
  open_items: OpenItem[]
  accounts: CashAccount[]
  payment_methods: string[]
}
export interface Tender {
  method: string
  account_id: string
  reference: string
  amount: string
}
export interface ProofFile {
  name: string
  mime: string
  content: string
}
export interface PaymentPayload {
  draft_id?: string
  customer_key: string
  receipt_date: string
  amount: string
  tenders: Tender[]
  applications: { sale_id: string; amount: string }[]
  remarks: string
  attachments: ProofFile[]
}
export interface Receipt {
  id: string
  receipt_number: string
  receipt_date: string
  amount_cents: number
  applied_cents: number
  unapplied_cents: number
  company: PaymentBootstrap['company']
  customer: PaymentCustomer
  tenders: (Omit<Tender, 'amount'> & {
    account_name: string
    amount_cents: number
  })[]
  applications: (OpenItem & { amount_cents: number; remaining_cents: number })[]
  remarks: string
  attachments: { index: number; name: string; mime: string }[]
}
export interface ReceiptRow {
  id: string
  receipt_number: string
  receipt_date: string
  customer_name: string
  amount_cents: number
  unapplied_cents: number
}
export interface DraftRow {
  id: string
  customer_key: string
  receipt_date: string
  amount: string
  updated_at: string
}
export const collectionEndpoint = `${(import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')}/api/v1/demo/collections`

export class CollectionApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function collectionRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${collectionEndpoint}/${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers,
    },
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const details = Object.values(body.errors || {})
      .flat()
      .join(' ')
    throw new CollectionApiError(
      details ||
        (response.status >= 500
          ? 'The payment service is unavailable. Please retry shortly or check the backend database connection.'
          : body.message) ||
        `Request failed (${response.status}).`,
      response.status,
    )
  }
  return body as T
}

export const cents = (value: string | number): number =>
  Math.round((Number(value) || 0) * 100)
export const decimal = (value: number): string => (value / 100).toFixed(2)
export const peso = (value: number): string =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(
    value / 100,
  )
export function today(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
