import {
  Bell,
  ChevronDown,
  CircleHelp,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  UserCircle,
} from 'lucide-react'

type NavbarProps = {
  isSidebarCollapsed: boolean
  onMenuClick: () => void
  onToggleSidebar: () => void
}

export function Navbar({ isSidebarCollapsed, onMenuClick, onToggleSidebar }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-brand-300/70 bg-brand-300/90 shadow-sm backdrop-blur">
      <div className="flex min-h-[4.5rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          aria-controls="app-sidebar"
          aria-label="Open navigation menu"
          className="grid size-10 shrink-0 place-items-center rounded-xl text-ink-900 transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 lg:hidden"
          onClick={onMenuClick}
          type="button"
        >
          <Menu aria-hidden="true" size={22} />
        </button>

        <button
          aria-controls="app-sidebar"
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-pressed={isSidebarCollapsed}
          className="hidden size-10 shrink-0 place-items-center rounded-xl text-ink-900 transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 lg:grid"
          onClick={onToggleSidebar}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          type="button"
        >
          {isSidebarCollapsed ? <PanelLeftOpen aria-hidden="true" size={20} /> : <PanelLeftClose aria-hidden="true" size={20} />}
        </button>

        <div className="min-w-0 shrink-0">
          <p className="truncate text-sm font-semibold text-ink-900 sm:text-base">XYZ Enterprise</p>
          <p className="hidden text-[0.65rem] uppercase tracking-[0.16em] text-ink-700/80 sm:block">Active company</p>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          <label className="relative hidden w-[min(34vw,22rem)] md:block">
            <span className="sr-only">Search SimpleBIZ</span>
            <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500" size={17} />
            <input
              aria-label="Search customers, sales, products, and records"
              className="w-full rounded-xl border border-brand-500/60 bg-white/85 py-2.5 pl-9 pr-14 text-xs text-ink-900 outline-none transition placeholder:text-ink-500 focus:border-brand-700 focus:ring-4 focus:ring-white/50"
              placeholder="Search customers, sales, products, and records..."
              type="search"
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 text-[0.6rem] font-medium text-ink-500 xl:block">
              Ctrl + K
            </span>
          </label>

          <button
            aria-label="Notifications"
            className="relative grid size-10 place-items-center rounded-xl text-ink-900 transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
            type="button"
          >
            <Bell aria-hidden="true" size={19} />
            <span aria-hidden="true" className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-brand-300" />
          </button>
          <button
            aria-label="Help and support"
            className="hidden size-10 place-items-center rounded-xl text-ink-900 transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 sm:grid"
            type="button"
          >
            <CircleHelp aria-hidden="true" size={19} />
          </button>

          <button
            aria-haspopup="true"
            aria-label="Open profile menu for Juan dela Cruz"
            className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 text-left transition hover:bg-white/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700"
            type="button"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-800 text-sm font-bold text-white shadow-sm">
              <UserCircle aria-hidden="true" size={21} />
            </span>
            <span className="hidden min-w-0 lg:block">
              <span className="block truncate text-xs font-semibold text-ink-900">Juan dela Cruz</span>
              <span className="block text-[0.65rem] text-ink-700">Business Owner</span>
            </span>
            <ChevronDown aria-hidden="true" className="hidden text-ink-700 lg:block" size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
