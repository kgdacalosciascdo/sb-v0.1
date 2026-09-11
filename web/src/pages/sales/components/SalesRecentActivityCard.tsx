import { ChevronDown, ListFilter, GripVertical } from 'lucide-react'
import { useCardCollapse } from '../../../hooks/useCardCollapse'
import { useSalesStore } from '../../../stores/useSalesStore'

export function SalesRecentActivityCard() {
  const { isExpanded, isFullHeight, toggle } = useCardCollapse(false)
  const sales = useSalesStore((state) => state.sales)
  const activities = sales.slice(0, 5)

  return (
    <div
      className={`w-full flex flex-col justify-between rounded-xl border border-[#72bee9] bg-white p-3.5 shadow-2xs transition-shadow duration-200 hover:shadow-xs ${
        isFullHeight ? 'h-full' : 'h-auto self-start'
      }`}
    >
      <div>
        <div
          className="flex items-center justify-between cursor-pointer select-none"
          onClick={toggle}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="drag-handle p-0.5 text-slate-300 hover:text-slate-600 transition shrink-0" title="Drag to reposition">
              <GripVertical className="size-3.5" />
            </span>
            <ListFilter aria-hidden="true" className="size-5 text-slate-800 shrink-0" />
            <h2 className="text-[14px] font-bold text-slate-900 truncate">Recent Activity</h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            aria-label={isExpanded ? 'Collapse Recent Activity' : 'Expand Recent Activity'}
            className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <ChevronDown className={`size-4 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-180 text-slate-600' : 'rotate-0 text-slate-400'}`} />
          </button>
        </div>

        <div className={`card-collapse-grid ${isExpanded ? 'is-expanded' : 'is-collapsed'}`}>
          <div className="card-collapse-inner">
            <div className="mt-2.5 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-900">
                    <th scope="col" className="py-2 pr-2">Date</th>
                    <th scope="col" className="py-2 px-2">Activity</th>
                    <th scope="col" className="py-2 px-2 text-right">Amount</th>
                    <th scope="col" className="py-2 pl-2 text-right">Source</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/70">
                  {activities.map((sale) => (
                    <tr key={sale.id} className="transition hover:bg-slate-50/60">
                      <td className="py-2.5 pr-2 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(sale.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-2.5 px-2 text-[11.5px] font-medium text-slate-800">
                        {sale.mode === 'cash' ? 'Cash sale recorded' : 'Credit sale recorded'}
                      </td>
                      <td className="py-2.5 px-2 text-[11.5px] font-semibold text-slate-900 text-right whitespace-nowrap">
                        ₱{sale.calculations.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 pl-2 text-right">
                        <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">Local</span>
                      </td>
                    </tr>
                  ))}
                  {activities.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[11px] text-slate-500">Completed sales will appear here.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
