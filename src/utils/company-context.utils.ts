import { useAuthStore } from '../store/authStore'
import { useUIStore } from '../store/uiStore'
import { DEFAULT_COMPANY_ID } from '../config/company.config'

export { DEFAULT_COMPANY_ID }

/** Resolve active company for mock API reads/writes (no React hooks). */
export function getActiveCompanyIdSync(): string {
  const { tenantMode, resolvedTenant, activeCompanyId } = useUIStore.getState()

  if (tenantMode === 'tenant' && resolvedTenant) {
    return resolvedTenant.companyId
  }

  if (tenantMode === 'not_found' || tenantMode === 'suspended') {
    throw new Error('Tenant context is unavailable')
  }

  const user = useAuthStore.getState().user
  if (!user) return DEFAULT_COMPANY_ID

  if (user.role === 'super_admin') {
    return activeCompanyId ?? user.companyId ?? DEFAULT_COMPANY_ID
  }

  return user.companyId ?? DEFAULT_COMPANY_ID
}

export function filterByCompany<T extends { companyId: string }>(
  items: T[],
  companyId = getActiveCompanyIdSync(),
): T[] {
  return items.filter((item) => item.companyId === companyId)
}

export function assertCompanyAccess(
  entityCompanyId: string,
  companyId = getActiveCompanyIdSync(),
): void {
  const user = useAuthStore.getState().user
  if (user?.role === 'super_admin') {
    if (entityCompanyId !== companyId) {
      throw new Error('Access denied: resource belongs to another company')
    }
    return
  }

  if (entityCompanyId !== companyId) {
    throw new Error('Access denied: cross-company access is not allowed')
  }
}

export function slugifyCompanyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function isTenantHostMode(): boolean {
  return useUIStore.getState().tenantMode === 'tenant'
}

export function isPlatformHostMode(): boolean {
  const mode = useUIStore.getState().tenantMode
  return mode === 'platform' || mode === 'loading'
}
