import { useNavigate } from 'react-router-dom'
import cashierImg from '../../../assets/icons/cashier.png'
import cashHandImg from '../../../assets/icons/cash-hand.png'
import truckImg from '../../../assets/icons/truck.png'
import paySupplierImg from '../../../assets/icons/pen.png'
import cartonImg from '../../../assets/icons/carton.png'

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
    id: 'sales',
    title: 'Sales',
    description: 'Create a cash or credit sale.',
    buttonText: 'New Sale',
    icon: cashierImg,
    bgClass: 'bg-[#2ea5f5]',
    borderClass: 'border-[#0288d1]',
    textColor: 'text-white',
    subtextColor: 'text-white/95',
    route: '/sales',
  },
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
    route: '/collections',
  },
  {
    id: 'purchases',
    title: 'Purchases',
    description: 'Record a cash or credit purchase.',
    buttonText: 'New Purchase',
    icon: truckImg,
    bgClass: 'bg-[#fde599]',
    borderClass: 'border-[#f59e0b]',
    textColor: 'text-slate-900',
    subtextColor: 'text-slate-700',
    route: '/purchases',
  },
  {
    id: 'payments',
    title: 'Payments',
    description: 'Pay suppliers and settle other obligations.',
    buttonText: 'Make Payment',
    icon: paySupplierImg,
    bgClass: 'bg-[#be727e]',
    borderClass: 'border-[#9b4d5a]',
    textColor: 'text-white',
    subtextColor: 'text-white/95',
    route: '/payments',
  },
  {
    id: 'inventory',
    title: 'Inventory',
    description: 'Receive, issue, transfer, or adjust stock.',
    buttonText: 'Record Stock Movement',
    icon: cartonImg,
    bgClass: 'bg-[#d7b58d]',
    borderClass: 'border-[#b08b5d]',
    textColor: 'text-slate-900',
    subtextColor: 'text-slate-700',
    route: '/inventory',
  },
]

export function DashboardActionCards() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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
              onClick={() => navigate(card.route)}
              className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2 text-center text-[12.5px] font-bold text-slate-800 shadow-2xs transition hover:bg-slate-50 hover:text-slate-950 active:scale-95"
            >
              {card.buttonText}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
