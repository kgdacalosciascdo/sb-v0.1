import { useNavigate } from 'react-router-dom'
import cashHandImg from '../../../assets/icons/cash-hand.png'
import purchaseReturnImg from '../../../assets/icons/purchase-return.png'
import cashAccountsImg from '../../../assets/icons/cash-accounts.png'
import customerLedgerImg from '../../../assets/icons/Cusutomer-ledger.png'

interface ActionCardConfig {
  id: string
  title: string
  description: string
  buttonText: string
  icon: string
  bgClass: string
  borderClass: string
  textColor: string
  subtextColor: string
  route: string
}

const ACTION_CARDS: ActionCardConfig[] = [
  {
    id: 'collections',
    title: 'Collections',
    description: 'Receive money from payment of customer receivables.',
    buttonText: 'Receive Payment',
    icon: cashHandImg,
    bgClass: 'bg-[#caedd6]',
    borderClass: 'border-[#68c486]',
    textColor: 'text-slate-900',
    subtextColor: 'text-slate-700',
    route: '#receive-payment',
  },
  {
    id: 'receipt-history',
    title: 'Receipt History',
    description: 'Review customer payments and issued receipts.',
    buttonText: 'View Receipts',
    icon: purchaseReturnImg,
    bgClass: 'bg-[#caedd6]',
    borderClass: 'border-[#68c486]',
    textColor: 'text-slate-900',
    subtextColor: 'text-slate-700',
    route: '#receipt-history',
  },
  {
    id: 'cash-remittance',
    title: 'Cash Remittance',
    description: 'Record the remittance of collected cash.',
    buttonText: 'Record Remittance',
    icon: cashAccountsImg,
    bgClass: 'bg-[#dcedc8]',
    borderClass: 'border-[#9ccc65]',
    textColor: 'text-slate-900',
    subtextColor: 'text-slate-700',
    route: '#record-remittance',
  },
  {
    id: 'customer-ledger',
    title: 'Customer Ledger',
    description: 'View customer balances, receivables, and payment history.',
    buttonText: 'View Customer Ledger',
    icon: customerLedgerImg,
    bgClass: 'bg-[#2ea5f5]',
    borderClass: 'border-[#0288d1]',
    textColor: 'text-white',
    subtextColor: 'text-white/95',
    route: '#customer-ledger',
  },
]

export function CollectionsActionCards() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {ACTION_CARDS.map((card) => (
        <div
          key={card.id}
          className={`flex min-h-[290px] sm:min-h-[310px] flex-col justify-between rounded-xl border-2 ${card.borderClass} ${card.bgClass} p-4.5 sm:p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-sm`}
        >
          {/* Top Section: Graphic & Labels */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-28 sm:h-32 w-full items-center justify-center pt-1">
              <img
                src={card.icon}
                alt=""
                aria-hidden="true"
                className="max-h-24 sm:max-h-28 w-auto object-contain drop-shadow-sm"
              />
            </div>

            <h2 className={`mt-3 text-[16px] sm:text-[17px] font-bold tracking-tight ${card.textColor}`}>
              {card.title}
            </h2>
            <p className={`mt-1.5 line-clamp-2 min-h-[34px] text-[11.5px] leading-relaxed ${card.subtextColor}`}>
              {card.description}
            </p>
          </div>

          {/* Bottom Action Button */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => {
                if (card.route.startsWith('/')) {
                  navigate(card.route)
                }
              }}
              className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2 text-center text-[12.5px] font-bold text-slate-800 shadow-2xs transition hover:bg-slate-50 hover:text-slate-950 active:scale-95 cursor-pointer"
            >
              {card.buttonText}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
