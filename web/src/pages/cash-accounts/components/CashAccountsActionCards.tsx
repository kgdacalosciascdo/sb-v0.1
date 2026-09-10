import { useNavigate } from 'react-router-dom'
import cashHandImg from '../../../assets/icons/cash-hand.png'
import cashAccountsImg from '../../../assets/icons/cash-accounts.png'

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

// Custom Cash Out Illustration (Safe Box with Red Arrow)
function CashOutIllustration() {
  return (
    <svg className="h-24 sm:h-28 w-auto drop-shadow-sm" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Safe Box Body */}
      <rect x="36" y="24" width="88" height="88" rx="8" fill="#65a30d" stroke="#365314" strokeWidth="4" />
      <rect x="44" y="32" width="72" height="72" rx="4" fill="#84cc16" />
      
      {/* Dial Wheel */}
      <circle cx="80" cy="68" r="16" fill="#4d7c0f" stroke="#365314" strokeWidth="3" />
      <circle cx="80" cy="68" r="6" fill="#facc15" />
      <line x1="80" y1="54" x2="80" y2="58" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="80" y1="78" x2="80" y2="82" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="66" y1="68" x2="70" y2="68" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="90" y1="68" x2="94" y2="68" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />

      {/* Red Circular Arrow Out (Top Right) */}
      <circle cx="108" cy="36" r="18" fill="#ef4444" stroke="#ffffff" strokeWidth="3" />
      <path d="M100 44C102 38 106 32 114 32M114 32V38M114 32H108" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Custom Transfer Funds Illustration (Bank + Mobile + Safe with Sync Arrows)
function TransferFundsIllustration() {
  return (
    <svg className="h-24 sm:h-28 w-auto drop-shadow-sm" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bank Building (Top Left) */}
      <path d="M30 46L54 32L78 46H30Z" fill="#94a3b8" stroke="#475569" strokeWidth="2.5" />
      <rect x="36" y="46" width="6" height="20" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
      <rect x="51" y="46" width="6" height="20" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
      <rect x="66" y="46" width="6" height="20" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
      <rect x="28" y="66" width="52" height="6" rx="1" fill="#94a3b8" stroke="#475569" strokeWidth="2" />

      {/* Mobile Phone (Top Right) */}
      <rect x="100" y="28" width="30" height="48" rx="4" fill="#0284c7" stroke="#0369a1" strokeWidth="2.5" />
      <rect x="104" y="34" width="22" height="32" rx="2" fill="#ffffff" />
      <circle cx="115" cy="71" r="2" fill="#ffffff" />

      {/* Safe Box (Bottom Left) */}
      <rect x="42" y="78" width="38" height="34" rx="4" fill="#65a30d" stroke="#365314" strokeWidth="2.5" />
      <circle cx="61" cy="95" r="7" fill="#4d7c0f" stroke="#facc15" strokeWidth="2" />

      {/* Orange Sync Arrows Circle (Center) */}
      <circle cx="88" cy="74" r="18" fill="#f97316" stroke="#ffffff" strokeWidth="3" />
      <path d="M80 72A9 9 0 0 1 95 67L97 69M97 69V64M97 69H92" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M96 76A9 9 0 0 1 81 81L79 79M79 79V84M79 79H84" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const ACTION_CARDS: ActionCardConfig[] = [
  {
    id: 'cash-in',
    title: 'Cash In',
    description: 'Record money received into a Cash Account.',
    buttonText: 'Cash In',
    imageSrc: cashHandImg,
    bgClass: 'bg-[#d9f59b]',
    borderClass: 'border-[#9ec94c]',
    textColor: 'text-[#273c0e]',
    subtextColor: 'text-[#3e5e18]',
    route: '#cash-in',
  },
  {
    id: 'cash-out',
    title: 'Cash Out',
    description: 'Record money leaving a Cash Account.',
    buttonText: 'Cash Out',
    customIcon: <CashOutIllustration />,
    bgClass: 'bg-[#d9f59b]',
    borderClass: 'border-[#9ec94c]',
    textColor: 'text-[#273c0e]',
    subtextColor: 'text-[#3e5e18]',
    route: '#cash-out',
  },
  {
    id: 'transfer-funds',
    title: 'Transfer Funds',
    description: 'Move money between Cash Accounts.',
    buttonText: 'Transfer Funds',
    customIcon: <TransferFundsIllustration />,
    bgClass: 'bg-[#d9f59b]',
    borderClass: 'border-[#9ec94c]',
    textColor: 'text-[#273c0e]',
    subtextColor: 'text-[#3e5e18]',
    route: '#transfer-funds',
  },
  {
    id: 'cash-remittance',
    title: 'Cash Remittance',
    description: 'Record the remittance of collected cash.',
    buttonText: 'Record Remittance',
    imageSrc: cashAccountsImg,
    bgClass: 'bg-[#d9f59b]',
    borderClass: 'border-[#9ec94c]',
    textColor: 'text-[#273c0e]',
    subtextColor: 'text-[#3e5e18]',
    route: '#cash-remittance',
  },
]

export function CashAccountsActionCards() {
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
