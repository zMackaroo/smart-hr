import { z } from 'zod'

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export const LeaveTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  defaultDays: z.number(),
  carryForward: z.boolean(),
  requiresDocument: z.boolean(),
  isActive: z.boolean(),
})
export type LeaveType = z.infer<typeof LeaveTypeSchema>

export const LeaveTypeFormSchema = z.object({
  name: z.string().min(1, 'Leave type name is required'),
  color: z.string().min(1, 'Color is required'),
  defaultDays: z.number().min(0, 'Days must be 0 or more'),
  carryForward: z.boolean(),
  requiresDocument: z.boolean(),
  isActive: z.boolean(),
})
export type LeaveTypeFormInput = z.infer<typeof LeaveTypeFormSchema>

export const LeaveBalanceSchema = z.object({
  leaveTypeId: z.string(),
  leaveTypeName: z.string(),
  color: z.string(),
  allocated: z.number(),
  used: z.number(),
  pending: z.number(),
  remaining: z.number(),
})
export type LeaveBalance = z.infer<typeof LeaveBalanceSchema>

export const LeaveRequestSchema = z.object({
  id: z.string(),
  employee: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
  }),
  leaveType: z.object({ id: z.string(), name: z.string(), color: z.string() }),
  fromDate: z.string(),
  toDate: z.string(),
  days: z.number(),
  reason: z.string(),
  status: z.enum(['pending', 'approved', 'rejected', 'cancelled']),
  appliedOn: z.string(),
  approvedBy: z.object({ id: z.string(), name: z.string() }).optional(),
  approvedOn: z.string().optional(),
  rejectionReason: z.string().optional(),
  documentUrl: z.string().optional(),
})
export type LeaveRequest = z.infer<typeof LeaveRequestSchema>

export const ApplyLeaveFormSchema = z
  .object({
    leaveTypeId: z.string().min(1, 'Leave type is required'),
    fromDate: z.string().min(1, 'From date is required'),
    toDate: z.string().min(1, 'To date is required'),
    reason: z.string().min(5, 'Please provide a reason (min 5 characters)'),
    document: z.instanceof(File).optional(),
  })
  .refine((d) => new Date(d.toDate) >= new Date(d.fromDate), {
    message: 'To date must be on or after from date',
    path: ['toDate'],
  })
export type ApplyLeaveFormInput = z.infer<typeof ApplyLeaveFormSchema>

export const RejectLeaveFormSchema = z.object({
  reason: z.string().min(5, 'Rejection reason is required'),
})
export type RejectLeaveFormInput = z.infer<typeof RejectLeaveFormSchema>

export const LeaveRequestListResponseSchema = z.object({
  data: z.array(LeaveRequestSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
})
export type LeaveRequestListResponse = z.infer<typeof LeaveRequestListResponseSchema>
