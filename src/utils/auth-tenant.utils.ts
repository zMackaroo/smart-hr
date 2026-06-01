import type { AuthResponse } from '../types/auth.types'
import { getCompanyByIdSync } from '../api/companies.api'
import { useUIStore } from '../store/uiStore'
import { buildTenantLoginUrl } from './tenant.utils'

export function assertLoginAllowedForTenant(user: AuthResponse['user']): void {
  const { tenantMode, resolvedTenant } = useUIStore.getState()

  if (tenantMode === 'tenant' && resolvedTenant) {
    if (user.companyId !== resolvedTenant.companyId) {
      throw new Error('This account belongs to another organization.')
    }
    return
  }

  if (tenantMode === 'platform' && user.role !== 'super_admin') {
    const company = user.companyId ? getCompanyByIdSync(user.companyId) : undefined
    if (company) {
      throw new Error(
        `Please sign in at your company workspace: ${buildTenantLoginUrl(company.slug)}`,
      )
    }
  }
}
