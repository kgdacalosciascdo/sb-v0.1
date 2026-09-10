import { ChevronDown, FileSpreadsheet, GripVertical, ChevronRight } from 'lucide-react'
import { useCardCollapse } from '../../../hooks/useCardCollapse'
import { ReportsIcon } from '../../../components/common/ReportsIcon'

interface ReportItem {
  id: string
  title: string
  description: string
  href: string
}

const EXPENSE_REPORTS: ReportItem[] = [
  {
    id: 'expense-breakdown',
    title: 'Expense Breakdown by Category',
    description: 'Monthly distribution across utilities, rent, supplies, and marketing',
    href: '#expense-breakdown-report',
  },
  {
    id: 'unpaid-aging',
    title: 'Unpaid & Overdue Expense Aging',
    description: 'Outstanding payable expenses categorized by aging brackets',
    href: '#unpaid-aging-report',
  },
  {
    id: 'reimbursement-summary',
    title: 'Employee Reimbursement Summary',
    description: 'Approved, pending, and disbursed staff expense claims',
    href: '#reimbursement-summary-report',
  },
  {
    id: 'cost-trend',
    title: 'Monthly Operating Cost Trend',
    description: 'Historical variance analysis and operating cost budget comparison',
    href: '#cost-trend-report',
  },
]

interface Props {
  isDragging?: boolean
  isDragOver?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragOver?: (e: React.DragEvent) => void
  onDragLeave?: () => void
  onDrop?: (e: React.DragEvent) => void
  onDragEnd?: () => void
}

export function ExpensesReportsCard({
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
}: Props) {
  const { isExpanded, toggle } = useCardCollapse(false)

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`expenses-card-draggable w-full flex flex-col justify-between rounded-xl border border-[#72bee9] bg-white p-3.5 shadow-2xs transition-shadow duration-200 hover:shadow-xs ${
        isDragging ? 'is-dragging' : ''
      } ${isDragOver ? 'is-drag-over' : ''}`}
    >
      {/* Header */}
      <div>
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={toggle}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="drag-handle p-0.5 text-slate-300 hover:text-slate-600 transition shrink-0"
              title="Drag to reposition"
            >
              <GripVertical className="size-3.5" />
            </span>
            <ReportsIcon className="size-5 text-slate-800 shrink-0" />
            <h2 className="text-[14px] font-bold text-slate-900 truncate">Reports</h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            aria-label={isExpanded ? 'Collapse Reports' : 'Expand Reports'}
            className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-300 ease-in-out ${
                isExpanded ? 'rotate-180 text-slate-600' : 'rotate-0 text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Collapsible Content */}
        <div
          className={`card-collapse-grid ${
            isExpanded ? 'is-expanded' : 'is-collapsed'
          }`}
        >
          <div className="card-collapse-inner">
            <div className="mt-2.5 flex flex-col gap-1.5">
              {EXPENSE_REPORTS.map((report) => (
                <a
                  key={report.id}
                  href={report.href}
                  className="group flex items-center justify-between rounded-lg border border-slate-100 p-2 transition hover:border-purple-200 hover:bg-purple-50/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="grid size-7 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600 group-hover:bg-purple-100 group-hover:text-purple-700">
                      <FileSpreadsheet className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11.5px] font-semibold text-slate-800 group-hover:text-purple-700 truncate">
                        {report.title}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {report.description}
                      </div>
                    </div>
                  </div>

                  <ChevronRight className="size-3.5 shrink-0 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition" />
                </a>
              ))}
            </div>

            {/* Footer link */}
            <div className="mt-2 text-right">
              <a
                href="#all-expense-reports"
                className="text-[11px] font-medium text-blue-600 transition hover:underline"
              >
                View all reports
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
