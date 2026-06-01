import { z } from 'zod'
import { DEFAULT_CURRENCY } from '../config/currency.config'

export type PayFrequency = 'monthly' | 'bi_weekly' | 'weekly'
export type PayslipStatus = 'draft' | 'processed' | 'paid'
export type PfContributionStatus = 'active' | 'paused' | 'closed'

export const SalaryComponentSchema = z.object({
  id: z.string(),
  label: z.string(),
  amount: z.number(),
  type: z.enum(['earning', 'deduction']),
})
export type SalaryComponent = z.infer<typeof SalaryComponentSchema>

export const EmployeeSalarySchema = z.object({
  id: z.string(),
  companyId: z.string(),
  employee: z.object({
    id: z.string(),
    employeeId: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
    departmentId: z.string(),
    designation: z.string(),
  }),
  baseSalary: z.number(),
  components: z.array(SalaryComponentSchema),
  grossSalary: z.number(),
  totalDeductions: z.number(),
  netSalary: z.number(),
  payFrequency: z.enum(['monthly', 'bi_weekly', 'weekly']),
  effectiveFrom: z.string(),
  bankAccountLast4: z.string().optional(),
  currency: z.string().default(DEFAULT_CURRENCY),
  updatedAt: z.string(),
})
export type EmployeeSalary = z.infer<typeof EmployeeSalarySchema>

export const SalaryFormSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  baseSalary: z.number().min(0, 'Base salary must be positive'),
  payFrequency: z.enum(['monthly', 'bi_weekly', 'weekly']),
  effectiveFrom: z.string().min(1, 'Effective date is required'),
  bankAccountLast4: z.string().optional(),
  components: z.array(
    z.object({
      label: z.string().min(1, 'Label is required'),
      amount: z.number().min(0),
      type: z.enum(['earning', 'deduction']),
    }),
  ),
})
export type SalaryFormInput = z.infer<typeof SalaryFormSchema>

export const PayslipSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  employee: z.object({
    id: z.string(),
    employeeId: z.string(),
    name: z.string(),
    department: z.string(),
    departmentId: z.string(),
    designation: z.string(),
  }),
  payPeriod: z.object({
    month: z.number(),
    year: z.number(),
    label: z.string(),
  }),
  baseSalary: z.number(),
  earnings: z.array(SalaryComponentSchema),
  deductions: z.array(SalaryComponentSchema),
  grossPay: z.number(),
  totalDeductions: z.number(),
  netPay: z.number(),
  pfEmployeeContribution: z.number(),
  pfEmployerContribution: z.number(),
  status: z.enum(['draft', 'processed', 'paid']),
  paymentDate: z.string().nullable(),
  generatedAt: z.string(),
})
export type Payslip = z.infer<typeof PayslipSchema>

export const ProvidentFundRecordSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  employee: z.object({
    id: z.string(),
    employeeId: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
    departmentId: z.string(),
  }),
  employeeContributionRate: z.number(),
  employerContributionRate: z.number(),
  employeeContributionAmount: z.number(),
  employerContributionAmount: z.number(),
  totalBalance: z.number(),
  status: z.enum(['active', 'paused', 'closed']),
  enrolledDate: z.string(),
  lastContributionDate: z.string().optional(),
})
export type ProvidentFundRecord = z.infer<typeof ProvidentFundRecordSchema>

export const ProvidentFundSummarySchema = z.object({
  totalEmployees: z.number(),
  activeAccounts: z.number(),
  totalEmployeeContributions: z.number(),
  totalEmployerContributions: z.number(),
  totalFundBalance: z.number(),
})
export type ProvidentFundSummary = z.infer<typeof ProvidentFundSummarySchema>

export const PfSettingsFormSchema = z.object({
  defaultEmployeeRate: z.number().min(0).max(100),
  defaultEmployerRate: z.number().min(0).max(100),
})
export type PfSettingsFormInput = z.infer<typeof PfSettingsFormSchema>

export const SalaryListResponseSchema = z.object({
  data: z.array(EmployeeSalarySchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})
export type SalaryListResponse = z.infer<typeof SalaryListResponseSchema>

export const PayslipListResponseSchema = z.object({
  data: z.array(PayslipSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})
export type PayslipListResponse = z.infer<typeof PayslipListResponseSchema>

export const PfListResponseSchema = z.object({
  data: z.array(ProvidentFundRecordSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
  summary: ProvidentFundSummarySchema,
})
export type PfListResponse = z.infer<typeof PfListResponseSchema>

export const PAY_FREQUENCY_LABELS: Record<PayFrequency, string> = {
  monthly: 'Monthly',
  bi_weekly: 'Bi-weekly',
  weekly: 'Weekly',
}
