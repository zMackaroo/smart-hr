import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { usePermission } from '../../hooks/usePermission'
import { buildBreadcrumbs } from '../../utils/breadcrumbs.utils'

export function useTopbarViewModel() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const { isSuperAdmin } = usePermission()

  const breadcrumbs = useMemo(
    () => buildBreadcrumbs(location.pathname),
    [location.pathname],
  )

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  if (!user) {
    throw new Error('Topbar requires an authenticated user')
  }

  return {
    user,
    sidebarCollapsed,
    toggleSidebar,
    breadcrumbs,
    unreadCount: 3,
    showSettings: isSuperAdmin,
    onLogout,
  }
}
