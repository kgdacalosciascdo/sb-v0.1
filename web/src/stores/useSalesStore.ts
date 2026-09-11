import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Customer, SalesCalculations, SalesFormData } from '../pages/sales/sales-entry/types'

export interface LocalSaleRecord {
  id: string
  transactionId: string
  receiptNo: string
  saleNo: string
  mode: SalesFormData['mode']
  status: 'completed'
  createdAt: string
  formData: SalesFormData
  customer: Customer | null
  calculations: SalesCalculations
}

interface SalesStore {
  sales: LocalSaleRecord[]
  addSale: (input: Omit<LocalSaleRecord, 'id' | 'transactionId' | 'receiptNo' | 'status' | 'createdAt'>) => LocalSaleRecord
  removeSale: (id: string) => void
  clearSales: () => void
}

function createId(prefix: string): string {
  const randomId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)

  return `${prefix}-${randomId}`
}

function createReceiptNumber(): string {
  const date = new Date()
  const datePart = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part) => String(part).padStart(2, '0'))
    .join('')

  return `RCP-${datePart}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

export const useSalesStore = create<SalesStore>()(
  persist(
    (set) => ({
      sales: [],
      addSale: (input) => {
        const sale: LocalSaleRecord = {
          ...input,
          id: createId('sale'),
          transactionId: createId('tx'),
          receiptNo: createReceiptNumber(),
          status: 'completed',
          createdAt: new Date().toISOString(),
        }

        set((state) => ({ sales: [sale, ...state.sales] }))
        return sale
      },
      removeSale: (id) => set((state) => ({ sales: state.sales.filter((sale) => sale.id !== id) })),
      clearSales: () => set({ sales: [] }),
    }),
    {
      name: 'simplebiz.sales-history.v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
