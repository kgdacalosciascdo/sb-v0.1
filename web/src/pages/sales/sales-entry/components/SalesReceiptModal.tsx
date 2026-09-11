import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Printer,
  ArrowLeft,
  PlusCircle,
  CheckCircle2,
  Code2,
  ChevronDown,
  ChevronUp,
  Receipt,
  Copy,
  Check,
} from 'lucide-react'
import type { Customer, SalesCalculations, SalesFormData } from '../types'
import type { SalesApiResponse } from '../api/salesApi'

interface SalesReceiptModalProps {
  formData: SalesFormData
  selectedCustomer: Customer | null
  calculations: SalesCalculations
  apiResponse: SalesApiResponse | null
  onClose: () => void
  onNewSale: () => void
}

export function SalesReceiptModal({
  formData,
  selectedCustomer,
  calculations,
  apiResponse,
  onClose,
  onNewSale,
}: SalesReceiptModalProps) {
  const [showPayload, setShowPayload] = useState(false)
  const [copied, setCopied] = useState(false)

  const receiptNo = apiResponse?.receipt_no || `RCP-${formData.salesNo}`
  const transactionId = apiResponse?.transaction_id || `tx-${Date.now()}`
  const isCredit = formData.mode === 'credit'
  const isFullyPaid = calculations.outstanding === 0

  const handlePrint = () => {
    window.print()
  }

  const handleCopyPayload = () => {
    if (apiResponse?.data) {
      navigator.clipboard.writeText(JSON.stringify(apiResponse.data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md overflow-y-auto transition-all duration-200"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Receipt Paper Card */}
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Receipt Header Top Accent */}
        <div className="bg-[#0288d1] px-6 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="size-5 text-sky-200" />
            <span className="font-bold text-sm tracking-wide">Official Sales Receipt</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold">
            <CheckCircle2 className="size-3.5 text-emerald-300" />
            <span>Success</span>
          </div>
        </div>

        {/* Printable Paper Area */}
        <div className="p-6 bg-slate-50/50 space-y-4 text-slate-800 text-xs font-sans">
          {/* Company Branding */}
          <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
            <h2 className="text-lg font-black tracking-tight text-[#0c3761]">SIMPLEBIZ ENTERPRISE</h2>
            <p className="text-[11px] text-slate-500">{formData.branch}</p>
            <p className="text-[10.5px] text-slate-400">TIN: 123-456-789-00000 · VAT Registered</p>
            <div className="pt-1">
              <span className="inline-block rounded bg-sky-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0288d1]">
                {isCredit ? 'Credit Sales Invoice' : 'Cash Sales Receipt'}
              </span>
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-y-1.5 text-[11.5px] pb-3 border-b border-dashed border-slate-300">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Receipt No</span>
              <span className="font-mono font-bold text-slate-800">{receiptNo}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase">Sales Invoice #</span>
              <span className="font-mono font-bold text-[#0288d1]">{formData.salesNo}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Date &amp; Time</span>
              <span className="font-medium text-slate-700">{formData.salesDate}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block text-[10px] uppercase">Cashier / Staff</span>
              <span className="font-medium text-slate-700">{formData.salesperson}</span>
            </div>
            <div className="col-span-2 pt-1 border-t border-slate-200/60">
              <span className="text-slate-400 block text-[10px] uppercase">Customer</span>
              <span className="font-bold text-slate-800">
                {selectedCustomer?.name || 'Walk-in Retail Customer'}
              </span>
              {selectedCustomer?.code && (
                <span className="text-slate-400 text-[10.5px] ml-1">({selectedCustomer.code})</span>
              )}
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Item Description</span>
              <span className="text-right">Total</span>
            </div>

            <div className="space-y-1.5 divide-y divide-slate-100">
              {formData.items.map((item) => (
                <div key={item.id} className="pt-1.5 first:pt-0 flex justify-between items-start text-xs">
                  <div className="pr-2">
                    <div className="font-semibold text-slate-800 leading-tight">{item.name}</div>
                    <div className="text-[10.5px] text-slate-400 mt-0.5">
                      {item.qty} {item.unit} × ₱{item.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      {item.discountPercent > 0 && (
                        <span className="text-rose-500 ml-1.5 font-medium">
                          (-{item.discountPercent}%)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-slate-800 shrink-0 text-right">
                    ₱{item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Payment Summary */}
          <div className="space-y-1.5 text-xs pb-3 border-b border-dashed border-slate-300">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal (Gross)</span>
              <span className="font-mono">
                ₱{calculations.totalBeforeDiscount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {calculations.lineDiscounts > 0 && (
              <div className="flex justify-between text-rose-600 font-medium">
                <span>Total Discounts</span>
                <span className="font-mono">
                  -₱{calculations.lineDiscounts.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>VAT (12%)</span>
              <span className="font-mono">
                ₱{calculations.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-sky-50/80 border border-[#63c4ed]/40 mt-2">
              <span className="font-black text-sm text-[#0c3761] uppercase tracking-wide">Total Amount</span>
              <span className="font-mono font-black text-base text-[#0288d1]">
                ₱{calculations.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Payment & Balance Details */}
            <div className="pt-2 space-y-1 text-[11.5px]">
              <div className="flex justify-between text-slate-600">
                <span>Payment Method:</span>
                <span className="font-medium text-slate-800">{formData.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Amount Paid / Tendered:</span>
                <span className="font-mono font-semibold text-slate-800">
                  ₱{calculations.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {isFullyPaid ? (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Payment Status:</span>
                  <span>Fully Paid {calculations.change > 0 ? `(Change: ₱${calculations.change.toLocaleString('en-US', { minimumFractionDigits: 2 })})` : ''}</span>
                </div>
              ) : (
                <div className="flex justify-between text-amber-700 font-bold">
                  <span>Outstanding Balance:</span>
                  <span className="font-mono">
                    ₱{calculations.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Barcode & Thank You */}
          <div className="text-center pt-1 space-y-2">
            {/* Pseudo-Barcode SVG */}
            <div className="flex justify-center items-center gap-[2px] h-9 mx-auto py-1 opacity-70">
              {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2].map((w, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900 h-full rounded-xs"
                  style={{ width: `${w * 1.5}px` }}
                />
              ))}
            </div>
            <p className="font-mono text-[10px] text-slate-400 tracking-widest">{transactionId}</p>
            <p className="text-[11px] font-semibold text-slate-600">Thank you for your business!</p>
          </div>

          {/* API Payload Toggle */}
          <div className="pt-2 border-t border-slate-200/70">
            <button
              type="button"
              onClick={() => setShowPayload(!showPayload)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 hover:text-[#0288d1] transition cursor-pointer p-1 rounded hover:bg-slate-100"
            >
              <div className="flex items-center gap-1.5">
                <Code2 className="size-3.5 text-[#0288d1]" />
                <span>API Payload (POST /api/sales/transactions)</span>
              </div>
              {showPayload ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>

            {showPayload && (
              <div className="mt-2 rounded-lg bg-slate-900 p-3 text-[10.5px] font-mono text-emerald-400 overflow-x-auto relative">
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="absolute right-2 top-2 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(apiResponse?.data || {}, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer className="size-4 text-slate-500" />
            <span>Print Receipt</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-md border border-slate-300 bg-white py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>Sales Registry</span>
          </button>

          <button
            type="button"
            onClick={onNewSale}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#0288d1] py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0277bd] active:scale-98 transition cursor-pointer"
          >
            <PlusCircle className="size-4" />
            <span>New Sale</span>
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
