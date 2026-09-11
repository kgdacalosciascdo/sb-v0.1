import { useState } from 'react'
import { Info, ChevronUp, ChevronDown } from 'lucide-react'
import { Select2Combobox } from '../../../../components/ui/Select2Combobox'
import { DatePicker } from '../../../../components/ui/DatePicker'

interface SalesInfoCardProps {
  salesDate: string
  salesNo: string
  salesperson: string
  branch: string
  onUpdate: (fields: Partial<{ salesDate: string; salesNo: string; salesperson: string; branch: string }>) => void
}

const SALESPERSONS = [
  'Juan dela Cruz',
  'Maria Santos',
  'Carlos Reyes',
  'Ana Mendoza',
]

const BRANCHES = [
  'Main - Cagayan de Oro',
  'Davao Central Branch',
  'Cebu Logistics Hub',
  'Makati Corporate Office',
]

export function SalesInfoCard({
  salesDate,
  salesNo,
  salesperson,
  branch,
  onUpdate,
}: SalesInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="rounded-lg border-[1.5px] border-[#63c4ed] bg-[#d6effc] p-4 shadow-xs transition-colors hover:border-[#38b4e7]">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-[#0288d1] text-white shrink-0">
            <Info className="size-4" />
          </div>
          <h2 className="text-[14.5px] font-bold text-[#134c68] tracking-tight">Sales Information</h2>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded p-1 text-slate-400 hover:bg-sky-200/40 hover:text-slate-700 transition cursor-pointer"
          aria-label={isExpanded ? 'Collapse Sales Information' : 'Expand Sales Information'}
        >
          {isExpanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Sales Date */}
          <div>
            <label className="block text-[11.5px] font-medium text-slate-500 mb-1">
              Sales Date <span className="text-rose-500">*</span>
            </label>
            <DatePicker
              value={salesDate}
              onChange={(date) => onUpdate({ salesDate: date })}
              placeholder="Select sales date"
            />
          </div>

          {/* Sales No. */}
          <div>
            <label htmlFor="salesNo" className="block text-[11.5px] font-medium text-slate-500 mb-1">
              Sales No.
            </label>
            <input
              id="salesNo"
              type="text"
              value={salesNo}
              onChange={(e) => onUpdate({ salesNo: e.target.value })}
              className="w-full rounded-md border-[1.5px] border-[#63c4ed] bg-white px-3 py-2 text-xs font-medium text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#0288d1] focus:ring-2 focus:ring-[#0288d1]/20"
              placeholder="SAL-001"
            />
          </div>

          {/* Salesperson */}
          <div>
            <label className="block text-[11.5px] font-medium text-slate-500 mb-1">
              Salesperson
            </label>
            <Select2Combobox
              value={salesperson}
              options={SALESPERSONS}
              onChange={(val) => onUpdate({ salesperson: val })}
              placeholder="Select salesperson..."
              searchPlaceholder="Search salesperson..."
            />
          </div>

          {/* Branch */}
          <div>
            <label className="block text-[11.5px] font-medium text-slate-500 mb-1">
              Branch
            </label>
            <Select2Combobox
              value={branch}
              options={BRANCHES}
              onChange={(val) => onUpdate({ branch: val })}
              placeholder="Select branch..."
              searchPlaceholder="Search branch..."
            />
          </div>
        </div>
      )}
    </div>
  )
}
