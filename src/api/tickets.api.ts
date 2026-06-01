import {
  TicketCommentSchema,
  TicketDetailSchema,
  TicketListResponseSchema,
  TicketSchema,
  type AddCommentFormInput,
  type CreateTicketFormInput,
  type Ticket,
  type TicketCategory,
  type TicketComment,
  type TicketDetail,
  type TicketPriority,
  type TicketStatus,
  type UpdateTicketFormInput,
} from '../types/ticket.types'
import { getAdminAssigneeOptions, getAllEmployeesForPayroll } from './employees.api'

const MOCK_DELAY_MS = 350

interface TicketRecord {
  ticket: Ticket
  comments: TicketComment[]
}

let ticketStore: TicketRecord[] = []
let nextTicketId = 1
let nextTicketNumber = 1
let nextCommentId = 1

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function formatTicketNumber(n: number): string {
  return `TKT-${String(n).padStart(4, '0')}`
}

function toTicketDetail(record: TicketRecord, includeInternal: boolean): TicketDetail {
  const comments = includeInternal
    ? record.comments
    : record.comments.filter((c) => !c.isInternal)

  return TicketDetailSchema.parse({
    ...record.ticket,
    commentsCount: comments.length,
    comments: [...comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  })
}

function syncTicketMeta(record: TicketRecord) {
  const publicComments = record.comments.filter((c) => !c.isInternal)
  const lastComment = [...record.comments].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )[0]

  record.ticket = TicketSchema.parse({
    ...record.ticket,
    commentsCount: publicComments.length,
    lastActivityAt: lastComment?.createdAt ?? record.ticket.createdAt,
    resolvedAt:
      record.ticket.status === 'resolved' || record.ticket.status === 'closed'
        ? (record.ticket.resolvedAt ?? new Date().toISOString().split('T')[0])
        : undefined,
  })
}

