export type SalesMode = 'cash' | 'credit'

export interface SalesLineItem {
  id: string
  code: string
  name: string
  qty: number
  unit: string
  unitPrice: number
  discountPercent: number
  taxType: 'VAT' | 'NON-VAT' | 'ZERO-RATED'
  amount: number
}

export interface Customer {
  id: string
  code: string
  name: string
  defaultTerms: string
  creditLimit: number
  availableCredit: number
  contactPerson?: string
  phone?: string
  email?: string
  address?: string
}

export interface SalesFormData {
  mode: SalesMode
  salesDate: string
  salesNo: string
  salesperson: string
  branch: string
  customerId: string
  remarks: string
  attachments: { name: string; size: number }[]
  items: SalesLineItem[]
  paymentTerms: string
  dueDate: string
  receivePaymentNow: boolean
  paymentMethod: string
  receivedInAccount: string
  amountReceived: number
}

export interface SalesCalculations {
  totalBeforeDiscount: number
  lineDiscounts: number
  subtotal: number
  vatAmount: number
  totalAmount: number
  amountReceived: number
  outstanding: number
  change: number
}
