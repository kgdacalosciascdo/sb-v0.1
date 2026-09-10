import { useNavigate } from 'react-router-dom'
import cashPurchaseImg from '../../../assets/icons/cash-purchase.png'
import creditPurchaseImg from '../../../assets/icons/credit-purchase.png'
import paySupplierImg from '../../../assets/icons/pay-supplier.png'

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
    id: 'cash-purchase',
    title: 'Cash Purchase',
    description: 'Record purchase paid in cash.',
    buttonText: 'New Cash Purchase',
    icon: cashPurchaseImg,
    bgClass: 'bg-[#fde599]',
    borderClass: 'border-[#f59e0b]',
    textColor: 'text-slate-900',
    subtextColor: 'text-slate-700',
    route: '#new-cash-purchase',
  },
  {
    id: 'credit-purchase',
    title: 'Credit Purchase',
    description: 'Record purchase bought in credit.',
    buttonText: 'New Credit Purchase',
    icon: creditPurchaseImg,
    bgClass: 'bg-[#fde599]',
    borderClass: 'border-[#f59e0b]',
    textColor: 'text-slate-900',
    subtextColor: 'text-slate-700',
    route: '#new-credit-purchase',
  },
  {
    id: 'pay-supplier',
    title: 'Pay Supplier',
    description: 'Pay outstanding supplier balances.',
    buttonText: 'Pay Supplier',
    icon: paySupplierImg,
    bgClass: 'bg-[#fde599]',
    borderClass: 'border-[#f59e0b]',
    textColor: 'text-slate-900',
    subtextColor: 'text-slate-700',
    route: '#pay-supplier',
  },
]

export function PurchasesActionCards() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
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