function seedTickets(): TicketRecord[] {
  const employees = getAllEmployeesForPayroll('co-1')
  const jane = employees.find((e) => e.id === 'usr-employee-1') ?? employees[0]
  const sarah = employees.find((e) => e.fullName === 'Sarah Chen') ?? jane
  const michael = employees.find((e) => e.fullName === 'Michael Torres') ?? jane
  const emily = employees.find((e) => e.fullName === 'Emily Davis') ?? jane

  const seeds: Array<{
    subject: string
    description: string
    category: TicketCategory
    priority: TicketPriority
    status: TicketStatus
    creator: (typeof employees)[number]
    assignee?: { id: string; name: string; avatarUrl?: string }
    daysAgo: number
    commentAuthors: Array<{
      id: string
      name: string
      role: 'super_admin' | 'hr_admin' | 'employee'
      internal?: boolean
    }>
  }> = [
    {
      subject: 'Payroll query for May payslip',
      description:
        'I have a question about my May payslip — the PF deduction seems higher than usual. Can someone review?',
      category: 'payroll',
      priority: 'high',
      status: 'in_progress',
      creator: jane,
      assignee: { id: 'usr-admin-1', name: 'HR Admin' },
      daysAgo: 3,
      commentAuthors: [
        { id: 'usr-admin-1', name: 'HR Admin', role: 'hr_admin' },
        { id: jane.id, name: jane.fullName, role: 'employee' },
        { id: 'usr-admin-1', name: 'HR Admin', role: 'hr_admin', internal: true },
      ],
    },
    {
      subject: 'Laptop not connecting to VPN',
      description:
        'Since yesterday my laptop cannot connect to the company VPN. I have tried restarting but the issue persists.',
      category: 'it_support',
      priority: 'urgent',
      status: 'open',
      creator: sarah,
      daysAgo: 1,
      commentAuthors: [{ id: 'usr-admin-1', name: 'HR Admin', role: 'hr_admin' }],
    },
    {
      subject: 'Request for additional leave balance',
      description:
        'I would like to request clarification on my remaining annual leave balance for this year.',
      category: 'leave',
      priority: 'medium',
      status: 'resolved',
      creator: michael,
      assignee: { id: emily.id, name: emily.fullName },
      daysAgo: 10,
      commentAuthors: [
        { id: emily.id, name: emily.fullName, role: 'hr_admin' },
        { id: michael.id, name: michael.fullName, role: 'employee' },
      ],
    },
    {
      subject: 'Office AC not working on 3rd floor',
      description:
        'The air conditioning unit on the 3rd floor has been malfunctioning since Monday morning.',
      category: 'facilities',
      priority: 'medium',
      status: 'open',
      creator: jane,
      daysAgo: 2,
      commentAuthors: [],
    },
    {
      subject: 'Update my bank account details',
      description:
        'I need to update my bank account information for salary deposits. What is the process?',
      category: 'payroll',
      priority: 'medium',
      status: 'closed',
      creator: jane,
      assignee: { id: 'usr-admin-1', name: 'HR Admin' },
      daysAgo: 30,
      commentAuthors: [
        { id: 'usr-admin-1', name: 'HR Admin', role: 'hr_admin' },
        { id: jane.id, name: jane.fullName, role: 'employee' },
      ],
    },
    {
      subject: 'General inquiry about benefits',
      description:
        'Could you provide information about the health insurance benefits available to employees?',
      category: 'general',
      priority: 'low',
      status: 'open',
      creator: sarah,
      daysAgo: 5,
      commentAuthors: [],
    },
    {
      subject: 'Cannot access HR portal',
      description:
        'I am getting a 403 error when trying to access the HR self-service portal.',
      category: 'it_support',
      priority: 'high',
      status: 'in_progress',
      creator: michael,
      assignee: { id: emily.id, name: emily.fullName },
      daysAgo: 4,
      commentAuthors: [
        { id: emily.id, name: emily.fullName, role: 'hr_admin' },
        { id: emily.id, name: emily.fullName, role: 'hr_admin', internal: true },
      ],
    },
    {
      subject: 'Expense reimbursement delay',
      description:
        'My expense reimbursement from last month has not been processed yet. Please advise on the timeline.',
      category: 'payroll',
      priority: 'medium',
      status: 'resolved',
      creator: jane,
      assignee: { id: 'usr-admin-1', name: 'HR Admin' },
      daysAgo: 14,
      commentAuthors: [{ id: 'usr-admin-1', name: 'HR Admin', role: 'hr_admin' }],
    },
    {
      subject: 'Request standing desk',
      description:
        'I would like to request a standing desk for my workstation due to ergonomic concerns.',
      category: 'facilities',
      priority: 'low',
      status: 'open',
      creator: sarah,
      daysAgo: 7,
      commentAuthors: [],
    },
    {
      subject: 'Sick leave documentation',
      description: 'Where should I submit my sick leave medical certificate for last week?',
      category: 'leave',
      priority: 'medium',
      status: 'in_progress',
      creator: jane,
      assignee: { id: emily.id, name: emily.fullName },
      daysAgo: 6,
      commentAuthors: [
        { id: emily.id, name: emily.fullName, role: 'hr_admin' },
        { id: jane.id, name: jane.fullName, role: 'employee' },
      ],
    },
    {
      subject: 'Password reset not working',
      description:
        'The self-service password reset link expires immediately after I receive the email.',
      category: 'it_support',
      priority: 'high',
      status: 'closed',
      creator: michael,
      assignee: { id: 'usr-admin-1', name: 'HR Admin' },
      daysAgo: 20,
      commentAuthors: [
        { id: 'usr-admin-1', name: 'HR Admin', role: 'hr_admin' },
        { id: michael.id, name: michael.fullName, role: 'employee' },
      ],
    },
    {
      subject: 'Team offsite room booking',
      description: 'Need to book a conference room for a team offsite on June 15th for 20 people.',
      category: 'facilities',
      priority: 'medium',
      status: 'resolved',
      creator: sarah,
      daysAgo: 12,
      commentAuthors: [{ id: 'usr-admin-1', name: 'HR Admin', role: 'hr_admin' }],
    },
    {
      subject: 'Tax form W-2 correction',
      description:
        'There appears to be an error in my W-2 form. The state tax withholding amount is incorrect.',
      category: 'payroll',
      priority: 'urgent',
      status: 'open',
      creator: jane,
      daysAgo: 1,
      commentAuthors: [],
    },
    {
      subject: 'Onboarding document missing',
      description: 'I cannot find the signed offer letter in my employee documents section.',
      category: 'general',
      priority: 'low',
      status: 'in_progress',
      creator: michael,
      assignee: { id: emily.id, name: emily.fullName },
      daysAgo: 8,
      commentAuthors: [{ id: emily.id, name: emily.fullName, role: 'hr_admin' }],
    },
    {
      subject: 'Remote work equipment request',
      description: 'I need a second monitor and webcam for my home office setup.',
      category: 'it_support',
      priority: 'medium',
      status: 'open',
      creator: sarah,
      daysAgo: 3,
      commentAuthors: [],
    },
    {
      subject: 'Parental leave policy question',
      description:
        'What is the company policy on parental leave and how far in advance should I apply?',
      category: 'leave',
      priority: 'medium',
      status: 'open',
      creator: jane,
      daysAgo: 2,
      commentAuthors: [],
    },
    {
      subject: 'Parking pass renewal',
      description: 'My parking pass expires next month. How do I renew it?',
      category: 'facilities',
      priority: 'low',
      status: 'closed',
      creator: sarah,
      daysAgo: 45,
      commentAuthors: [{ id: 'usr-admin-1', name: 'HR Admin', role: 'hr_admin' }],
    },
    {
      subject: 'Other — feedback on HR portal',
      description: 'The new HR portal layout is confusing. Would love to share some UX feedback.',
      category: 'other',
      priority: 'low',
      status: 'resolved',
      creator: michael,
      daysAgo: 18,
      commentAuthors: [
        { id: 'usr-admin-1', name: 'HR Admin', role: 'hr_admin' },
        { id: michael.id, name: michael.fullName, role: 'employee' },
      ],
    },
  ]

  return seeds.map((seed) => {
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - seed.daysAgo)
    const createdAtStr = createdAt.toISOString()

    const comments: TicketComment[] = seed.commentAuthors.map((author, index) => {
      const commentDate = new Date(createdAt)
      commentDate.setHours(commentDate.getHours() + (index + 1) * 2)
      return TicketCommentSchema.parse({
        id: `cmt-${nextCommentId++}`,
        author: {
          id: author.id,
          name: author.name,
          role: author.role,
        },
        body: author.internal
          ? 'Internal note: Escalated to the relevant team for review.'
          : author.role === 'employee'
            ? 'Thank you for looking into this. Please let me know if you need any additional information.'
            : 'We have reviewed your request and are working on a resolution. We will update you shortly.',
        createdAt: commentDate.toISOString(),
        isInternal: author.internal ?? false,
      })
    })

    const lastActivity =
      [...comments].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]?.createdAt ??
      createdAtStr

    const record: TicketRecord = {
      ticket: TicketSchema.parse({
        id: `tkt-${nextTicketId++}`,
        companyId: 'co-1',
        ticketNumber: formatTicketNumber(nextTicketNumber++),
        subject: seed.subject,
        description: seed.description,
        category: seed.category,
        priority: seed.priority,
        status: seed.status,
        createdBy: {
          id: seed.creator.id,
          name: seed.creator.fullName,
          avatarUrl: seed.creator.avatarUrl,
          department: seed.creator.departmentName,
        },
        assignedTo: seed.assignee,
        commentsCount: comments.filter((c) => !c.isInternal).length,
        lastActivityAt: lastActivity,
        createdAt: createdAtStr.split('T')[0],
        resolvedAt:
          seed.status === 'resolved' || seed.status === 'closed'
            ? lastActivity.split('T')[0]
            : undefined,
      }),
      comments,
    }

    return record
  })
}

