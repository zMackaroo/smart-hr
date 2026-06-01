import { z } from 'zod'

export const DesignationSchema = z.object({
  id: z.string(),
  name: z.string(),
  department: z.object({ id: z.string(), name: z.string() }).optional(),
  employeeCount: z.number(),
  createdAt: z.string(),
})
export type Designation = z.infer<typeof DesignationSchema>

export const DesignationFormSchema = z.object({
  name: z.string().min(1, 'Designation name is required'),
  departmentId: z.string().optional(),
})
export type DesignationFormInput = z.infer<typeof DesignationFormSchema>
