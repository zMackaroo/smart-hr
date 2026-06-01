import { z } from 'zod'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'
export type TicketCategory =
  | 'general'
  | 'payroll'
  | 'leave'
  | 'it_support'
  | 'facilities'
  | 'other'

export const TicketCommentSchema = z.object({
  id: z.string(),
  author: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    role: z.enum(['super_admin', 'hr_admin', 'employee']),
  }),
  body: z.string(),
  createdAt: z.string(),
  isInternal: z.boolean().default(false),
})
export type TicketComment = z.infer<typeof TicketCommentSchema>

export const TicketSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  ticketNumber: z.string(),
  subject: z.string(),
  description: z.string(),
  category: z.enum(['general', 'payroll', 'leave', 'it_support', 'facilities', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
  createdBy: z.object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().optional(),
    department: z.string(),
  }),
  assignedTo: z
    .object({
      id: z.string(),
      name: z.string(),
      avatarUrl: z.string().optional(),
    })
    .optional(),
  commentsCount: z.number(),
  lastActivityAt: z.string(),
  createdAt: z.string(),
  resolvedAt: z.string().optional(),
})
export type Ticket = z.infer<typeof TicketSchema>

export const TicketDetailSchema = TicketSchema.extend({
  comments: z.array(TicketCommentSchema),
})
export type TicketDetail = z.infer<typeof TicketDetailSchema>

export const CreateTicketFormSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['general', 'payroll', 'leave', 'it_support', 'facilities', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
})
export type CreateTicketFormInput = z.infer<typeof CreateTicketFormSchema>

export const AddCommentFormSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty'),
  isInternal: z.boolean(),
})
export type AddCommentFormInput = z.infer<typeof AddCommentFormSchema>

export const UpdateTicketFormSchema = z.object({
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  assignedToId: z.string().optional(),
})
export type UpdateTicketFormInput = z.infer<typeof UpdateTicketFormSchema>

export const TicketListResponseSchema = z.object({
  data: z.array(TicketSchema),
  total: z.number(),
  page: z.number(),
  perPage: z.number(),
  totalPages: z.number(),
  statusCounts: z.object({
    open: z.number(),
    inProgress: z.number(),
    resolved: z.number(),
    closed: z.number(),
  }),
})

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  general: 'General',
  payroll: 'Payroll',
  leave: 'Leave',
  it_support: 'IT Support',
  facilities: 'Facilities',
  other: 'Other',
}
