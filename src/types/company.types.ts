import { z } from 'zod'
import { DEFAULT_CURRENCY } from '../config/currency.config'

export type WorkWeek = 'mon_fri' | 'mon_sat' | 'custom'
export type DateFormat = 'MDY' | 'DMY' | 'YMD'
export type TimeFormat = '12h' | '24h'

export const CompanySettingsSchema = z.object({
  id: z.string(),
  name: z.string(),
  legalName: z.string().optional(),
  logoUrl: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.object({
    line1: z.string(),
    line2: z.string().optional(),
    city: z.string(),
    state: z.string().optional(),
    postalCode: z.string(),
    country: z.string(),
  }),
  timezone: z.string(),
  currency: z.string().default(DEFAULT_CURRENCY),
  dateFormat: z.enum(['MDY', 'DMY', 'YMD']),
  timeFormat: z.enum(['12h', '24h']),
  fiscalYearStartMonth: z.number().min(1).max(12),
  workWeek: z.enum(['mon_fri', 'mon_sat', 'custom']),
  standardWorkHours: z.number().min(1).max(24),
  defaultProbationDays: z.number().min(0),
  notifications: z.object({
    leaveRequests: z.boolean(),
    expenseClaims: z.boolean(),
    ticketUpdates: z.boolean(),
    payrollProcessed: z.boolean(),
  }),
  updatedAt: z.string(),
  updatedBy: z.object({ id: z.string(), name: z.string() }),
})
export type CompanySettings = z.infer<typeof CompanySettingsSchema>

export const CompanySettingsFormSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  legalName: z.string().optional(),
  email: z.string().email('Invalid email'),
  phone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  timezone: z.string().min(1, 'Timezone is required'),
  currency: z.string().min(1, 'Currency is required'),
  dateFormat: z.enum(['MDY', 'DMY', 'YMD']),
  timeFormat: z.enum(['12h', '24h']),
  fiscalYearStartMonth: z.number().min(1).max(12),
  workWeek: z.enum(['mon_fri', 'mon_sat', 'custom']),
  standardWorkHours: z.number().min(1).max(24),
  defaultProbationDays: z.number().min(0),
  notificationsLeaveRequests: z.boolean(),
  notificationsExpenseClaims: z.boolean(),
  notificationsTicketUpdates: z.boolean(),
  notificationsPayrollProcessed: z.boolean(),
})
export type CompanySettingsFormInput = z.infer<typeof CompanySettingsFormSchema>

export const TIMEZONE_OPTIONS = [
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Central European Time' },
  { value: 'Asia/Kolkata', label: 'India Standard Time' },
  { value: 'Asia/Singapore', label: 'Singapore Time' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time' },
  { value: 'UTC', label: 'UTC' },
] as const

export const CURRENCY_OPTIONS = [
  { value: 'PHP', label: 'PHP — Philippine Peso' },
  { value: 'USD', label: 'USD — US Dollar' },
  { value: 'EUR', label: 'EUR — Euro' },
  { value: 'GBP', label: 'GBP — British Pound' },
  { value: 'INR', label: 'INR — Indian Rupee' },
  { value: 'AUD', label: 'AUD — Australian Dollar' },
  { value: 'CAD', label: 'CAD — Canadian Dollar' },
  { value: 'SGD', label: 'SGD — Singapore Dollar' },
] as const

export const MONTH_OPTIONS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export function settingsToForm(settings: CompanySettings): CompanySettingsFormInput {
  return {
    name: settings.name,
    legalName: settings.legalName ?? '',
    email: settings.email,
    phone: settings.phone ?? '',
    website: settings.website ?? '',
    addressLine1: settings.address.line1,
    addressLine2: settings.address.line2 ?? '',
    city: settings.address.city,
    state: settings.address.state ?? '',
    postalCode: settings.address.postalCode,
    country: settings.address.country,
    timezone: settings.timezone,
    currency: settings.currency,
    dateFormat: settings.dateFormat,
    timeFormat: settings.timeFormat,
    fiscalYearStartMonth: settings.fiscalYearStartMonth,
    workWeek: settings.workWeek,
    standardWorkHours: settings.standardWorkHours,
    defaultProbationDays: settings.defaultProbationDays,
    notificationsLeaveRequests: settings.notifications.leaveRequests,
    notificationsExpenseClaims: settings.notifications.expenseClaims,
    notificationsTicketUpdates: settings.notifications.ticketUpdates,
    notificationsPayrollProcessed: settings.notifications.payrollProcessed,
  }
}
