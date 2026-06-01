import {
  eachDayOfInterval,
  isWeekend,
  parseISO,
} from 'date-fns'
import {
  LeaveBalanceSchema,
  LeaveRequestListResponseSchema,
  LeaveRequestSchema,
  LeaveTypeSchema,
  type ApplyLeaveFormInput,
  type LeaveBalance,
  type LeaveRequest,
  type LeaveRequestListResponse,
  type LeaveStatus,
  type LeaveType,
  type LeaveTypeFormInput,
} from '../types/leave.types'
import { getAllEmployeesForAttendance } from './employees.api'

const MOCK_DELAY_MS = 350

let leaveTypeStore: LeaveType[] = [
  {
    id: 'lt-1',
    name: 'Annual Leave',
    color: '#00D68F',
    defaultDays: 18,
    carryForward: true,
    requiresDocument: false,
    isActive: true,
  },
  {
    id: 'lt-2',
    name: 'Sick Leave',
    color: '#FF4C61',
    defaultDays: 10,
    carryForward: false,
    requiresDocument: true,
    isActive: true,
  },
  {
    id: 'lt-3',
    name: 'Casual Leave',
    color: '#2196F3',
    defaultDays: 8,
    carryForward: false,
    requiresDocument: false,
    isActive: true,
  },
  {
    id: 'lt-4',
    name: 'Maternity Leave',
    color: '#FF902F',
    defaultDays: 90,
    carryForward: false,
    requiresDocument: true,
    isActive: true,
  },
  {
    id: 'lt-5',
    name: 'Unpaid Leave',
    color: '#6E82A0',
    defaultDays: 0,
    carryForward: false,
    requiresDocument: false,
    isActive: true,
  },
]

function createSeedRequests(): LeaveRequest[] {
  const employees = getAllEmployeesForAttendance()
  const annual = leaveTypeStore[0]
  const sick = leaveTypeStore[1]
  const casual = leaveTypeStore[2]

  const seeds: Array<Omit<LeaveRequest, 'id'>> = [
    {
      employee: {
        id: employees[1]?.id ?? 'emp-2',
        name: employees[1]?.fullName ?? 'Sarah Chen',
        department: employees[1]?.departmentName ?? 'Engineering',
      },
      leaveType: { id: annual.id, name: annual.name, color: annual.color },
      fromDate: '2026-03-10',
      toDate: '2026-03-14',
      days: 5,
      reason: 'Family vacation',
      status: 'approved',
      appliedOn: '2026-02-20',
      approvedBy: { id: 'usr-admin-1', name: 'HR Admin' },
      approvedOn: '2026-02-21',
    },
    {
      employee: {
        id: employees[4]?.id ?? 'emp-5',
        name: employees[4]?.fullName ?? 'James Wilson',
        department: employees[4]?.departmentName ?? 'Finance',
      },
      leaveType: { id: sick.id, name: sick.name, color: sick.color },
      fromDate: '2026-05-18',
      toDate: '2026-05-20',
      days: 3,
      reason: 'Medical recovery',
      status: 'approved',
      appliedOn: '2026-05-15',
      approvedBy: { id: 'usr-admin-1', name: 'HR Admin' },
      approvedOn: '2026-05-16',
    },
    {
      employee: {
        id: employees[0]?.id ?? 'usr-employee-1',
        name: employees[0]?.fullName ?? 'Jane Employee',
        department: employees[0]?.departmentName ?? 'Engineering',
      },
      leaveType: { id: annual.id, name: annual.name, color: annual.color },
      fromDate: '2026-07-01',
      toDate: '2026-07-05',
      days: 5,
      reason: 'Summer break',
      status: 'pending',
      appliedOn: '2026-06-01',
    },
    {
      employee: {
        id: employees[2]?.id ?? 'emp-3',
        name: employees[2]?.fullName ?? 'Michael Torres',
        department: employees[2]?.departmentName ?? 'Marketing',
      },
      leaveType: { id: casual.id, name: casual.name, color: casual.color },
      fromDate: '2026-04-08',
      toDate: '2026-04-08',
      days: 1,
      reason: 'Personal errand',
      status: 'rejected',
      appliedOn: '2026-04-05',
      rejectionReason: 'Insufficient team coverage on that date',
    },
    {
      employee: {
        id: employees[0]?.id ?? 'usr-employee-1',
        name: employees[0]?.fullName ?? 'Jane Employee',
        department: employees[0]?.departmentName ?? 'Engineering',
      },
      leaveType: { id: sick.id, name: sick.name, color: sick.color },
      fromDate: '2026-02-03',
      toDate: '2026-02-04',
      days: 2,
      reason: 'Flu symptoms',
      status: 'approved',
      appliedOn: '2026-02-02',
      approvedBy: { id: 'usr-admin-1', name: 'HR Admin' },
      approvedOn: '2026-02-02',
    },
  ]

  return seeds.map((seed, index) =>
    LeaveRequestSchema.parse({ ...seed, id: `lr-${index + 1}` }),
  )
}

