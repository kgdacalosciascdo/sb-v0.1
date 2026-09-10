import { ChevronDown, GripVertical, Lock, FileText, PlusSquare, SlidersHorizontal, Layers } from 'lucide-react'
import { useCardCollapse } from '../../../hooks/useCardCollapse'

export function PurchasesMoreActionsCard() {
  const { isExpanded, isFullHeight, toggle } = useCardCollapse(true)

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
            <Layers aria-hidden="true" className="size-5 text-slate-800 shrink-0" />
            <h2 className="text-[14px] font-bold text-slate-900 truncate">More Actions</h2>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
            aria-label={isExpanded ? 'Collapse More Actions' : 'Expand More Actions'}
            className="grid size-6 place-items-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-300 ease-in-out ${
                isExpanded ? 'rotate-180 text-slate-600' : 'rotate-0 text-slate-400'
              }`}
            />
          </button>
        </div>

        {/* Collapsible Content */}
        <div
          className={`card-collapse-grid ${
            isExpanded ? 'is-expanded' : 'is-collapsed'
          }`}
        >
          <div className="card-collapse-inner">
            <div className="mt-3 flex flex-col gap-2">
              {/* 1. Request for Quotation */}
              <a
                href="#request-quotation"
                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="size-4 text-slate-400 shrink-0" />
                  <span className="truncate">Request for Quotation</span>
                </div>
                <Lock className="size-3.5 text-slate-400 shrink-0" />
              </a>

              {/* 2. Purchase Order */}
              <a
                href="#purchase-order"
                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="size-4 text-slate-400 shrink-0" />
                  <span className="truncate">Purchase Order</span>
                </div>
                <Lock className="size-3.5 text-slate-400 shrink-0" />
              </a>

              {/* 3. Purchase Returns */}
              <a
                href="#purchase-returns"
                className="group flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs transition hover:border-slate-300 hover:bg-slate-100"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <PlusSquare className="size-4 text-slate-400 shrink-0" />
                  <span className="truncate">Purchase Returns</span>
                </div>
                <Lock className="size-3.5 text-slate-400 shrink-0" />
              </a>

              {/* 4. Credit/Debit Adjustment */}
              <a
                href="#credit-debit-adjustment"
                className="group flex items-center gap-2.5 rounded-lg border border-sky-200 bg-sky-100/75 px-3 py-2 text-xs font-semibold text-sky-950 shadow-2xs transition hover:bg-sky-200 hover:border-sky-300 active:scale-[0.99]"
              >
                <SlidersHorizontal className="size-4 text-sky-700 shrink-0" />
                <span className="truncate">Credit/Debit Adjustment</span>
              </a>
            </div>

            {/* Footer link */}
            <div className="mt-2 text-right">
              <a
                href="#all-purchase-actions"
                className="text-[11px] font-medium text-[#0288d1] transition hover:underline"
              >
                View all
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
