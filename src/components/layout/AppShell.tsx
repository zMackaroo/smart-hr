import { Outlet } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { useResponsiveSidebar } from '../../hooks/useResponsiveSidebar'
import { useUIStore } from '../../store/uiStore'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

export function AppShell() {
  useResponsiveSidebar()
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)

  return (
    <div className="min-h-screen bg-base">
      <Sidebar />
      <div
        className={cn(
          'flex min-h-screen flex-col transition-all duration-200',
          sidebarCollapsed ? 'ml-16' : 'ml-64',
        )}
      >
        <Topbar />
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