function initStore() {
  ticketStore = seedTickets()
}

initStore()

function computeStatusCounts() {
  return {
    open: ticketStore.filter((r) => r.ticket.status === 'open').length,
    inProgress: ticketStore.filter((r) => r.ticket.status === 'in_progress').length,
    resolved: ticketStore.filter((r) => r.ticket.status === 'resolved').length,
    closed: ticketStore.filter((r) => r.ticket.status === 'closed').length,
  }
}

function filterTickets(
  records: TicketRecord[],
  params?: {
    search?: string
    status?: TicketStatus
    priority?: TicketPriority
    category?: TicketCategory
    assignedToId?: string
    createdById?: string
  },
) {
  let filtered = [...records]

  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.ticket.subject.toLowerCase().includes(q) ||
        r.ticket.ticketNumber.toLowerCase().includes(q) ||
        r.ticket.createdBy.name.toLowerCase().includes(q),
    )
  }
  if (params?.status) filtered = filtered.filter((r) => r.ticket.status === params.status)
  if (params?.priority) filtered = filtered.filter((r) => r.ticket.priority === params.priority)
  if (params?.category) filtered = filtered.filter((r) => r.ticket.category === params.category)
  if (params?.createdById) {
    filtered = filtered.filter((r) => r.ticket.createdBy.id === params.createdById)
  }
  if (params?.assignedToId) {
    if (params.assignedToId === '__unassigned__') {
      filtered = filtered.filter((r) => !r.ticket.assignedTo)
    } else {
      filtered = filtered.filter((r) => r.ticket.assignedTo?.id === params.assignedToId)
    }
  }

  return filtered.sort((a, b) => b.ticket.lastActivityAt.localeCompare(a.ticket.lastActivityAt))
}

