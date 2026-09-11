import cardIcon from '../../../../assets/svg/card.svg'
import type { SalesCalculations, SalesMode } from '../types'
import { Select2Combobox } from '../../../../components/ui/Select2Combobox'

interface PaymentCardProps {
  mode: SalesMode
  receivePaymentNow: boolean
  paymentMethod: string
  receivedInAccount: string
  amountReceived: number
  calculations: SalesCalculations
  onReceivePaymentNowChange: (val: boolean) => void
  onPaymentMethodChange: (method: string) => void
  onReceivedInAccountChange: (acc: string) => void
  onAmountReceivedChange: (amt: number) => void
}

const PAYMENT_METHODS = [
  'Bank Transfer',
  'Cash',
  'GCash',
  'Maya',
  'Check',
  'Credit Card',
]

const CASH_ACCOUNTS = [
  'BDO Operating Account',
  'Petty Cash Fund',
  'Cash in Register / Drawer',
  'BPI Corporate Checking',
  'UnionBank Digital Account',
]

export function PaymentCard({
  mode,
  receivePaymentNow,
  paymentMethod,
  receivedInAccount,
  amountReceived,
  calculations,
  onReceivePaymentNowChange,
  onPaymentMethodChange,
  onReceivedInAccountChange,
  onAmountReceivedChange,
}: PaymentCardProps) {
  const isCredit = mode === 'credit'

  return (
    <div className="rounded-lg border-[1.5px] border-[#63c4ed] bg-[#d6effc] p-4 shadow-xs transition-colors hover:border-[#38b4e7] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <img src={cardIcon} alt="" className="size-7 shrink-0 object-contain" />
          <h2 className="text-[14.5px] font-bold text-[#134c68] tracking-tight">Payment</h2>
        </div>

        {/* Receive Payment Now Toggle */}
        {isCredit && (
          <div className="flex items-center gap-2">
            <span className="text-[11.5px] font-medium text-slate-600">Receive payment now</span>
            <button
              type="button"
              role="switch"
              aria-checked={receivePaymentNow}
              onClick={() => onReceivePaymentNowChange(!receivePaymentNow)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                receivePaymentNow ? 'bg-[#22c55e]' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  receivePaymentNow ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {(!isCredit || receivePaymentNow) ? (
          <>
            {/* Payment Method */}
            <div>
              <label className="block text-[11.5px] font-medium text-slate-500 mb-1">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <Select2Combobox
                value={paymentMethod}
                options={PAYMENT_METHODS}
                onChange={onPaymentMethodChange}
                placeholder="Select payment method..."
                searchPlaceholder="Search payment method..."
              />
            </div>

            {/* Received In Account */}
            <div>
              <label className="block text-[11.5px] font-medium text-slate-500 mb-1">
                Received In <span className="text-rose-500">*</span>
              </label>
              <Select2Combobox
                value={receivedInAccount}
                options={CASH_ACCOUNTS}
                onChange={onReceivedInAccountChange}
                placeholder="Select cash/bank account..."
                searchPlaceholder="Search account..."
              />
            </div>

            {/* Amount Received with Helper beside it */}
            <div>
              <label htmlFor="amountReceived" className="block text-[11.5px] font-medium text-slate-500 mb-1">
                Amount Received <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-6">
                  <input
                    id="amountReceived"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountReceived || ''}
                    onChange={(e) => onAmountReceivedChange(parseFloat(e.target.value) || 0)}
                    placeholder="5,000.00"
                    className="w-full rounded-md border-[1.5px] border-[#63c4ed] bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-[#0288d1] focus:ring-2 focus:ring-[#0288d1]/20"
                  />
                </div>
                <div className="sm:col-span-6 text-[11px] leading-snug text-slate-500">
                  {isCredit ? (
                    calculations.outstanding > 0 ? (
                      <span>
                        The remaining{' '}
                        <strong className="text-slate-700 font-mono">
                          ₱{calculations.outstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </strong>{' '}
                        will stay due from this customer.
                      </span>
                    ) : (
                      <span className="text-emerald-700 font-semibold">
                        Payment is fully satisfied.
                      </span>
                    )
                  ) : (
                    calculations.change > 0 ? (
                      <span className="text-emerald-700 font-semibold">
                        Change: ₱{calculations.change.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    ) : (
                      <span>Exact amount received. Change: ₱0.00</span>
                    )
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-md bg-white/70 p-3 text-center text-xs text-slate-600 border border-[#63c4ed]">
            <img src={cardIcon} alt="" className="size-5 mx-auto mb-1 opacity-60" />
            <p className="font-semibold text-slate-800">No immediate payment collected</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              ₱{calculations.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} added to customer receivables.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