let leaveRequestStore: LeaveRequest[] = createSeedRequests()
let nextLeaveTypeId = leaveTypeStore.length + 1
let nextRequestId = leaveRequestStore.length + 1

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function calculateLeaveDays(fromDate: string, toDate: string): number {
  const start = parseISO(fromDate)
  const end = parseISO(toDate)
  const days = eachDayOfInterval({ start, end })
  return days.filter((d) => !isWeekend(d)).length || 1
}

function findLeaveType(id: string): LeaveType | undefined {
  return leaveTypeStore.find((lt) => lt.id === id)
}

function hasActiveRequestsForType(leaveTypeId: string): boolean {
  return leaveRequestStore.some(
    (r) =>
      r.leaveType.id === leaveTypeId &&
      (r.status === 'pending' || r.status === 'approved'),
  )
}

function hasOverlappingApprovedLeave(
  employeeId: string,
  fromDate: string,
  toDate: string,
  excludeId?: string,
): boolean {
  const start = parseISO(fromDate)
  const end = parseISO(toDate)

  return leaveRequestStore.some((r) => {
    if (r.employee.id !== employeeId) return false
    if (r.status !== 'approved' && r.status !== 'pending') return false
    if (excludeId && r.id === excludeId) return false
    const rStart = parseISO(r.fromDate)
    const rEnd = parseISO(r.toDate)
    return start <= rEnd && end >= rStart
  })
}

function computeBalance(employeeId: string, leaveType: LeaveType): LeaveBalance {
  const employeeRequests = leaveRequestStore.filter(
    (r) => r.employee.id === employeeId && r.leaveType.id === leaveType.id,
  )

  const used = employeeRequests
    .filter((r) => r.status === 'approved')
    .reduce((sum, r) => sum + r.days, 0)

  const pending = employeeRequests
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + r.days, 0)

  const allocated = leaveType.defaultDays
  const remaining = Math.max(0, allocated - used - pending)

  return LeaveBalanceSchema.parse({
    leaveTypeId: leaveType.id,
    leaveTypeName: leaveType.name,
    color: leaveType.color,
    allocated,
    used,
    pending,
    remaining,
  })
}

export async function getLeaveTypes(): Promise<LeaveType[]> {
  await delay()
  return [...leaveTypeStore]
}

export async function createLeaveType(data: LeaveTypeFormInput): Promise<LeaveType> {
  await delay()
  const leaveType = LeaveTypeSchema.parse({
    id: `lt-${nextLeaveTypeId++}`,
    ...data,
  })
  leaveTypeStore.push(leaveType)
  return leaveType
}

export async function updateLeaveType(
  id: string,
  data: LeaveTypeFormInput,
): Promise<LeaveType> {
  await delay()
  const index = leaveTypeStore.findIndex((lt) => lt.id === id)
  if (index === -1) throw new Error('Leave type not found')
  leaveTypeStore[index] = LeaveTypeSchema.parse({ ...leaveTypeStore[index], ...data })
  return leaveTypeStore[index]
}

export async function deleteLeaveType(id: string): Promise<void> {
  await delay()
  if (hasActiveRequestsForType(id)) {
    throw new Error('Cannot delete leave type with active requests')
  }
  const index = leaveTypeStore.findIndex((lt) => lt.id === id)
  if (index === -1) throw new Error('Leave type not found')
  leaveTypeStore.splice(index, 1)
}

export async function getLeaveRequests(params: {
  status?: LeaveStatus
  departmentId?: string
  leaveTypeId?: string
  month?: number
  year?: number
  page?: number
  perPage?: number
}): Promise<LeaveRequestListResponse> {
  await delay()

  const employees = getAllEmployeesForAttendance()
  const deptMap = new Map(employees.map((e) => [e.id, e.departmentId]))

  let filtered = [...leaveRequestStore]

  if (params.status) {
    filtered = filtered.filter((r) => r.status === params.status)
  }

  if (params.departmentId) {
    filtered = filtered.filter(
      (r) => deptMap.get(r.employee.id) === params.departmentId,
    )
  }

  if (params.leaveTypeId) {
    filtered = filtered.filter((r) => r.leaveType.id === params.leaveTypeId)
  }

  if (params.month && params.year) {
    const prefix = `${params.year}-${String(params.month).padStart(2, '0')}`
    filtered = filtered.filter(
      (r) => r.fromDate.startsWith(prefix) || r.toDate.startsWith(prefix),
    )
  }

  filtered.sort((a, b) => b.appliedOn.localeCompare(a.appliedOn))

  const page = params.page ?? 1
  const perPage = params.perPage ?? 20
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage

  return LeaveRequestListResponseSchema.parse({
    data: filtered.slice(start, start + perPage),
    total,
    page,
    perPage,
    totalPages,
  })
}

