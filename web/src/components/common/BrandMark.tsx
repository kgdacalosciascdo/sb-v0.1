import { Palmtree } from 'lucide-react'
import { cn } from '../../lib/cn'

type BrandMarkProps = {
  compact?: boolean
  className?: string
}

export function BrandMark({ compact = false, className }: BrandMarkProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-white/15 text-brand-100">
        <Palmtree aria-hidden="true" size={24} strokeWidth={1.8} />
      </span>
      {!compact && (
        <span className="whitespace-nowrap text-xl font-semibold tracking-tight text-white">
          Simple<span className="text-brand-100">BIZ</span>
          <sup className="ml-0.5 align-super text-[0.55rem] font-bold text-brand-100">1</sup>
        </span>
      )}
    </div>
  )
}
