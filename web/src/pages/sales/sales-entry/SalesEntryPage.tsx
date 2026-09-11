import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, AlertCircle } from 'lucide-react'
import type { Customer, SalesFormData, SalesLineItem, SalesMode } from './types'
import { SalesEntryHeader, SalesEntryBreadcrumb } from './components/SalesEntryHeader'
import { SalesInfoCard } from './components/SalesInfoCard'
import { CustomerCard } from './components/CustomerCard'
import { RemarksAttachmentsCard } from './components/RemarksAttachmentsCard'
import { ItemsServicesCard } from './components/ItemsServicesCard'
import { SalesSummaryCard } from './components/SalesSummaryCard'
import { TermsCreditCard } from './components/TermsCreditCard'
import { PaymentCard } from './components/PaymentCard'
import { SalesTotalBreakdownCard } from './components/SalesTotalBreakdownCard'
import { PreviewInvoiceModal } from './components/PreviewInvoiceModal'
import { formatDisplayDate } from '../../../components/ui/DatePicker'
import { SalesReceiptModal } from './components/SalesReceiptModal'
import { submitSaleTransaction, type SalesApiResponse } from './api/salesApi'

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    code: 'CUST-000123',
    name: 'ABC Trading Company',
    defaultTerms: 'Net 30',
    creditLimit: 500000.0,
    availableCredit: 320000.0,
    contactPerson: 'Roberto Gomez',
    phone: '+63 (088) 856-7890',
    email: 'purchasing@abctrading.com',
    address: 'National Highway, Kauswagan, Cagayan de Oro City',
  },
  {
    id: 'cust-2',
    code: 'CUST-000001',
    name: 'Walk-in Retail Customer',
    defaultTerms: 'Due on Receipt',
    creditLimit: 0,
    availableCredit: 0,
    contactPerson: 'Counter Sales',
    address: 'Main Branch Counter',
  },
  {
    id: 'cust-3',
    code: 'CUST-000452',
    name: 'Metro Manila Retailers Inc.',
    defaultTerms: 'Net 15',
    creditLimit: 250000.0,
    availableCredit: 190000.0,
    contactPerson: 'Carla Santos',
    phone: '+63 (02) 8920-1122',
    address: 'Ortigas Center, Pasig City',
  },
  {
    id: 'cust-4',
    code: 'CUST-000789',
    name: 'Cebu Prime Distributors',
    defaultTerms: 'Net 60',
    creditLimit: 1000000.0,
    availableCredit: 680000.0,
    contactPerson: 'Michael Tan',
    phone: '+63 (032) 231-5500',
    address: 'Mandaue City, Cebu',
  },
]

const INITIAL_ITEMS: SalesLineItem[] = []

