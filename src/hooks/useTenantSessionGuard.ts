import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import { useTenant } from './useTenant'

/** Logs out users whose company does not match the resolved tenant host. */
export function useTenantSessionGuard() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const addNotification = useNotificationStore((state) => state.addNotification)
  const { isTenantHost, resolvedTenant } = useTenant()

  useEffect(() => {
    if (!isTenantHost || !resolvedTenant || !user) return
    if (user.role === 'super_admin') return

    if (user.companyId !== resolvedTenant.companyId) {
      logout()
      addNotification('error', 'Your account belongs to a different organization.')
      navigate('/login', { replace: true })
    }
  }, [isTenantHost, resolvedTenant, user, logout, addNotification, navigate])
}
