import { ChevronRight, LogOut, X } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import { BrandMark } from '../../common/BrandMark'
import { cn } from '../../../lib/cn'
import { clearDemoAuthenticated } from '../../../features/auth/utils/demoAuth'
import { homeNavigation, primaryNavigation, secondaryNavigation } from '../../../routes/navigation'
import type { NavigationItem } from '../../../types/navigation'

type SidebarProps = {
  isOpen: boolean
  isCollapsed: boolean
  onClose: () => void
  onNavigate: () => void
}

const mainModuleNavigation = primaryNavigation.filter((item) => item.path !== '/dashboard')

export function Sidebar({ isOpen, isCollapsed, onClose, onNavigate }: SidebarProps) {
  const navigate = useNavigate()

  function handleLogout() {
    clearDemoAuthenticated()
    onClose()
    navigate('/login', { replace: true })
  }

  function renderTopLink(item: NavigationItem) {
    const Icon = item.icon

    return (
      <NavLink
        aria-label={isCollapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            'group flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-medium text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600',
            isCollapsed ? 'justify-center px-2' : 'justify-start',
            isActive ? 'bg-white/15 text-white' : 'hover:bg-white/10',
          )
        }
        end
        key={item.path}
        onClick={onNavigate}
        title={isCollapsed ? item.label : undefined}
        to={item.path}
      >
        <Icon aria-hidden="true" className="shrink-0" size={20} strokeWidth={1.9} />
        <span className={cn('truncate', isCollapsed && 'sr-only')}>{item.label}</span>
        {!isCollapsed && <ChevronRight aria-hidden="true" className="ml-auto" size={18} />}
      </NavLink>
    )
  }

  function renderModuleLink(item: NavigationItem) {
    const Icon = item.icon

    return (
      <NavLink
        aria-label={isCollapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            'group relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset',
            isCollapsed ? 'justify-center px-2' : 'justify-start',
            isCollapsed
              ? isActive
                ? 'bg-brand-100 text-brand-800'
                : 'text-white hover:bg-white/10 hover:text-white'
              : isActive
                ? 'bg-brand-100 text-ink-900'
                : 'text-ink-900 hover:bg-brand-50',
          )
        }
        end
        key={item.path}
        onClick={onNavigate}
        title={isCollapsed ? item.label : undefined}
        to={item.path}
      >
        <Icon aria-hidden="true" className="shrink-0" size={21} strokeWidth={1.9} />
        <span className={cn('truncate', isCollapsed && 'sr-only')}>{item.label}</span>
        {!isCollapsed && <ChevronRight aria-hidden="true" className="ml-auto text-ink-500" size={18} />}
      </NavLink>
    )
  }

  function renderSecondaryLink(item: NavigationItem) {
    const Icon = item.icon

    return (
      <NavLink
        aria-label={isCollapsed ? item.label : undefined}
        className={({ isActive }) =>
          cn(
            'group flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-xs font-medium text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600',
            isCollapsed ? 'justify-center px-2' : 'justify-start',
            isActive ? 'bg-white/15 text-white' : 'hover:bg-white/10',
          )
        }
        end
        key={item.path}
        onClick={onNavigate}
        title={isCollapsed ? item.label : undefined}
        to={item.path}
      >
        <Icon aria-hidden="true" className="shrink-0" size={20} strokeWidth={1.9} />
        <span className={cn('truncate', isCollapsed && 'sr-only')}>{item.label}</span>
        {!isCollapsed && <ChevronRight aria-hidden="true" className="ml-auto" size={18} />}
      </NavLink>
    )
  }

  return (
    <>
      <div
        aria-hidden="true"
        className={cn('fixed inset-0 z-40 bg-ink-900/40 transition-opacity lg:hidden', isOpen ? 'opacity-100' : 'pointer-events-none opacity-0')}
        onClick={onClose}
      />
      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col bg-brand-600 text-white shadow-2xl transition-[width,transform] duration-300 lg:translate-x-0',
          isOpen && 'translate-x-0',
          isCollapsed ? 'lg:w-[5.5rem]' : 'lg:w-72',
        )}
        id="app-sidebar"
      >
        <div className={cn('flex min-h-[4.5rem] items-center border-b border-white/15 px-5', isCollapsed && 'justify-center px-3')}>
          <BrandMark compact={isCollapsed} />
          <button
            aria-label="Close navigation menu"
            className="ml-auto grid size-9 place-items-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto py-2" aria-label="SimpleBIZ modules">
          <div className="space-y-0.5 px-3">
            {renderTopLink(homeNavigation)}
            {renderTopLink(primaryNavigation[0])}
          </div>

          <div className="mx-4 my-3 border-t border-white/25" />

          <section className={cn('mx-3 rounded-2xl bg-white p-1 shadow-lg shadow-brand-800/10', isCollapsed && '!bg-transparent !p-0 !shadow-none')}>
            <h2 className={cn('px-3 pb-2 pt-2 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink-500', isCollapsed && 'sr-only')}>Main modules</h2>
            <div className="space-y-0.5">{mainModuleNavigation.map(renderModuleLink)}</div>
          </section>

          <div className="mx-4 my-3 border-t border-white/25" />

          <div className="space-y-0.5 px-3">{secondaryNavigation.map(renderSecondaryLink)}</div>
        </nav>

        <div className="border-t border-white/25 p-3">
          <button
            aria-label={isCollapsed ? 'Log out' : undefined}
            className={cn(
              'flex min-h-10 w-full items-center gap-2.5 rounded-xl px-3 text-xs font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600',
              isCollapsed ? 'justify-center px-2' : 'justify-start',
            )}
            onClick={handleLogout}
            title={isCollapsed ? 'Log out' : undefined}
            type="button"
          >
            <LogOut aria-hidden="true" className="shrink-0" size={20} />
            <span className={cn(isCollapsed && 'sr-only')}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
