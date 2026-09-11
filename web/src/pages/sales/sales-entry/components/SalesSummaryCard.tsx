import calculatorIcon from '../../../../assets/svg/calculator.svg'
import type { SalesCalculations } from '../types'

interface SalesSummaryCardProps {
  calculations: SalesCalculations
}

export function SalesSummaryCard({ calculations }: SalesSummaryCardProps) {
  return (
    <div className="rounded-lg border-[1.5px] border-[#63c4ed] bg-[#d6effc] p-4 shadow-xs transition-colors hover:border-[#38b4e7] min-h-[235px] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 pb-1">
        <img src={calculatorIcon} alt="" className="size-7 shrink-0 object-contain" />
        <h2 className="text-[14.5px] font-bold text-[#134c68] tracking-tight">Summary</h2>
      </div>

      {/* Content */}
      <div className="space-y-3 py-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 font-medium">Total Before Discount</span>
          <span className="font-mono font-bold text-[#134c68]">
            ₱{calculations.totalBeforeDiscount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600 font-medium">Less: Line Discounts</span>
          <span className="font-mono font-bold text-[#134c68]">
            ₱{calculations.lineDiscounts.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-bold text-[#134c68]">Subtotal</span>
          <span className="font-mono font-bold text-[#134c68]">
            ₱{calculations.subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600 font-medium">Add: VAT (12%)</span>
          <span className="font-mono font-bold text-[#134c68]">
            ₱{calculations.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Highlighted Cyan Total Box */}
      <div className="mt-2 rounded-md border border-[#5cd4ea] bg-[#9cf1fc] px-4 py-3.5 shadow-2xs flex items-center justify-between">
        <span className="text-xs sm:text-[13.5px] font-bold text-[#134c68]">Total Amount</span>
        <span className="text-base sm:text-[17.5px] font-black font-mono text-[#134c68]">
          ₱{calculations.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}
