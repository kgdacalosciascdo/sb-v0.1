import type { SalesCalculations, SalesMode } from '../types'

interface SalesTotalBreakdownCardProps {
  mode: SalesMode
  calculations: SalesCalculations
}

export function SalesTotalBreakdownCard({ mode, calculations }: SalesTotalBreakdownCardProps) {
  const isCredit = mode === 'credit'

  return (
    <div className="rounded-lg border border-[#5cd4ea] bg-[#9cf1fc] p-4 shadow-2xs space-y-2">
      <div className="flex items-center justify-between text-sm sm:text-[15px] font-bold text-[#134c68]">
        <span>Total Amount</span>
        <span className="font-mono text-base sm:text-[17px] font-black">
          ₱{calculations.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm sm:text-[15px] font-bold text-[#134c68]">
        <span>Amount Received</span>
        <span className="font-mono text-base sm:text-[17px] font-black">
          ₱{calculations.amountReceived.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm sm:text-[15px] font-bold text-[#134c68]">
        <span>{isCredit ? 'Oustanding' : 'Change'}</span>
        <span className="font-mono text-base sm:text-[17px] font-black">
          ₱{(isCredit ? calculations.outstanding : calculations.change).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  )
}
