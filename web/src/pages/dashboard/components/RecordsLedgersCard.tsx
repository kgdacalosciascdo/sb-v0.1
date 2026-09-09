import { ChevronDown, LayoutGrid, GripVertical } from 'lucide-react'
import { useCardCollapse } from '../../../hooks/useCardCollapse'
import cashierImg from '../../../assets/icons/cashier.png'
import cashHandImg from '../../../assets/icons/cash-hand.png'
import truckImg from '../../../assets/icons/truck.png'
import cashAccountsImg from '../../../assets/icons/cash-accounts.png'
import customerLedgerImg from '../../../assets/icons/Cusutomer-ledger.png'
import penImg from '../../../assets/icons/pen.png'
import walletImg from '../../../assets/icons/wallet.png'
import overdueImg from '../../../assets/icons/overdue-accounts.png'

interface LedgerItem {
  id: string
  label: string
  icon: string
  href: string
}

const LEDGERS: LedgerItem[] = [
  {
    id: 'sales-history',
    label: 'Sales History',
    icon: cashierImg,
    href: '#sales-history',
  },
  {
    id: 'collection-history',
    label: 'Collection History',
    icon: cashHandImg,
    href: '#collection-history',
  },
  {
    id: 'purchase-history',
    label: 'Purchase History',
    icon: truckImg,
    href: '#purchase-history',
  },
  {
    id: 'cash-history',
    label: 'Cash Account History',
    icon: cashAccountsImg,
    href: '#cash-account-history',
  },
  {
    id: 'cash-drawer-history',
    label: 'Cash Drawer History',
    icon: overdueImg,
    href: '#cash-drawer-history',
  },
  {
    id: 'customer-ledgers',
    label: 'Customer Ledgers',
    icon: customerLedgerImg,
    href: '#customer-ledgers',
  },
  {
    id: 'supplier-ledgers',
    label: 'Supplier Ledgers',
    icon: penImg,
    href: '#supplier-ledgers',
  },
  {
    id: 'expenses-history',
    label: 'Expenses History',
    icon: walletImg,
    href: '#expenses-history',
  },
]

export function RecordsLedgersCard() {
  const { isExpanded, isFullHeight, toggle } = useCardCollapse(true)

  return (
    <div
      className={`w-full flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-shadow duration-200 hover:shadow-sm ${
        isFullHeight ? 'h-full' : 'h-auto self-start'
      }`}
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
            <LayoutGrid aria-hidden="true" className="size-5 text-slate-800 shrink-0" />
            <h2 className="text-[14px] font-bold text-slate-900 truncate">Records &amp; Ledgers</h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            aria-label={isExpanded ? 'Collapse Records & Ledgers' : 'Expand Records & Ledgers'}
            className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-300 ease-in-out ${
                isExpanded ? 'rotate-180 text-slate-600' : 'rotate-0 text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Collapsible 4-column Grid of Ledger items */}
        <div
          className={`card-collapse-grid ${
            isExpanded ? 'is-expanded' : 'is-collapsed'
          }`}
        >
          <div className="card-collapse-inner">
            <div className="mt-3 grid grid-cols-4 gap-2.5 py-1">
              {LEDGERS.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  className="group flex flex-col items-center justify-center rounded-lg border border-transparent p-1.5 text-center transition hover:border-sky-200 hover:bg-sky-50/50"
                >
                  <div className="flex h-16 sm:h-18 w-full items-center justify-center">
                    <img
                      src={item.icon}
                      alt=""
                      aria-hidden="true"
                      className="h-14 sm:h-16 max-w-[72px] sm:max-w-[84px] object-contain transition duration-200 group-hover:scale-110 drop-shadow-xs"
                    />
                  </div>
                  <span className="mt-1 line-clamp-2 text-[11px] sm:text-[11.5px] font-medium leading-tight text-slate-800 group-hover:text-[#0288d1]">
                    {item.label}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

