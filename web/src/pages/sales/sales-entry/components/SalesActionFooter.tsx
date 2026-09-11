import { Eye, CheckCircle2, Save, XCircle } from 'lucide-react'

interface SalesActionFooterProps {
  onCancel: () => void
  onSaveDraft: () => void
  onPreview: () => void
  onComplete: () => void
  isSubmitting?: boolean
}

export function SalesActionFooter({
  onCancel,
  onSaveDraft,
  onPreview,
  onComplete,
  isSubmitting = false,
}: SalesActionFooterProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
      {/* Left / Middle actions */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer inline-flex items-center gap-1.5"
        >
          <XCircle className="size-3.5 text-slate-400" />
          <span>Cancel</span>
        </button>

        <button
          type="button"
          onClick={onSaveDraft}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer inline-flex items-center gap-1.5"
        >
          <Save className="size-3.5 text-slate-400" />
          <span>Save as Draft</span>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onPreview}
          className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer inline-flex items-center gap-1.5"
        >
          <Eye className="size-3.5 text-slate-500" />
          <span>Preview</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onComplete}
          className="rounded-lg bg-[#0288d1] px-6 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#0277bd] active:scale-98 transition cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <CheckCircle2 className="size-4" />
          <span>Complete Sale</span>
        </button>
      </div>
    </div>
  )
}
