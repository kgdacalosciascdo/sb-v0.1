import { ChevronDown, GripVertical, Menu } from 'lucide-react'
import { useCardCollapse } from '../../../hooks/useCardCollapse'

interface ExpenseItem {
  id: string
  date: string
  description: string
  category: string
  amount: string
  user: string
}

const RECENT_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    date: '29 July 2026',
    description: 'PLDT Fiber Internet Bill',
    category: 'Utilities',
    amount: '₱3,899',
    user: 'KVL',
  },
  {
    id: 'exp-2',
    date: '29 July 2026',
    description: 'Office Supplies & Stationery',
    category: 'Admin',
    amount: '₱1,450',
    user: 'CAL',
  },
  {
    id: 'exp-3',
    date: '28 July 2026',
    description: 'Store Fuel & Gas Reimbursement',
    category: 'Transportation',
    amount: '₱2,500',
    user: 'KVL',
  },
  {
    id: 'exp-4',
    date: '28 July 2026',
    description: 'Store Cleaning & Sanitization',
    category: 'Maintenance',
    amount: '₱850',
    user: 'CAL',
  },
  {
    id: 'exp-5',
    date: '27 July 2026',
    description: 'Marketing Facebook Ads',
    category: 'Marketing',
    amount: '₱5,000',
    user: 'KVL',
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

export function ExpensesRecentActivityCard({
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
            <Menu aria-hidden="true" className="size-5 text-slate-800 shrink-0" />
            <h2 className="text-[14px] font-bold text-slate-900 truncate">Recent Expenses</h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            aria-label={isExpanded ? 'Collapse Recent Expenses' : 'Expand Recent Expenses'}
            className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-300 ease-in-out ${
                isExpanded ? 'rotate-180 text-slate-600' : 'rotate-0 text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Collapsible Activity Table Container */}
        <div
          className={`card-collapse-grid ${
            isExpanded ? 'is-expanded' : 'is-collapsed'
          }`}
        >
          <div className="card-collapse-inner">
            <div className="mt-2.5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-900">
                    <th scope="col" className="py-2 pr-2">Date</th>
                    <th scope="col" className="py-2 px-2">Description / Vendor</th>
                    <th scope="col" className="py-2 px-2">Category</th>
                    <th scope="col" className="py-2 px-2 text-right">Amount</th>
                    <th scope="col" className="py-2 pl-2 text-right">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70">
                  {RECENT_EXPENSES.map((item) => (
                    <tr key={item.id} className="transition hover:bg-slate-50/60">
                      <td className="py-2.5 pr-2 text-[11px] text-slate-500 whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="py-2.5 px-2 text-[11.5px] font-medium text-slate-800">
                        {item.description}
                      </td>
                      <td className="py-2.5 px-2 text-[11px] text-slate-600 whitespace-nowrap">
                        {item.category}
                      </td>
                      <td className="py-2.5 px-2 text-[11.5px] font-semibold text-slate-900 text-right whitespace-nowrap">
                        {item.amount}
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                          {item.user}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
