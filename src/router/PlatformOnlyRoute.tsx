import type { ReactNode } from 'react'
import { useTenant } from '../hooks/useTenant'
import { getPlatformUrl } from '../utils/tenant.utils'

interface PlatformOnlyRouteProps {
  children: ReactNode
  redirectTo?: string
}

/** Redirects tenant-host visitors to the equivalent path on the platform host. */
export function PlatformOnlyRoute({ children, redirectTo = '/register' }: PlatformOnlyRouteProps) {
  const { isTenantHost, isLoading } = useTenant()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base text-sm text-secondary">
        Loading...
      </div>
    )
  }

  if (isTenantHost) {
    window.location.replace(getPlatformUrl(redirectTo))
    return null
  }

  return children
}
