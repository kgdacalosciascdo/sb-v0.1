import { useState } from 'react'
import { Megaphone, MoreHorizontal, Star } from 'lucide-react'
import featuredDashboardImg from '../../../assets/images/home/featured-dashboard.png'

export function FeaturedCard() {
  const [showNoticeMenu, setShowNoticeMenu] = useState(false)

  return (
    <div className="flex flex-col rounded-2xl border border-[#fbc02d]/70 bg-[#fde887] p-4 shadow-xs transition hover:shadow-sm">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[0.85fr_1.8fr]">
        {/* Left Column: Featured, Title, Divider, Body, Learn more */}
        <div className="flex flex-col">
          {/* Featured Header */}
          <div className="flex items-center gap-1.5">
            <Star aria-hidden="true" className="size-4.5 fill-[#f97316] text-[#f97316]" />
            <h2 className="text-[15px] font-bold text-[#ea580c]">Featured</h2>
          </div>

          {/* Title */}
          <h3 className="mt-3 text-[13.5px] font-bold leading-tight text-slate-900 sm:text-[14px]">
            What&apos;s new<br />in SimpleBIZ
          </h3>

          {/* Subtle Divider */}
          <div className="mt-2.5 mb-3 h-px w-full bg-[#f59e0b]/30" />

          {/* Description Text */}
          <p className="text-[10.5px] leading-relaxed text-slate-800 sm:text-[11px]">
            SimpleBIZ One now offers a clearer and faster way to manage your daily business activities. Explore the redesigned workspaces, guided setup, and new tools that help you stay organized and in control.
          </p>

          {/* Learn More Button directly below paragraph, aligned right */}
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-[#f6c343] px-3.5 py-1 text-[10.5px] font-semibold text-slate-900 shadow-xs transition hover:bg-[#eab308] active:scale-95"
            >
              Learn more
            </button>
          </div>
        </div>

        {/* Right Column: Tablet Dashboard Preview + Updates & Notices */}
        <div className="flex flex-col">
          {/* Tablet Mockup Preview (Lowered more) */}
          <div className="mt-5 overflow-hidden rounded-xl border border-amber-300/80 bg-white shadow-xs sm:mt-6">
            <img
              src={featuredDashboardImg}
              alt="SimpleBIZ One Dashboard Preview"
              className="h-auto w-full object-cover"
            />
          </div>

          {/* Updates & Notices Section immediately below preview */}
          <div className="mt-3.5">
            {/* Header with Authentic Blue Megaphone */}
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-bold text-slate-900 sm:text-[14px]">
                Updates &amp; Notices
              </span>
              <Megaphone
                aria-hidden="true"
                className="size-4.5 fill-[#38bdf8] text-[#00a2e8] -rotate-12"
              />
            </div>

            {/* Subtle Divider */}
            <div className="mt-2 mb-2.5 h-px w-full bg-[#f59e0b]/35" />

            {/* Maintenance Info + Options Ellipsis */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-bold leading-tight text-slate-900 sm:text-[13px]">
                  Scheduled maintenance
                </div>
                <div className="mt-1 text-[11px] leading-tight text-slate-700 sm:text-[11.5px]">
                  29 August 2026, 1:00-2:00 AM
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  aria-label="More notices options"
                  onClick={() => setShowNoticeMenu((prev) => !prev)}
                  className="flex items-center justify-center rounded-lg bg-[#f6c343] px-3 py-1.5 text-xs font-bold text-slate-900 shadow-xs transition hover:bg-[#eab308] active:scale-95"
                >
                  <MoreHorizontal className="size-4" />
                </button>

                {showNoticeMenu && (
                  <div className="absolute right-0 bottom-full mb-1 w-48 rounded-lg border border-amber-300 bg-white p-2 text-xs text-slate-700 shadow-lg z-20">
                    <p className="font-semibold text-slate-900">System Maintenance</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Routine server performance optimizations. SB1 services may briefly be offline.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
