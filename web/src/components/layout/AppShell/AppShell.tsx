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
        <main className="mx-auto min-h-[calc(100vh-4.5rem)] max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