export async function approveLeave(
  id: string,
  approver: { id: string; name: string },
): Promise<LeaveRequest> {
  await delay()
  const index = leaveRequestStore.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('Leave request not found')
  if (leaveRequestStore[index].status !== 'pending') {
    throw new Error('Only pending requests can be approved')
  }

  leaveRequestStore[index] = LeaveRequestSchema.parse({
    ...leaveRequestStore[index],
    status: 'approved',
    approvedBy: approver,
    approvedOn: new Date().toISOString().split('T')[0],
  })
  return leaveRequestStore[index]
}

export async function rejectLeave(id: string, reason: string): Promise<LeaveRequest> {
  await delay()
  const index = leaveRequestStore.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('Leave request not found')
  if (leaveRequestStore[index].status !== 'pending') {
    throw new Error('Only pending requests can be rejected')
  }

  leaveRequestStore[index] = LeaveRequestSchema.parse({
    ...leaveRequestStore[index],
    status: 'rejected',
    rejectionReason: reason,
  })
  return leaveRequestStore[index]
}

export async function getMyLeaveBalance(employeeId: string): Promise<LeaveBalance[]> {
  await delay()
  return leaveTypeStore
    .filter((lt) => lt.isActive)
    .map((lt) => computeBalance(employeeId, lt))
}

export async function getMyLeaveRequests(
  employeeId: string,
  params?: { status?: LeaveStatus },
): Promise<LeaveRequest[]> {
  await delay()
  let filtered = leaveRequestStore.filter((r) => r.employee.id === employeeId)
  if (params?.status) {
    filtered = filtered.filter((r) => r.status === params.status)
  }
  return filtered.sort((a, b) => b.appliedOn.localeCompare(a.appliedOn))
}

export async function applyLeave(
  employeeId: string,
  data: ApplyLeaveFormInput,
): Promise<LeaveRequest> {
  await delay()

  const leaveType = findLeaveType(data.leaveTypeId)
  if (!leaveType || !leaveType.isActive) {
    throw new Error('Invalid leave type')
  }

  const days = calculateLeaveDays(data.fromDate, data.toDate)
  const balance = computeBalance(employeeId, leaveType)

  if (days > balance.remaining) {
    throw new Error('Insufficient leave balance')
  }

  if (hasOverlappingApprovedLeave(employeeId, data.fromDate, data.toDate)) {
    throw new Error('Leave dates overlap with an existing request')
  }

  if (leaveType.requiresDocument && !data.document) {
    throw new Error('Document is required for this leave type')
  }

  const employee = getAllEmployeesForAttendance().find((e) => e.id === employeeId)
  if (!employee) throw new Error('Employee not found')

  const request = LeaveRequestSchema.parse({
    id: `lr-${nextRequestId++}`,
    employee: {
      id: employee.id,
      name: employee.fullName,
      avatarUrl: employee.avatarUrl,
      department: employee.departmentName,
    },
    leaveType: { id: leaveType.id, name: leaveType.name, color: leaveType.color },
    fromDate: data.fromDate,
    toDate: data.toDate,
    days,
    reason: data.reason,
    status: 'pending',
    appliedOn: new Date().toISOString().split('T')[0],
    documentUrl: data.document ? '#' : undefined,
  })

  leaveRequestStore = [request, ...leaveRequestStore]
  return request
}

export async function cancelLeave(id: string, employeeId: string): Promise<LeaveRequest> {
  await delay()
  const index = leaveRequestStore.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('Leave request not found')
  if (leaveRequestStore[index].employee.id !== employeeId) {
    throw new Error('Unauthorized')
  }
  if (leaveRequestStore[index].status !== 'pending') {
    throw new Error('Only pending requests can be cancelled')
  }

  leaveRequestStore[index] = LeaveRequestSchema.parse({
    ...leaveRequestStore[index],
    status: 'cancelled',
  })
  return leaveRequestStore[index]
}

export function leaveTypeHasActiveRequests(id: string): boolean {
  return hasActiveRequestsForType(id)
}
