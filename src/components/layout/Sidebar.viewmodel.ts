import { getNavSectionsForRole } from '../../config/navigation.config'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { usePermission } from '../../hooks/usePermission'

function formatRoleLabel(role: string): string {
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function useSidebarViewModel() {
  const user = useAuthStore((state) => state.user)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const { role } = usePermission()

  const sections = getNavSectionsForRole(role)

  return {
    user,
    sidebarCollapsed,
    toggleSidebar,
    sections,
    roleLabel: formatRoleLabel(role),
  }
}
