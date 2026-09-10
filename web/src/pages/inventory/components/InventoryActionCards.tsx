import { useNavigate } from 'react-router-dom'
import receiveItemsImg from '../../../assets/icons/receive-items.png'

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

// Custom Issue Stock Illustration
function IssueStockIllustration() {
  return (
    <svg className="h-24 sm:h-28 w-auto drop-shadow-sm" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hand Truck Frame */}
      <path d="M42 28L42 108L124 108" stroke="#52525b" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 28L48 28" stroke="#52525b" strokeWidth="6" strokeLinecap="round" />
      <circle cx="48" cy="116" r="10" fill="#27272a" stroke="#71717a" strokeWidth="3" />
      <circle cx="118" cy="116" r="10" fill="#27272a" stroke="#71717a" strokeWidth="3" />
      
      {/* Cargo Box with Arrow */}
      <rect x="62" y="38" width="58" height="58" rx="4" fill="#a16207" stroke="#78350f" strokeWidth="2.5" />
      {/* Box flap detail */}
      <path d="M62 52L120 52" stroke="#854d0e" strokeWidth="2" strokeDasharray="3 3" />
      {/* Arrow */}
      <path d="M78 67L100 67M100 67L92 59M100 67L92 75" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Custom Physical Count Illustration
function PhysicalCountIllustration() {
  return (
    <svg className="h-24 sm:h-28 w-auto drop-shadow-sm" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Clipboard base */}
      <rect x="36" y="24" width="70" height="92" rx="6" fill="#f8fafc" stroke="#64748b" strokeWidth="3" />
      {/* Clip at top */}
      <path d="M56 24V18C56 15.5 58 14 60.5 14H81.5C84 14 86 15.5 86 18V24" stroke="#475569" strokeWidth="3" fill="#cbd5e1" />
      <circle cx="71" cy="20" r="2.5" fill="#475569" />
      
      {/* Checklist items */}
      <rect x="46" y="38" width="10" height="10" rx="2" fill="#22c55e" />
      <path d="M48.5 43L51 45.5L54 40.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="62" y1="43" x2="94" y2="43" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

      <rect x="46" y="54" width="10" height="10" rx="2" fill="#22c55e" />
      <path d="M48.5 59L51 61.5L54 56.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="62" y1="59" x2="88" y2="59" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

      <rect x="46" y="70" width="10" height="10" rx="2" fill="#22c55e" />
      <path d="M48.5 75L51 77.5L54 72.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="62" y1="75" x2="84" y2="75" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />

      {/* Stacked Brown Boxes */}
      <rect x="80" y="80" width="28" height="24" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
      <rect x="106" y="80" width="28" height="24" rx="2" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
      <rect x="92" y="60" width="28" height="22" rx="2" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
    </svg>
  )
}

const ACTION_CARDS: ActionCardConfig[] = [
  {
    id: 'receive-stock',
    title: 'Receive Stock',
    description: 'Record items received into inventory.',
    buttonText: 'Receive Stock',
    imageSrc: receiveItemsImg,
    bgClass: 'bg-[#ebdccb]',
    borderClass: 'border-[#caa688]',
    textColor: 'text-[#5c381e]',
    subtextColor: 'text-[#7c5335]',
    route: '#receive-stock',
  },
  {
    id: 'issue-stock',
    title: 'Issue Stock',
    description: 'Record items released from inventory.',
    buttonText: 'Issue Stock',
    customIcon: <IssueStockIllustration />,
    bgClass: 'bg-[#ebdccb]',
    borderClass: 'border-[#caa688]',
    textColor: 'text-[#5c381e]',
    subtextColor: 'text-[#7c5335]',
    route: '#issue-stock',
  },
  {
    id: 'physical-count',
    title: 'Physical Count',
    description: 'Count actual stock and identify variances.',
    buttonText: 'Start Count',
    customIcon: <PhysicalCountIllustration />,
    bgClass: 'bg-[#ebdccb]',
    borderClass: 'border-[#caa688]',
    textColor: 'text-[#5c381e]',
    subtextColor: 'text-[#7c5335]',
    route: '#physical-count',
  },
]

export function InventoryActionCards() {
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
