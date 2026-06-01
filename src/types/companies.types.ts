import { z } from 'zod'

export type CompanyStatus = 'active' | 'inactive'
export type CompanyPlan = 'starter' | 'professional' | 'enterprise'

export const CompanySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: z.enum(['active', 'inactive']),
  plan: z.enum(['starter', 'professional', 'enterprise']),
  createdAt: z.string(),
})
export type Company = z.infer<typeof CompanySchema>

export const CompanyFormSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  slug: z
    .string()
    .min(2, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  plan: z.enum(['starter', 'professional', 'enterprise']),
  status: z.enum(['active', 'inactive']).default('active'),
})
export type CompanyFormInput = z.infer<typeof CompanyFormSchema>

export const CompanyListResponseSchema = z.object({
  data: z.array(CompanySchema),
  total: z.number(),
})
export type CompanyListResponse = z.infer<typeof CompanyListResponseSchema>

export const PLAN_LABELS: Record<CompanyPlan, string> = {
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
}

export const STATUS_LABELS: Record<CompanyStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
}
