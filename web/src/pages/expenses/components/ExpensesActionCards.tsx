import { useNavigate } from 'react-router-dom'
import walletImg from '../../../assets/icons/wallet.png'

interface ActionCardConfig {
  id: string
  title: string
  description: string
  buttonText: string
  imageSrc?: string
  customIcon?: React.ReactNode
  bgClass: string
  borderClass: string
  textColor: string
  subtextColor: string
  route: string
}

// Custom Record Expense Illustration (Receipt with Calculator & Gold Peso Coin)
function RecordExpenseIllustration() {
  return (
    <svg className="h-24 sm:h-28 w-auto drop-shadow-sm" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Receipt Paper in Background */}
      <path d="M48 24H112V104L104 98L96 104L88 98L80 104L72 98L64 104L56 98L48 104V24Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2.5" />
      <line x1="58" y1="36" x2="102" y2="36" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="46" x2="92" y2="46" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="58" y1="56" x2="84" y2="56" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />

      {/* Calculator (Left Foreground) */}
      <rect x="36" y="52" width="46" height="62" rx="6" fill="#0284c7" stroke="#0369a1" strokeWidth="3" />
      <rect x="42" y="58" width="34" height="14" rx="2" fill="#e0f2fe" />
      {/* Keypad */}
      <rect x="42" y="78" width="7" height="7" rx="1.5" fill="#ffffff" />
      <rect x="52" y="78" width="7" height="7" rx="1.5" fill="#ffffff" />
      <rect x="62" y="78" width="7" height="7" rx="1.5" fill="#ffffff" />
      <rect x="42" y="88" width="7" height="7" rx="1.5" fill="#ffffff" />
      <rect x="52" y="88" width="7" height="7" rx="1.5" fill="#ffffff" />
      <rect x="62" y="88" width="7" height="7" rx="1.5" fill="#ffffff" />
      <rect x="42" y="98" width="17" height="7" rx="1.5" fill="#38bdf8" />
      <rect x="62" y="98" width="7" height="7" rx="1.5" fill="#f59e0b" />

      {/* Gold Coin with Peso Symbol (Right Foreground) */}
      <circle cx="108" cy="88" r="18" fill="#facc15" stroke="#ca8a04" strokeWidth="3" />
      <circle cx="108" cy="88" r="14" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" strokeDasharray="2 2" />
      <text x="108" y="95" textAnchor="middle" fill="#854d0e" fontSize="18" fontWeight="bold" fontFamily="system-ui, sans-serif">₱</text>
    </svg>
  )
}

const ACTION_CARDS: ActionCardConfig[] = [
  {
    id: 'record-expense',
    title: 'Record Expense',
    description: 'Record a business expense, whether paid or payable.',
    buttonText: 'Record Expense',
    customIcon: <RecordExpenseIllustration />,
    bgClass: 'bg-[#dfa8e6]',
    borderClass: 'border-[#c06ec9]',
    textColor: 'text-[#3b0764]',
    subtextColor: 'text-[#581c87]',
    route: '#record-expense',
  },
  {
    id: 'pay-expense',
    title: 'Pay Expense',
    description: 'Pay a recorded expense that remains unpaid.',
    buttonText: 'Pay Expense',
    imageSrc: walletImg,
    bgClass: 'bg-[#dfa8e6]',
    borderClass: 'border-[#c06ec9]',
    textColor: 'text-[#3b0764]',
    subtextColor: 'text-[#581c87]',
    route: '#pay-expense',
  },
]

export function ExpensesActionCards() {
  const navigate = useNavigate()

  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {ACTION_CARDS.map((card) => (
        <div
          key={card.id}
          className={`flex min-h-[290px] sm:min-h-[310px] flex-col justify-between rounded-xl border-2 ${card.borderClass} ${card.bgClass} p-4.5 sm:p-5 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-sm`}
        >
          {/* Top Section: Graphic & Labels */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-28 sm:h-32 w-full items-center justify-center pt-1">
              {card.imageSrc ? (
                <img
                  src={card.imageSrc}
                  alt=""
                  aria-hidden="true"
                  className="max-h-24 sm:max-h-28 w-auto object-contain drop-shadow-sm"
                />
              ) : (
                card.customIcon
              )}
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
