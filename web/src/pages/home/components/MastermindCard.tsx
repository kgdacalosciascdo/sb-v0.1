import { MessageSquare } from 'lucide-react'

export function MastermindCard() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#32bcf7] bg-[#67d0fc] p-4 shadow-xs transition hover:shadow-sm">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-2">
          <MessageSquare
            aria-hidden="true"
            className="size-4.5 fill-[#84cc16] text-[#84cc16]"
          />
          <h2 className="text-[14px] font-bold text-[#053d5a]">SimpleBIZ Mastermind</h2>
        </div>
        <p className="mx-auto mt-1 max-w-xs text-[11px] leading-relaxed text-[#074667]">
          Connect with entrepreneurs, join focused groups, and grow through curated peer circles.
        </p>
      </div>

      {/* Sub-pills / tags */}
      <div className="my-2 text-center text-[11px] font-medium text-[#074667]">
        Community · Groups · Circles · Elite
      </div>

      {/* Action CTA */}
      <div className="flex justify-center">
        <button
          type="button"
          className="rounded-full bg-[#00a2e8] px-5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0288d1] active:scale-95"
        >
          Explore Mastermind
        </button>
      </div>
    </div>
  )
}
