export interface ResolvedTenant {
  slug: string
  companyId: string
  name: string
}

export type TenantMode = 'loading' | 'platform' | 'tenant' | 'not_found' | 'suspended'
