import { createPortal } from 'react-dom'
import { X, Printer, CheckCircle2 } from 'lucide-react'
import type { Customer, SalesCalculations, SalesFormData } from '../types'
import cashierIcon from '../../../../assets/icons/cashier.png'

interface PreviewInvoiceModalProps {
  formData: SalesFormData
  selectedCustomer: Customer | null
  calculations: SalesCalculations
  onClose: () => void
  onComplete: () => void
}

export function PreviewInvoiceModal({
  formData,
  selectedCustomer,
  calculations,
  onClose,
  onComplete,
}: PreviewInvoiceModalProps) {
  const isCredit = formData.mode === 'credit'

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-md transition-all duration-200"
      style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <img src={cashierIcon} alt="" className="size-6 object-contain" />
            <h2 className="text-base font-bold text-slate-900">
              Sales Invoice Preview — {formData.salesNo}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Printable Content */}
        <div className="overflow-y-auto p-6 space-y-5 text-xs text-slate-700 sales-custom-scroll">
          {/* Company & Invoice Info */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">SIMPLEBIZ ENTERPRISE</h1>
              <p className="text-slate-500 text-[11px]">{formData.branch}</p>
              <p className="text-slate-500 text-[11px]">Tax Identification No: 123-456-789-00000</p>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded text-xs font-bold bg-sky-100 text-[#0288d1]">
                {isCredit ? 'CREDIT SALES INVOICE' : 'CASH SALES INVOICE'}
              </span>
              <p className="mt-1 font-mono font-bold text-slate-800">{formData.salesNo}</p>
              <p className="text-slate-500 text-[11px]">Date: {formData.salesDate}</p>
            </div>
          </div>

          {/* Bill To & Sales Details */}
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-3.5 border border-slate-100">
            <div>
              <span className="font-bold text-slate-500 text-[10.5px] uppercase tracking-wider">Bill To Customer:</span>
              <p className="font-bold text-slate-900 mt-0.5">{selectedCustomer?.name || 'Walk-in Retail Customer'}</p>
              <p className="text-slate-600 text-[11px]">{selectedCustomer?.code || 'CUST-WALKIN'}</p>
              {selectedCustomer?.address && <p className="text-slate-500 text-[11px]">{selectedCustomer.address}</p>}
            </div>
            <div className="space-y-1 text-right">
              <div>
                <span className="text-slate-500">Salesperson:</span>{' '}
                <span className="font-medium text-slate-800">{formData.salesperson}</span>
              </div>
              {isCredit && (
                <>
                  <div>
                    <span className="text-slate-500">Terms:</span>{' '}
                    <span className="font-semibold text-slate-800">{formData.paymentTerms}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Due Date:</span>{' '}
                    <span className="font-medium text-slate-800">{formData.dueDate}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100/90 text-[10.5px] font-bold text-slate-700 uppercase">
                <tr>
                  <th className="p-2 pl-3">Item</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-right">Disc %</th>
                  <th className="p-2 text-right pr-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {formData.items.map((item, i) => (
                  <tr key={i} className="text-xs">
                    <td className="p-2 pl-3">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-[10.5px] text-slate-400">{item.code}</div>
                    </td>
                    <td className="p-2 text-center font-medium">{item.qty} {item.unit}</td>
                    <td className="p-2 text-right font-mono">₱{item.unitPrice.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">{item.discountPercent > 0 ? `${item.discountPercent}%` : '-'}</td>
                    <td className="p-2 text-right pr-3 font-mono font-bold">₱{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-mono font-medium">₱{calculations.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">VAT (12%):</span>
                <span className="font-mono font-medium">₱{calculations.vatAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900 text-sm">
                <span>Total Amount:</span>
                <span className="font-mono text-[#0288d1]">₱{calculations.totalAmount.toFixed(2)}</span>
              </div>
              {formData.amountReceived > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>Amount Paid ({formData.paymentMethod}):</span>
                  <span className="font-mono">₱{formData.amountReceived.toFixed(2)}</span>
                </div>
              )}
              {isCredit && (
                <div className="flex justify-between font-bold text-amber-700">
                  <span>Balance Due:</span>
                  <span className="font-mono">₱{calculations.outstanding.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {formData.remarks && (
            <div className="rounded bg-slate-50 p-2.5 text-[11px] text-slate-600 border border-slate-100">
              <strong>Remarks:</strong> {formData.remarks}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <Printer className="size-4 text-slate-500" />
            <span>Print</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose()
                onComplete()
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0288d1] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#0277bd] transition cursor-pointer"
            >
              <CheckCircle2 className="size-4" />
              <span>Confirm &amp; Complete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
