import {
  CompanyFormSchema,
  CompanyListResponseSchema,
  CompanySchema,
  type Company,
  type CompanyFormInput,
  type CompanyListResponse,
} from '../types/companies.types'
import { isReservedSlug } from '../config/tenant.config'
import { resolveTenantSlug } from '../utils/tenant.utils'
import { slugifyCompanyName } from '../utils/company-context.utils'
import { createDefaultCompanySettings } from './company.api'

const MOCK_DELAY_MS = 350

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createSeedCompanies(): Company[] {
  return [
    CompanySchema.parse({
      id: 'co-1',
      name: 'SmartHR Inc.',
      slug: 'smarthr',
      status: 'active',
      plan: 'enterprise',
      createdAt: '2025-01-01T00:00:00.000Z',
    }),
    CompanySchema.parse({
      id: 'co-2',
      name: 'Acme Corp',
      slug: 'acme',
      status: 'active',
      plan: 'professional',
      createdAt: '2025-06-01T00:00:00.000Z',
    }),
  ]
}

let companyStore: Company[] = createSeedCompanies()
let nextCompanyId = companyStore.length + 1

export const COMPANIES_QUERY_KEY = ['companies'] as const

export function getCompanyBySlugSync(slug: string): Company | undefined {
  return companyStore.find((company) => company.slug === slug.toLowerCase())
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  await delay()
  return getCompanyBySlugSync(slug) ?? null
}

export async function resolveTenantFromHost(
  hostname: string,
  search = '',
): Promise<
  | { mode: 'platform' }
  | { mode: 'tenant'; slug: string; companyId: string; name: string }
  | { mode: 'not_found'; slug: string }
  | { mode: 'suspended'; slug: string; companyId: string; name: string }
> {
  await delay(50)

  const slug = resolveTenantSlug(hostname, search)

  if (!slug) {
    return { mode: 'platform' }
  }

  const company = getCompanyBySlugSync(slug)
  if (!company) {
    return { mode: 'not_found', slug }
  }

  if (company.status === 'inactive') {
    return {
      mode: 'suspended',
      slug: company.slug,
      companyId: company.id,
      name: company.name,
    }
  }

  return {
    mode: 'tenant',
    slug: company.slug,
    companyId: company.id,
    name: company.name,
  }
}

export async function getCompanies(): Promise<CompanyListResponse> {
  await delay()
  return CompanyListResponseSchema.parse({
    data: [...companyStore].sort((a, b) => a.name.localeCompare(b.name)),
    total: companyStore.length,
  })
}

export function getCompanyByIdSync(id: string): Company | undefined {
  return companyStore.find((company) => company.id === id)
}

export function getAllCompaniesSync(): Company[] {
  return [...companyStore]
}

export async function createCompany(data: CompanyFormInput): Promise<Company> {
  await delay()

  const parsed = CompanyFormSchema.parse(data)
  const slug = (parsed.slug || slugifyCompanyName(parsed.name)).toLowerCase()

  if (isReservedSlug(slug)) {
    throw new Error('This workspace URL is reserved. Please choose a different slug.')
  }

  if (companyStore.some((company) => company.slug === slug)) {
    throw new Error('A company with this slug already exists')
  }

  const company = CompanySchema.parse({
    id: `co-${nextCompanyId++}`,
    name: parsed.name,
    slug,
    status: parsed.status,
    plan: parsed.plan,
    createdAt: new Date().toISOString(),
  })

  companyStore.push(company)
  createDefaultCompanySettings(company.id, company.name)

  return company
}

export async function updateCompany(id: string, data: CompanyFormInput): Promise<Company> {
  await delay()

  const index = companyStore.findIndex((company) => company.id === id)
  if (index === -1) {
    throw new Error('Company not found')
  }

  const parsed = CompanyFormSchema.parse(data)
  const slug = (parsed.slug || slugifyCompanyName(parsed.name)).toLowerCase()

  if (isReservedSlug(slug)) {
    throw new Error('This workspace URL is reserved. Please choose a different slug.')
  }

  if (companyStore.some((company) => company.slug === slug && company.id !== id)) {
    throw new Error('A company with this slug already exists')
  }

  companyStore[index] = CompanySchema.parse({
    ...companyStore[index],
    name: parsed.name,
    slug,
    status: parsed.status,
    plan: parsed.plan,
  })

  return companyStore[index]
}

export async function createCompanyFromRegistration(name: string): Promise<Company> {
  const baseSlug = slugifyCompanyName(name)
  let slug = baseSlug
  let suffix = 1

  while (companyStore.some((company) => company.slug === slug) || isReservedSlug(slug)) {
    slug = `${baseSlug}-${suffix++}`
  }

  return createCompany({
    name,
    slug,
    plan: 'starter',
    status: 'active',
  })
}