export async function getTickets(params?: {
  search?: string
  status?: TicketStatus
  priority?: TicketPriority
  category?: TicketCategory
  assignedToId?: string
  page?: number
  perPage?: number
}) {
  await delay()
  const filtered = filterTickets(ticketStore, params)
  const page = params?.page ?? 1
  const perPage = params?.perPage ?? 20
  const total = filtered.length

  return TicketListResponseSchema.parse({
    data: filtered.slice((page - 1) * perPage, page * perPage).map((r) => r.ticket),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    statusCounts: computeStatusCounts(),
  })
}

export async function getMyTickets(
  userId: string,
  params?: { status?: TicketStatus; page?: number; perPage?: number },
) {
  await delay()
  const filtered = filterTickets(ticketStore, {
    status: params?.status,
    createdById: userId,
  })
  const page = params?.page ?? 1
  const perPage = params?.perPage ?? 20
  const total = filtered.length

  return TicketListResponseSchema.parse({
    data: filtered.slice((page - 1) * perPage, page * perPage).map((r) => r.ticket),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    statusCounts: computeStatusCounts(),
  })
}

export async function getTicket(
  id: string,
  options?: { includeInternal?: boolean },
): Promise<TicketDetail> {
  await delay()
  const record = ticketStore.find((r) => r.ticket.id === id)
  if (!record) throw new Error('Ticket not found')
  return toTicketDetail(record, options?.includeInternal ?? false)
}

export function canAccessTicket(ticketId: string, userId: string, isAdmin: boolean): boolean {
  if (isAdmin) return true
  const record = ticketStore.find((r) => r.ticket.id === ticketId)
  return record?.ticket.createdBy.id === userId
}

