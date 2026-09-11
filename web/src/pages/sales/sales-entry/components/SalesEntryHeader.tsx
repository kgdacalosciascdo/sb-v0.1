import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import cashierIcon from '../../../../assets/icons/cashier.png'
import type { SalesMode } from '../types'

export function SalesEntryBreadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-[12px] text-slate-400 font-normal pb-0.5">
      <Link
        to="/sales"
        className="hover:text-[#0288d1] transition-colors"
      >
        Sales &amp; Receivables
      </Link>
      <ChevronRight className="size-3 mx-1 text-slate-400" />
      <span className="text-slate-500">Sales Entry</span>
    </nav>
  )
}

interface SalesEntryHeaderProps {
  mode: SalesMode
  onModeChange: (newMode: SalesMode) => void
}

export function SalesEntryHeader({ mode, onModeChange }: SalesEntryHeaderProps) {
  const isCredit = mode === 'credit'

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-0.5">
      {/* Title & Subtitle */}
      <div className="flex items-center gap-3">
        <div className="flex w-12 h-12 shrink-0 items-center justify-center overflow-hidden">
          <img
            src={cashierIcon}
            alt=""
            aria-hidden="true"
            className="w-12 h-12 object-contain scale-[1.8] drop-shadow-xs"
          />
        </div>
        <div>
          <h1 className="text-[25px] sm:text-[27px] font-bold tracking-tight text-[#1e293b] leading-tight">
            {isCredit ? 'Credit Sale' : 'Cash Sale'}
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            {isCredit
              ? 'Create a sales transaction, collect payment if needed, and track what customers owes.'
              : 'Create a sales transaction paid in cash.'}
          </p>
        </div>
      </div>

      {/* Sales Mode Switcher */}
      <div className="flex flex-col items-start gap-1 shrink-0">
        <span className="text-[12px] font-medium text-[#5c7a94] leading-tight">Sales Mode</span>
        <div className="inline-flex rounded-lg border border-[#63c4ed] bg-white overflow-hidden shadow-2xs">
          <button
            type="button"
            onClick={() => onModeChange('cash')}
            className={`px-4 py-1.5 text-xs transition-all cursor-pointer ${
              !isCredit
                ? 'bg-[#0288d1] text-white font-semibold'
                : 'bg-white text-slate-500 hover:text-slate-700 font-normal'
            }`}
          >
            Cash Sale
          </button>
          <button
            type="button"
            onClick={() => onModeChange('credit')}
            className={`px-4 py-1.5 text-xs transition-all cursor-pointer ${
              isCredit
                ? 'bg-[#0288d1] text-white font-semibold'
                : 'bg-white text-slate-500 hover:text-slate-700 font-normal'
            }`}
          >
            Credit Sale
          </button>
        </div>
      </div>
    </div>
  )
}
