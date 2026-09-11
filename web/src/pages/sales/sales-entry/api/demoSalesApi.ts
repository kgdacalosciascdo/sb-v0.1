import type { Customer, SalesCalculations, SalesFormData } from '../types'
import type { LocalSaleRecord } from '../../../../stores/useSalesStore'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const salesEndpoint = `${apiBaseUrl}/api/v1/demo/sales`

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

type SalesResponse = { data?: LocalSaleRecord | LocalSaleRecord[]; errors?: Record<string, string[]>; message?: string }

function normalizeSaleRecord(record: LocalSaleRecord): LocalSaleRecord {
  const items = record.formData?.items || []
  const calculations = record.calculations || ({} as SalesCalculations)
  const totalBeforeDiscount = calculations.totalBeforeDiscount ?? items.reduce(
    (total, item) => total + item.qty * item.unitPrice,
    0,
  )
  const lineDiscounts = calculations.lineDiscounts ?? items.reduce(
    (total, item) => total + item.qty * item.unitPrice * ((item.discountPercent || 0) / 100),
    0,
  )
  const subtotal = calculations.subtotal ?? totalBeforeDiscount - lineDiscounts
  const vatAmount = calculations.vatAmount ?? Math.max(0, (calculations.totalAmount || 0) - subtotal)

  return {
    ...record,
    calculations: {
      totalBeforeDiscount,
      lineDiscounts,
      subtotal,
      vatAmount,
      totalAmount: calculations.totalAmount ?? subtotal + vatAmount,
      amountReceived: calculations.amountReceived ?? 0,
      outstanding: calculations.outstanding ?? 0,
      change: calculations.change ?? 0,
    },
  }
}

async function parseResponse(response: Response): Promise<SalesResponse> {
  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = body.message || Object.values(body.errors || {}).flat().join(' ') || `Sales API request failed with status ${response.status}.`
    throw new Error(message)
  }

  return body as SalesResponse
}

export async function saveSaleToDatabase(
  formData: SalesFormData,
  customer: Customer | null,
  calculations: SalesCalculations,
): Promise<LocalSaleRecord> {
  const response = await fetch(salesEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Idempotency-Key': createRequestId(),
    },
    body: JSON.stringify({ form_data: formData, customer, calculations }),
  })
  const body = await parseResponse(response)

  if (!body.data || Array.isArray(body.data)) {
    throw new Error('The sales API returned an empty record.')
  }

  return normalizeSaleRecord(body.data)
}

export async function fetchSalesFromDatabase(): Promise<LocalSaleRecord[]> {
  const response = await fetch(salesEndpoint, {
    headers: { Accept: 'application/json' },
  })
  const body = await parseResponse(response)

  return Array.isArray(body.data) ? body.data.map(normalizeSaleRecord) : []
}
