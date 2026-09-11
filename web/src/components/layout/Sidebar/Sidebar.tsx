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
            'group relative flex min-h-[42px] items-center gap-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset',
            isCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2',
            isActive
              ? 'text-white font-semibold'
              : 'text-white/90 hover:bg-white/10 hover:text-white',
          )
        }
        end
        key={item.path}
        onClick={onNavigate}
        title={isCollapsed ? item.label : undefined}
        to={item.path}
      >
        {({ isActive }) => (
          <>
            {Icon && <Icon aria-hidden="true" className="size-5 shrink-0 text-white" strokeWidth={1.9} />}
            <span className={cn('truncate text-[14px]', isCollapsed && 'sr-only')}>{item.label}</span>
            {/* Active Indicator Bar on the right edge */}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 right-0 w-2.5 bg-[#00c9a7]"
              />
            )}
          </>
        )}
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
            'group relative flex min-h-[50px] items-center gap-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset',
            isCollapsed ? 'justify-center px-2 py-2' : 'px-4 py-2',
            isActive
              ? 'text-slate-950 font-bold bg-white'
              : 'text-slate-700 font-medium hover:bg-slate-50/80 hover:text-slate-950',
          )
        }
        end={item.path === '/dashboard'}
        key={item.path}
        onClick={onNavigate}
        title={isCollapsed ? item.label : undefined}
        to={item.path}
      >
        {({ isActive }) => (
          <>
            <div className="flex size-9 shrink-0 items-center justify-center">
              {item.imageIcon ? (
                <img
                  alt=""
                  aria-hidden="true"
                  className="size-9 shrink-0 object-contain drop-shadow-xs scale-150"
                  src={item.imageIcon}
                />
              ) : Icon ? (
                <Icon aria-hidden="true" className="size-8 shrink-0" />
              ) : null}
            </div>

            <span className={cn('truncate text-[14px] leading-tight', isCollapsed && 'sr-only')}>
              {item.label}
            </span>

            {/* Active Indicator Bar on the right edge */}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 right-0 w-3 bg-[#00c9a7]"
              />
            )}
          </>
        )}
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
            'group relative flex min-h-[40px] items-center gap-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-inset',
            isCollapsed ? 'justify-center px-2 py-1.5' : 'px-4 py-1.5',
            isActive
              ? 'text-white font-semibold'
              : 'text-white/90 hover:bg-white/10 hover:text-white',
          )
        }
        end
        key={item.path}
        onClick={onNavigate}
        title={isCollapsed ? item.label : undefined}
        to={item.path}
      >
        {({ isActive }) => (
          <>
            {Icon && <Icon aria-hidden="true" className="size-5 shrink-0 text-white" strokeWidth={1.8} />}
            <span className={cn('truncate text-[13.5px]', isCollapsed && 'sr-only')}>{item.label}</span>
            {/* Active Indicator Bar on the right edge */}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 right-0 w-2.5 bg-[#00c9a7]"
              />
            )}
          </>
        )}
      </NavLink>
    )
  }

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-ink-900/50 backdrop-blur-xs transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
      />

      {/* Main Sidebar */}
      <aside
        aria-label="Main navigation"
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col bg-[#0288d1] text-white shadow-2xl transition-[width,transform] duration-300 lg:translate-x-0',
          isOpen && 'translate-x-0',
          isCollapsed ? 'lg:w-[5.5rem]' : 'lg:w-72',
        )}
        id="app-sidebar"
      >
        {/* Brand Header */}
        <div
          className={cn(
            'flex min-h-14 sm:min-h-16 items-center px-4',
            isCollapsed ? 'justify-center px-2' : 'justify-start',
          )}
        >
          <BrandMark compact={isCollapsed} />
          <button
            aria-label="Close navigation menu"
            className="ml-auto grid size-8 place-items-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:hidden"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </div>

        {/* Navigation Content */}
        <nav className="min-h-0 flex-1 overflow-y-auto py-2 space-y-3" aria-label="SimpleBIZ modules">
          {/* Top Links outside white box (Home & Dashboard) */}
          <div className="space-y-0.5">
            {renderTopLink(homeNavigation)}
            {renderTopLink(primaryNavigation[0])}
          </div>

          {/* Main Modules Inside Crisp White Container */}
          <div className="px-3.5">
            <section
              className={cn(
                'overflow-hidden bg-white shadow-sm',
                isCollapsed && 'rounded-xl p-1',
              )}
            >
              <div className="divide-y divide-slate-100/60">
                {mainModuleNavigation.map(renderModuleLink)}
              </div>

              {/* More > Action Footer */}
              {!isCollapsed && (
                <div className="flex items-center justify-end px-3.5 py-2 text-xs font-normal text-slate-500 hover:text-slate-700 cursor-pointer transition select-none">
                  <span className="flex items-center gap-0.5">
                    More <ChevronRight aria-hidden="true" className="size-3.5 inline" />
                  </span>
                </div>
              )}
            </section>
          </div>

          {/* Secondary Menus (Master Registries, Settings, Help) */}
          <div className="space-y-0.5 pt-1">
            {secondaryNavigation.map(renderSecondaryLink)}
          </div>
        </nav>

        {/* Bottom Footer / Logout */}
        <div className="p-3">
          <button
            aria-label={isCollapsed ? 'Logout' : undefined}
            className={cn(
              'flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0288d1]',
              isCollapsed ? 'justify-center px-2' : 'justify-start',
            )}
            onClick={handleLogout}
            title={isCollapsed ? 'Logout' : undefined}
            type="button"
          >
            <LogOut aria-hidden="true" className="size-5 shrink-0 text-white" strokeWidth={1.8} />
            <span className={cn(isCollapsed && 'sr-only')}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
