import { z } from 'zod'

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated'

export const EmployeeSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  department: z.object({ id: z.string(), name: z.string() }),
  designation: z.object({ id: z.string(), name: z.string() }),
  role: z.enum(['super_admin', 'hr_admin', 'employee']),
  status: z.enum(['active', 'inactive', 'on_leave', 'terminated']),
  joinDate: z.string(),
  managerId: z.string().optional(),
  managerName: z.string().optional(),
  location: z.string().optional(),
})
export type Employee = z.infer<typeof EmployeeSchema>

export const EmployeeDetailSchema = EmployeeSchema.extend({
  personal: z.object({
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
    nationality: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    emergencyContact: z
      .object({
        name: z.string(),
        relationship: z.string(),
        phone: z.string(),
      })
      .optional(),
  }),
  work: z.object({
    employeeType: z.enum(['full_time', 'part_time', 'contract', 'intern']),
    workLocation: z.enum(['office', 'remote', 'hybrid']),
    probationEndDate: z.string().optional(),
    reportingManager: z.object({ id: z.string(), name: z.string() }).optional(),
    shift: z.string().optional(),
  }),
  documents: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
      uploadedAt: z.string(),
      url: z.string(),
    }),
  ),
  assets: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      assetId: z.string(),
      category: z.string(),
      assignedDate: z.string(),
      status: z.enum(['assigned', 'returned', 'damaged']),
    }),
  ),
  timeline: z.array(
    z.object({
      id: z.string(),
      event: z.string(),
      description: z.string().optional(),
      date: z.string(),
      type: z.enum(['joined', 'promoted', 'transferred', 'left', 'other']),
    }),
  ),
})
export type EmployeeDetail = z.infer<typeof EmployeeDetailSchema>

export const EmployeeFormSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email(),
  phone: z.string().optional(),
  departmentId: z.string().min(1, 'Required'),
  designationId: z.string().min(1, 'Required'),
  role: z.enum(['hr_admin', 'employee']),
  joinDate: z.string().min(1, 'Required'),
  location: z.string().optional(),
  managerId: z.string().optional(),
})
export type EmployeeFormInput = z.infer<typeof EmployeeFormSchema>

export const EmployeeListResponseSchema = z.object({
  data: z.array(EmployeeSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})
export type EmployeeListResponse = z.infer<typeof EmployeeListResponseSchema>

export interface DepartmentOption {
  id: string
  name: string
}

export interface DesignationOption {
  id: string
  name: string
  departmentId?: string
}
