import { z } from 'zod'
import { DEFAULT_CURRENCY } from '../config/currency.config'

export type ExpenseStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'reimbursed'
  | 'cancelled'

export type ExpenseCategory =
  | 'travel'
  | 'meals'
  | 'supplies'
  | 'accommodation'
  | 'transport'
  | 'other'

export const EXPENSE_CATEGORIES = [
  'travel',
  'meals',
  'supplies',
  'accommodation',
  'transport',
  'other',
] as const satisfies readonly ExpenseCategory[]

export const ExpenseClaimSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  claimNumber: z.string(),
  employee: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
    employeeId: z.string(),
  }),
  category: z.enum(EXPENSE_CATEGORIES),
  title: z.string(),
  description: z.string().optional(),
  amount: z.number(),
  currency: z.string().default(DEFAULT_CURRENCY),
  expenseDate: z.string(),
  receiptUrl: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'reimbursed', 'cancelled']),
  submittedDate: z.string(),
  reviewedBy: z.object({ id: z.string(), name: z.string() }).optional(),
  reviewedDate: z.string().optional(),
  rejectionReason: z.string().optional(),
  reimbursedDate: z.string().optional(),
})

export const SubmitExpenseFormSchema = z
  .object({
    category: z.enum(EXPENSE_CATEGORIES),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    amount: z
      .number({ error: 'Amount is required' })
      .min(0.01, 'Amount must be greater than 0'),
    expenseDate: z.string().min(1, 'Expense date is required'),
    receipt: z.instanceof(File).optional(),
  })
  .refine((data) => new Date(data.expenseDate) <= new Date(), {
    message: 'Expense date cannot be in the future',
    path: ['expenseDate'],
  })

export const RejectExpenseFormSchema = z.object({
  reason: z.string().min(5, 'Rejection reason is required'),
})

export const ExpenseListSummarySchema = z.object({
  pending: z.number(),
  approved: z.number(),
  rejected: z.number(),
  reimbursed: z.number(),
  pendingAmount: z.number(),
})

export const ExpenseListResponseSchema = z.object({
  data: z.array(ExpenseClaimSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
  summary: ExpenseListSummarySchema,
})

export type ExpenseClaim = z.infer<typeof ExpenseClaimSchema>
export type SubmitExpenseFormInput = z.infer<typeof SubmitExpenseFormSchema>
export type RejectExpenseFormInput = z.infer<typeof RejectExpenseFormSchema>
export type ExpenseListResponse = z.infer<typeof ExpenseListResponseSchema>
export type ExpenseListSummary = z.infer<typeof ExpenseListSummarySchema>

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  travel: 'Travel',
  meals: 'Meals',
  supplies: 'Supplies',
  accommodation: 'Accommodation',
  transport: 'Transport',
  other: 'Other',
}

export const STATUS_LABELS: Record<ExpenseStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  reimbursed: 'Reimbursed',
  cancelled: 'Cancelled',
}
