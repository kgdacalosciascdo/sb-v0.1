import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '../../../lib/cn'
import { Navbar } from '../Navbar/Navbar'
import { Sidebar } from '../Sidebar/Sidebar'

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-brand-100">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={() => setIsSidebarOpen(false)}
      />
      <div className={cn('min-h-screen transition-[padding] duration-300 lg:pl-72', isSidebarCollapsed && 'lg:pl-[5.5rem]')}>
        <Navbar
          isSidebarCollapsed={isSidebarCollapsed}
          onMenuClick={() => setIsSidebarOpen(true)}
          onToggleSidebar={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
        />
        <main className="w-full min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] px-4 py-3.5 sm:px-8 sm:py-4 lg:px-10 xl:px-12" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
