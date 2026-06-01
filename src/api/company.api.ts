import {
  CompanySettingsSchema,
  type CompanySettings,
  type CompanySettingsFormInput,
} from '../types/company.types'
import { DEFAULT_CURRENCY } from '../config/currency.config'
import { getActiveCompanyIdSync } from '../utils/company-context.utils'

const MOCK_DELAY_MS = 350

const DEFAULT_SETTINGS_BY_COMPANY: Record<string, Omit<CompanySettings, 'id'>> = {
  'co-1': {
    name: 'SmartHR Inc.',
    legalName: 'SmartHR Technologies LLC',
    logoUrl: undefined,
    email: 'contact@smarthr.com',
    phone: '+1 555-0100',
    website: 'https://smarthr.com',
    address: {
      line1: '100 Market Street',
      line2: 'Suite 500',
      city: 'San Francisco',
      state: 'CA',
      postalCode: '94105',
      country: 'United States',
    },
    timezone: 'America/New_York',
    currency: DEFAULT_CURRENCY,
    dateFormat: 'MDY',
    timeFormat: '12h',
    fiscalYearStartMonth: 1,
    workWeek: 'mon_fri',
    standardWorkHours: 8,
    defaultProbationDays: 90,
    notifications: {
      leaveRequests: true,
      expenseClaims: true,
      ticketUpdates: true,
      payrollProcessed: true,
    },
    updatedAt: '2026-01-15',
    updatedBy: { id: 'usr-super-1', name: 'Super Admin' },
  },
  'co-2': {
    name: 'Acme Corp',
    legalName: 'Acme Corporation Ltd.',
    logoUrl: undefined,
    email: 'hello@acme.com',
    phone: '+1 555-0200',
    website: 'https://acme.com',
    address: {
      line1: '42 Industrial Way',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      country: 'United States',
    },
    timezone: 'America/Chicago',
    currency: DEFAULT_CURRENCY,
    dateFormat: 'MDY',
    timeFormat: '12h',
    fiscalYearStartMonth: 4,
    workWeek: 'mon_fri',
    standardWorkHours: 8,
    defaultProbationDays: 60,
    notifications: {
      leaveRequests: true,
      expenseClaims: true,
      ticketUpdates: false,
      payrollProcessed: true,
    },
    updatedAt: '2026-03-01',
    updatedBy: { id: 'usr-super-1', name: 'Super Admin' },
  },
}

let companySettingsStore: Record<string, CompanySettings> = Object.fromEntries(
  Object.entries(DEFAULT_SETTINGS_BY_COMPANY).map(([id, settings]) => [
    id,
    CompanySettingsSchema.parse({ id, ...settings }),
  ]),
)

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function resolveCompanyId(companyId?: string): string {
  return companyId ?? getActiveCompanyIdSync()
}

function getSettingsOrThrow(companyId: string): CompanySettings {
  const settings = companySettingsStore[companyId]
  if (!settings) {
    throw new Error('Company settings not found')
  }
  return settings
}

function formToSettings(data: CompanySettingsFormInput): Omit<
  CompanySettings,
  'id' | 'logoUrl' | 'updatedAt' | 'updatedBy'
> {
  return {
    name: data.name,
    legalName: data.legalName || undefined,
    email: data.email,
    phone: data.phone || undefined,
    website: data.website || undefined,
    address: {
      line1: data.addressLine1,
      line2: data.addressLine2 || undefined,
      city: data.city,
      state: data.state || undefined,
      postalCode: data.postalCode,
      country: data.country,
    },
    timezone: data.timezone,
    currency: data.currency,
    dateFormat: data.dateFormat,
    timeFormat: data.timeFormat,
    fiscalYearStartMonth: data.fiscalYearStartMonth,
    workWeek: data.workWeek,
    standardWorkHours: data.standardWorkHours,
    defaultProbationDays: data.defaultProbationDays,
    notifications: {
      leaveRequests: data.notificationsLeaveRequests,
      expenseClaims: data.notificationsExpenseClaims,
      ticketUpdates: data.notificationsTicketUpdates,
      payrollProcessed: data.notificationsPayrollProcessed,
    },
  }
}

export function createDefaultCompanySettings(companyId: string, name: string): CompanySettings {
  const settings = CompanySettingsSchema.parse({
    id: companyId,
    name,
    email: `contact@${name.toLowerCase().replace(/\s+/g, '')}.com`,
    address: {
      line1: '1 Main Street',
      city: 'New York',
      postalCode: '10001',
      country: 'United States',
    },
    timezone: 'America/New_York',
    currency: DEFAULT_CURRENCY,
    dateFormat: 'MDY',
    timeFormat: '12h',
    fiscalYearStartMonth: 1,
    workWeek: 'mon_fri',
    standardWorkHours: 8,
    defaultProbationDays: 90,
    notifications: {
      leaveRequests: true,
      expenseClaims: true,
      ticketUpdates: true,
      payrollProcessed: true,
    },
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy: { id: 'system', name: 'System' },
  })
  companySettingsStore[companyId] = settings
  return settings
}

export async function getCompanySettings(companyId?: string): Promise<CompanySettings> {
  await delay()
  return getSettingsOrThrow(resolveCompanyId(companyId))
}

export function getCompanySettingsSnapshot(companyId?: string): CompanySettings {
  return getSettingsOrThrow(resolveCompanyId(companyId))
}

export async function updateCompanySettings(
  data: CompanySettingsFormInput,
  updatedBy: { id: string; name: string } = { id: 'usr-super-1', name: 'Super Admin' },
  companyId?: string,
): Promise<CompanySettings> {
  await delay()
  const id = resolveCompanyId(companyId)
  const current = getSettingsOrThrow(id)
  companySettingsStore[id] = CompanySettingsSchema.parse({
    ...current,
    ...formToSettings(data),
    updatedAt: new Date().toISOString().split('T')[0],
    updatedBy,
  })
  return companySettingsStore[id]
}

export async function uploadCompanyLogo(
  file: File,
  companyId?: string,
): Promise<{ logoUrl: string }> {
  await delay(200)
  const id = resolveCompanyId(companyId)
  const current = getSettingsOrThrow(id)
  const logoUrl = URL.createObjectURL(file)
  companySettingsStore[id] = CompanySettingsSchema.parse({
    ...current,
    logoUrl,
    updatedAt: new Date().toISOString().split('T')[0],
  })
  return { logoUrl }
}

export async function removeCompanyLogo(companyId?: string): Promise<CompanySettings> {
  await delay(200)
  const id = resolveCompanyId(companyId)
  const current = getSettingsOrThrow(id)
  companySettingsStore[id] = CompanySettingsSchema.parse({
    ...current,
    logoUrl: undefined,
    updatedAt: new Date().toISOString().split('T')[0],
  })
  return companySettingsStore[id]
}