export async function createTicket(
  userId: string,
  data: CreateTicketFormInput,
): Promise<Ticket> {
  await delay()
  const employee = getAllEmployeesForPayroll().find((e) => e.id === userId)
  if (!employee) throw new Error('Employee not found')

  const now = new Date().toISOString()
  const record: TicketRecord = {
    ticket: TicketSchema.parse({
      id: `tkt-${nextTicketId++}`,
      companyId: employee.companyId,
      ticketNumber: formatTicketNumber(nextTicketNumber++),
      subject: data.subject,
      description: data.description,
      category: data.category,
      priority: data.priority,
      status: 'open',
      createdBy: {
        id: employee.id,
        name: employee.fullName,
        avatarUrl: employee.avatarUrl,
        department: employee.departmentName,
      },
      commentsCount: 0,
      lastActivityAt: now,
      createdAt: now.split('T')[0],
    }),
    comments: [],
  }

  ticketStore.unshift(record)
  return record.ticket
}

export async function updateTicket(
  id: string,
  data: UpdateTicketFormInput,
  options?: { includeInternal?: boolean },
): Promise<TicketDetail> {
  await delay()
  const index = ticketStore.findIndex((r) => r.ticket.id === id)
  if (index === -1) throw new Error('Ticket not found')

  const record = ticketStore[index]
  let assignedTo = record.ticket.assignedTo

  if (data.assignedToId !== undefined) {
    if (data.assignedToId === '') {
      assignedTo = undefined
    } else {
      const assignee = getAdminAssigneeOptions().find((a) => a.id === data.assignedToId)
      if (!assignee) throw new Error('Assignee not found')
      assignedTo = { id: assignee.id, name: assignee.name, avatarUrl: assignee.avatarUrl }
    }
  }

  const newStatus = data.status ?? record.ticket.status
  record.ticket = TicketSchema.parse({
    ...record.ticket,
    status: newStatus,
    priority: data.priority ?? record.ticket.priority,
    assignedTo,
    resolvedAt:
      newStatus === 'resolved' || newStatus === 'closed'
        ? (record.ticket.resolvedAt ?? new Date().toISOString().split('T')[0])
        : undefined,
  })

  syncTicketMeta(record)
  return toTicketDetail(record, options?.includeInternal ?? false)
}

export async function addComment(
  ticketId: string,
  author: {
    id: string
    name: string
    role: 'super_admin' | 'hr_admin' | 'employee'
    avatarUrl?: string
  },
  data: AddCommentFormInput,
  options?: { includeInternal?: boolean },
): Promise<TicketComment> {
  await delay()
  const record = ticketStore.find((r) => r.ticket.id === ticketId)
  if (!record) throw new Error('Ticket not found')
  if (record.ticket.status === 'closed') throw new Error('Cannot comment on closed ticket')

  const comment = TicketCommentSchema.parse({
    id: `cmt-${nextCommentId++}`,
    author: {
      id: author.id,
      name: author.name,
      avatarUrl: author.avatarUrl,
      role: author.role,
    },
    body: data.body,
    createdAt: new Date().toISOString(),
    isInternal: data.isInternal,
  })

  record.comments.push(comment)
  record.ticket = TicketSchema.parse({
    ...record.ticket,
    lastActivityAt: comment.createdAt,
  })
  syncTicketMeta(record)

  void options
  return comment
}

export async function closeTicket(
  id: string,
  options?: { includeInternal?: boolean },
): Promise<TicketDetail> {
  const record = ticketStore.find((r) => r.ticket.id === id)
  if (!record) throw new Error('Ticket not found')
  if (record.ticket.status !== 'resolved') {
    throw new Error('Ticket must be resolved before closing')
  }
  return updateTicket(id, { status: 'closed' }, options)
}

export async function reopenTicket(
  id: string,
  options?: { includeInternal?: boolean },
): Promise<TicketDetail> {
  return updateTicket(id, { status: 'open' }, options)
}

export async function getAssigneeOptions(): Promise<
  Array<{ id: string; name: string; avatarUrl?: string }>
> {
  await delay(150)
  return getAdminAssigneeOptions()
}
