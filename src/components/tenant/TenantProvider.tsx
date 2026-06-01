import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { resolveTenantFromHost } from '../../api/companies.api'
import { useUIStore } from '../../store/uiStore'
import { TenantNotFoundPage } from './TenantNotFoundPage'
import { TenantSuspendedPage } from './TenantSuspendedPage'

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const location = useLocation()
  const tenantMode = useUIStore((state) => state.tenantMode)
  const setTenantResolution = useUIStore((state) => state.setTenantResolution)

  useEffect(() => {
    let cancelled = false

    setTenantResolution({ mode: 'loading' })

    void resolveTenantFromHost(window.location.hostname, location.search).then((result) => {
      if (cancelled) return

      switch (result.mode) {
        case 'platform':
          setTenantResolution({ mode: 'platform', tenant: null, unknownSlug: null })
          break
        case 'tenant':
          setTenantResolution({
            mode: 'tenant',
            tenant: {
              slug: result.slug,
              companyId: result.companyId,
              name: result.name,
            },
            unknownSlug: null,
          })
          break
        case 'not_found':
          setTenantResolution({
            mode: 'not_found',
            tenant: null,
            unknownSlug: result.slug,
          })
          break
        case 'suspended':
          setTenantResolution({
            mode: 'suspended',
            tenant: {
              slug: result.slug,
              companyId: result.companyId,
              name: result.name,
            },
            unknownSlug: result.slug,
          })
          break
      }
    })

    return () => {
      cancelled = true
    }
  }, [location.search, setTenantResolution])

  if (tenantMode === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base text-sm text-secondary">
        Loading workspace...
      </div>
    )
  }

  if (tenantMode === 'not_found') {
    return <TenantNotFoundPage />
  }

  if (tenantMode === 'suspended') {
    return <TenantSuspendedPage />
  }

  return children
}
