import { z } from 'zod'

export const DepartmentSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  headEmployee: z
    .object({
      id: z.string(),
      name: z.string(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
  employeeCount: z.number(),
  createdAt: z.string(),
})
export type Department = z.infer<typeof DepartmentSchema>

export const DepartmentFormSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  description: z.string().optional(),
  headEmployeeId: z.string().optional(),
})
export type DepartmentFormInput = z.infer<typeof DepartmentFormSchema>
