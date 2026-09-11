import { create } from 'zustand'
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
  setSales: (sales: LocalSaleRecord[]) => void
  addSale: (sale: LocalSaleRecord) => void
}

export const useSalesStore = create<SalesStore>((set) => ({
  sales: [],
  setSales: (sales) => set({ sales }),
  addSale: (sale) => set((state) => ({ sales: [sale, ...state.sales.filter((item) => item.id !== sale.id)] })),
}))
