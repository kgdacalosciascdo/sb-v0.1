import { ChevronDown, LayoutGrid, GripVertical } from 'lucide-react'
import { useCardCollapse } from '../../../hooks/useCardCollapse'
import { Link } from 'react-router-dom'
import cashierImg from '../../../assets/icons/cashier.png'
import cashHandImg from '../../../assets/icons/cash-hand.png'
import customerLedgerImg from '../../../assets/icons/Cusutomer-ledger.png'
import cashAccountsImg from '../../../assets/icons/cash-accounts.png'
import overdueImg from '../../../assets/icons/overdue-accounts.png'
import cartonImg from '../../../assets/icons/carton.png'
import penImg from '../../../assets/icons/pen.png'
import walletImg from '../../../assets/icons/wallet.png'

interface LedgerItem {
  id: string
  label: string
  icon: string
  href: string
}

const SALES_LEDGERS: LedgerItem[] = [
  {
    id: 'sales-history',
    label: 'Sales History',
    icon: cashierImg,
    href: '/sales/history',
  },
  {
    id: 'collection-history',
    label: 'Collection History',
    icon: cashHandImg,
    href: '#collection-history',
  },
  {
    id: 'customer-ledgers',
    label: 'Customer Ledgers',
    icon: customerLedgerImg,
    href: '#customer-ledgers',
  },
  {
    id: 'cash-drawer-history',
    label: 'Cash Drawer History',
    icon: cashAccountsImg,
    href: '#cash-drawer-history',
  },
  {
    id: 'overdue-accounts',
    label: 'Overdue Accounts',
    icon: overdueImg,
    href: '#overdue-accounts',
  },
  {
    id: 'sales-returns',
    label: 'Sales Returns',
    icon: cartonImg,
    href: '#sales-returns',
  },
  {
    id: 'voided-sales',
    label: 'Voided Sales',
    icon: penImg,
    href: '#voided-sales',
  },
  {
    id: 'adjustments-memos',
    label: 'Adjustments & Memos',
    icon: walletImg,
    href: '#adjustments-memos',
  },
]

export function SalesRecordsLedgersCard() {
  const { isExpanded, isFullHeight, toggle } = useCardCollapse(false)

  return (
    <div
      className={`w-full flex flex-col justify-between rounded-xl border border-[#72bee9] bg-white p-3.5 shadow-2xs transition-shadow duration-200 hover:shadow-xs ${
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
            className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
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
              {SALES_LEDGERS.map((item) => (
                <Link
                  key={item.id}
                  to={item.href}
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
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
