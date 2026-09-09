import { UserCheck } from 'lucide-react'

export function YourListingCard() {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#5ec5f5] bg-[#a6e5fc] p-4 shadow-xs transition hover:shadow-sm">
      {/* Top Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded-full bg-[#00a2e8] text-white shadow-xs">
            <UserCheck className="size-3" />
          </div>
          <h2 className="text-[14px] font-bold text-[#084869]">Your Listing</h2>
        </div>
        <p className="mt-1 text-[11px] leading-tight text-[#0d557a]">
          Manage how your business appears in the SimpleBIZ Business Directory.
        </p>
      </div>

      {/* Middle Company Info */}
      <div className="my-3 text-center sm:my-4">
        <h3 className="text-sm font-bold text-slate-900 sm:text-[15px]">XYZ Enterprise</h3>
        <p className="mt-0.5 text-[11px] text-[#0d557a]">Company description</p>
      </div>

      {/* Bottom Action */}
      <div className="flex justify-center">
        <button
          type="button"
          className="rounded-full bg-[#00a2e8] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0288d1] active:scale-95"
        >
          Manage listing
        </button>
      </div>
    </div>
  )
}