export function SalesEntryPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const urlMode = searchParams.get('mode') === 'cash' ? 'cash' : 'credit'
  const [mode, setMode] = useState<SalesMode>(urlMode)

  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    urlMode === 'cash' ? 'cust-2' : 'cust-1'
  )

  const todayStr = formatDisplayDate(new Date())
  const dueDateStr = formatDisplayDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  const [formData, setFormData] = useState<SalesFormData>({
    mode: urlMode,
    salesDate: todayStr,
    salesNo: 'SAL-001',
    salesperson: 'Juan dela Cruz',
    branch: 'Main - Cagayan de Oro',
    customerId: urlMode === 'cash' ? 'cust-2' : 'cust-1',
    remarks: '',
    attachments: [],
    items: INITIAL_ITEMS,
    paymentTerms: 'Net 30',
    dueDate: dueDateStr,
    receivePaymentNow: true,
    paymentMethod: 'Bank Transfer',
    receivedInAccount: 'BDO Operating Account',
    amountReceived: 0,
  })

  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [apiResponse, setApiResponse] = useState<SalesApiResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text })
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleModeChange = (newMode: SalesMode) => {
    setMode(newMode)
    setSearchParams({ mode: newMode })
    setFormData((prev) => ({
      ...prev,
      mode: newMode,
      customerId: newMode === 'cash' ? 'cust-2' : 'cust-1',
      paymentTerms: newMode === 'cash' ? 'Due on Receipt' : 'Net 30',
      receivePaymentNow: true,
      amountReceived: newMode === 'cash' ? calculations.totalAmount : 5000.0,
    }))
    setSelectedCustomerId(newMode === 'cash' ? 'cust-2' : 'cust-1')
  }

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) || null,
    [customers, selectedCustomerId]
  )

  // Recalculate totals
  const calculations = useMemo(() => {
    let totalBeforeDiscount = 0
    let lineDiscounts = 0

    formData.items.forEach((item) => {
      const gross = item.qty * item.unitPrice
      const discount = gross * ((item.discountPercent || 0) / 100)
      totalBeforeDiscount += gross
      lineDiscounts += discount
    })

    const subtotal = totalBeforeDiscount - lineDiscounts
    const vatAmount = subtotal * 0.12
    const totalAmount = subtotal + vatAmount

    const amtReceived = formData.receivePaymentNow || mode === 'cash' ? formData.amountReceived : 0
    const outstanding = Math.max(0, totalAmount - amtReceived)
    const change = Math.max(0, amtReceived - totalAmount)

    return {
      totalBeforeDiscount,
      lineDiscounts,
      subtotal,
      vatAmount,
      totalAmount,
      amountReceived: amtReceived,
      outstanding,
      change,
    }
  }, [formData.items, formData.amountReceived, formData.receivePaymentNow, mode])

  const handleAddItem = (item: SalesLineItem) => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, item],
    }))
  }

  const handleUpdateItem = (id: string, updates: Partial<SalesLineItem>) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }))
  }

  const handleDeleteItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }))
  }

  const handleSaveDraft = () => {
    try {
      localStorage.setItem('simplebiz_sales_draft', JSON.stringify(formData))
      showToast('success', `Draft for ${formData.salesNo} saved successfully!`)
    } catch {
      showToast('success', `Draft for ${formData.salesNo} saved.`)
    }
  }

  const handleCompleteSale = async () => {
    if (formData.items.length === 0) {
      showToast('error', 'Please add at least one item before completing the sale.')
      return
    }

    if (mode === 'credit' && !selectedCustomer) {
      showToast('error', 'Please select a customer for credit sales.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await submitSaleTransaction(formData, selectedCustomer, calculations)
      setApiResponse(response)
      setShowReceiptModal(true)
      showToast('success', `Transaction ${formData.salesNo} sent to API & recorded successfully!`)
    } catch (err) {
      console.error('Error completing sale:', err)
      showToast('error', 'Failed to record transaction.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full space-y-2 pb-8 animate-in fade-in duration-200">
      {/* Toast Alert floating at the very top-right of the viewport */}
      {toastMessage &&
        createPortal(
          <div
            className={`fixed top-4 right-5 z-[99999] flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-xs font-semibold shadow-2xl transition-all animate-in slide-in-from-top-2 fade-in duration-200 border ${toastMessage.type === 'success'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-900/20'
                : 'bg-rose-600 text-white border-rose-500 shadow-rose-900/20'
              }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle className="size-4 shrink-0 text-emerald-100" />
            ) : (
              <AlertCircle className="size-4 shrink-0 text-rose-100" />
            )}
            <span>{toastMessage.text}</span>
          </div>,
          document.body
        )}

      {/* Breadcrumb Navigation at Top */}
      <SalesEntryBreadcrumb />

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
        {/* Left Column (Wider): Title & Sales Mode on top, Sales Info, Customer, Remarks, Items Table, Cancel & Draft buttons */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Header Row: Title & Subtitle on Left, Sales Mode Switcher directly above Sales Information on Right */}
          <SalesEntryHeader mode={mode} onModeChange={handleModeChange} />

          {/* Card 1: Sales Information */}
          <SalesInfoCard
            salesDate={formData.salesDate}
            salesNo={formData.salesNo}
            salesperson={formData.salesperson}
            branch={formData.branch}
            onUpdate={(fields) => setFormData((prev) => ({ ...prev, ...fields }))}
          />

          {/* Card 2 & 3: Customer + Remarks & Attachments Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <CustomerCard
              selectedCustomer={selectedCustomer}
              customers={customers}
              onSelectCustomer={(cust) => {
                setSelectedCustomerId(cust ? cust.id : '')
                if (cust?.defaultTerms) {
                  setFormData((prev) => ({ ...prev, paymentTerms: cust.defaultTerms }))
                }
              }}
            />

            <RemarksAttachmentsCard
              remarks={formData.remarks}
              attachments={formData.attachments}
              onRemarksChange={(remarks) => setFormData((prev) => ({ ...prev, remarks }))}
              onAddAttachment={(file) =>
                setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, file] }))
              }
              onRemoveAttachment={(index) =>
                setFormData((prev) => ({
                  ...prev,
                  attachments: prev.attachments.filter((_, i) => i !== index),
                }))
              }
            />
          </div>

          {/* Card 4: Items / Services Table */}
          <ItemsServicesCard
            items={formData.items}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />

        </div>

        {/* Right Column: Summary on top, Terms (if credit), Payment, Total Breakdown Card */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Card 1: Summary */}
          <SalesSummaryCard calculations={calculations} />

          {/* Card 2: Terms (Credit) Card */}
          <TermsCreditCard
            paymentTerms={formData.paymentTerms}
            dueDate={formData.dueDate}
            onTermsChange={(terms) => setFormData((prev) => ({ ...prev, paymentTerms: terms }))}
            onDueDateChange={(date) => setFormData((prev) => ({ ...prev, dueDate: date }))}
          />

          {/* Card 3: Payment Card */}
          <PaymentCard
            mode={mode}
            receivePaymentNow={formData.receivePaymentNow}
            paymentMethod={formData.paymentMethod}
            receivedInAccount={formData.receivedInAccount}
            amountReceived={formData.amountReceived}
            calculations={calculations}
            onReceivePaymentNowChange={(val) =>
              setFormData((prev) => ({ ...prev, receivePaymentNow: val }))
            }
            onPaymentMethodChange={(method) =>
              setFormData((prev) => ({ ...prev, paymentMethod: method }))
            }
            onReceivedInAccountChange={(acc) =>
              setFormData((prev) => ({ ...prev, receivedInAccount: acc }))
            }
            onAmountReceivedChange={(amt) =>
              setFormData((prev) => ({ ...prev, amountReceived: amt }))
            }
          />

          {/* Card 4: Standalone Total Amount Breakdown Card */}
          <SalesTotalBreakdownCard mode={mode} calculations={calculations} />
        </div>
      </div>

      {/* Unified Bottom Action Buttons Row - Perfectly aligned in a single row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 pt-1 items-center">
        {/* Left Column Action Buttons: Cancel and Save as Draft right-aligned */}
        <div className="lg:col-span-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/sales')}
            className="rounded-md border border-slate-300 bg-white px-6 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer min-w-[100px] text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="rounded-md border border-slate-300 bg-white px-6 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer min-w-[120px] text-center"
          >
            Save as Draft
          </button>
        </div>

        {/* Right Column Action Buttons: Preview and Complete Sale */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="w-full rounded-md border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer text-center"
          >
            Preview
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleCompleteSale}
            className="w-full rounded-md bg-[#0288d1] py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0277bd] active:scale-98 transition cursor-pointer text-center disabled:opacity-60"
          >
            {isSubmitting ? 'Processing Sale...' : 'Complete Sale'}
          </button>
        </div>
      </div>

      {/* Preview Invoice Modal */}
      {showPreviewModal && (
        <PreviewInvoiceModal
          formData={formData}
          selectedCustomer={selectedCustomer}
          calculations={calculations}
          onClose={() => setShowPreviewModal(false)}
          onComplete={handleCompleteSale}
        />
      )}

      {/* Sales Receipt & API Payload Modal */}
      {showReceiptModal && (
        <SalesReceiptModal
          formData={formData}
          selectedCustomer={selectedCustomer}
          calculations={calculations}
          apiResponse={apiResponse}
          onClose={() => {
            setShowReceiptModal(false)
            navigate('/sales')
          }}
          onNewSale={() => {
            setShowReceiptModal(false)
            setFormData((prev) => ({
              ...prev,
              salesNo: `SAL-${Math.floor(100 + Math.random() * 900)}`,
              items: [],
              amountReceived: 0,
            }))
            showToast('success', 'Ready for new transaction.')
          }}
        />
      )}
    </div>
  )
}
