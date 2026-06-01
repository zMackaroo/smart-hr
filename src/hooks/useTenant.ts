import { useUIStore } from '../store/uiStore'

export function useTenant() {
  const tenantMode = useUIStore((state) => state.tenantMode)
  const resolvedTenant = useUIStore((state) => state.resolvedTenant)
  const unknownTenantSlug = useUIStore((state) => state.unknownTenantSlug)

  return {
    tenantMode,
    resolvedTenant,
    unknownTenantSlug,
    isPlatform: tenantMode === 'platform',
    isTenantHost: tenantMode === 'tenant',
    isLoading: tenantMode === 'loading',
  }
}
