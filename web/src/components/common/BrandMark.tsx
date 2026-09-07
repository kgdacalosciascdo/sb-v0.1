import { cn } from '../../lib/cn'

type BrandMarkProps = {
  compact?: boolean
  className?: string
}

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="relative flex size-9 shrink-0 items-center justify-center">
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="size-8.5 shrink-0 drop-shadow-sm"
        >
          {/* Sandy Island Base */}
          <ellipse cx="18" cy="31" rx="11" ry="3.5" fill="#fde047" stroke="#ca8a04" strokeWidth="0.8" />
          <ellipse cx="20" cy="30.5" rx="7" ry="2" fill="#fef08a" opacity="0.6" />

          {/* Curved Palm Trunk */}
          <path
            d="M17.5 30.5C18.5 24 16.5 17 19.5 11"
            stroke="#78350f"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M16 28C17 23 15.5 18 18 13"
            stroke="#92400e"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* Coconuts */}
          <circle cx="17.5" cy="12.5" r="2" fill="#eab308" stroke="#a16207" strokeWidth="0.6" />
          <circle cx="20.5" cy="13" r="1.8" fill="#ca8a04" stroke="#713f12" strokeWidth="0.6" />

          {/* Palm Fronds */}
          <path
            d="M19 11C15 8 8 10 6 15C10 14 15 13.5 19 11Z"
            fill="#22c55e"
            stroke="#15803d"
            strokeWidth="0.7"
          />
          <path
            d="M19 11C16 5 20 2 24 4C23 8 21 10 19 11Z"
            fill="#16a34a"
            stroke="#15803d"
            strokeWidth="0.7"
          />
          <path
            d="M19 11C23 7 30 8 32 13C28 12.5 23 12.5 19 11Z"
            fill="#4ade80"
            stroke="#16a34a"
            strokeWidth="0.7"
          />
          <path
            d="M19 11C13 11 9 17 9 20C12 17.5 16 15 19 11Z"
            fill="#15803d"
            stroke="#14532d"
            strokeWidth="0.7"
          />
          <path
            d="M19 11C23 12 28 17 28 20C25 17.5 22 15 19 11Z"
            fill="#22c55e"
            stroke="#16a34a"
            strokeWidth="0.7"
          />
        </svg>
      </div>
      {!compact && (
        <span className="whitespace-nowrap text-xl font-bold tracking-tight text-white drop-shadow-sm">
          Simple<span className="text-[#38bdf8]">BIZ</span>
          <sup className="ml-0.5 align-super text-[0.6rem] font-extrabold text-[#38bdf8]">1</sup>
        </span>
      )}
    </div>
  )
}
