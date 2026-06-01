import { z } from 'zod'

export type BankAccountType = 'checking' | 'savings'
export type BankAccountStatus = 'active' | 'inactive' | 'pending_verification'

export const BankAccountSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  employee: z.object({
    id: z.string(),
    employeeId: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
  }),
  accountHolderName: z.string(),
  bankName: z.string(),
  accountType: z.enum(['checking', 'savings']),
  accountNumberMasked: z.string(),
  routingNumber: z.string(),
  isPrimary: z.boolean(),
  status: z.enum(['active', 'inactive', 'pending_verification']),
  verifiedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const BankAccountFormSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  accountHolderName: z.string().min(1, 'Account holder name is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  accountType: z.enum(['checking', 'savings']),
  accountNumber: z.string().min(4, 'Account number must be at least 4 digits'),
  routingNumber: z.string().regex(/^\d{9}$/, 'Routing number must be 9 digits'),
  isPrimary: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'pending_verification']).optional(),
})

export const BankAccountUpdateFormSchema = BankAccountFormSchema.partial({
  employeeId: true,
  accountNumber: true,
}).extend({
  accountNumber: z.string().min(4, 'Account number must be at least 4 digits').optional().or(z.literal('')),
})

export const BankAccountListResponseSchema = z.object({
  data: z.array(BankAccountSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})

export type BankAccount = z.infer<typeof BankAccountSchema>
export type BankAccountFormInput = z.infer<typeof BankAccountFormSchema>
export type BankAccountUpdateFormInput = z.infer<typeof BankAccountUpdateFormSchema>
export type BankAccountListResponse = z.infer<typeof BankAccountListResponseSchema>

export const ACCOUNT_TYPE_LABELS: Record<BankAccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
}

export const ACCOUNT_STATUS_LABELS: Record<BankAccountStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending_verification: 'Pending Verification',
}

export function formatDepositAccount(account: BankAccount | null | undefined): string {
  if (!account) return 'Not configured'
  const type = ACCOUNT_TYPE_LABELS[account.accountType]
  const last4 = account.accountNumberMasked.replace(/^\*+/, '')
  return `${account.bankName} ${type} ****${last4}`
}
