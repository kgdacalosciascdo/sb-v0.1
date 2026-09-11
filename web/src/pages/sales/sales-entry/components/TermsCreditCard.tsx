import calendarIcon from '../../../../assets/svg/calendar.svg'
import { Select2Combobox } from '../../../../components/ui/Select2Combobox'
import { DatePicker } from '../../../../components/ui/DatePicker'

interface TermsCreditCardProps {
  paymentTerms: string
  dueDate: string
  onTermsChange: (terms: string) => void
  onDueDateChange: (date: string) => void
}

const PAYMENT_TERMS_OPTIONS = [
  'Net 30',
  'Net 15',
  'Net 60',
  'Net 90',
  'Due on Receipt',
  'Cash on Delivery (COD)',
]

export function TermsCreditCard({
  paymentTerms,
  dueDate,
  onTermsChange,
  onDueDateChange,
}: TermsCreditCardProps) {
  return (
    <div className="rounded-lg border-[1.5px] border-[#63c4ed] bg-[#d6effc] p-4 shadow-xs transition-colors hover:border-[#38b4e7] space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 pb-1">
        <img src={calendarIcon} alt="" className="size-7 shrink-0 object-contain" />
        <h2 className="text-[14.5px] font-bold text-[#134c68] tracking-tight">Terms (Credit)</h2>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Payment Terms */}
        <div>
          <label className="block text-[11.5px] font-medium text-slate-500 mb-1">
            Payment Terms <span className="text-rose-500">*</span>
          </label>
          <Select2Combobox
            value={paymentTerms}
            options={PAYMENT_TERMS_OPTIONS}
            onChange={onTermsChange}
            placeholder="Select terms..."
            searchPlaceholder="Search payment terms..."
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-[11.5px] font-medium text-slate-500 mb-1">
            Due Date
          </label>
          <DatePicker
            value={dueDate}
            onChange={onDueDateChange}
            placeholder="Select due date"
          />
        </div>
      </div>
    </div>
  )
}
