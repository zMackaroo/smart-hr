import {
  ExpenseClaimSchema,
  ExpenseListResponseSchema,
  SubmitExpenseFormSchema,
  type ExpenseCategory,
  type ExpenseClaim,
  type ExpenseListResponse,
  type ExpenseListSummary,
  type ExpenseStatus,
  type SubmitExpenseFormInput,
} from '../types/expense.types'
import { getAllEmployeesForAttendance } from './employees.api'
import {
  assertCompanyAccess,
  filterByCompany,
  getActiveCompanyIdSync,
} from '../utils/company-context.utils'
import { DEFAULT_CURRENCY } from '../config/currency.config'

const MOCK_DELAY_MS = 350

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function createSeedClaims(): ExpenseClaim[] {
  const employees = getAllEmployeesForAttendance()
  const pick = (index: number) => employees[index % employees.length]

  const seeds: Array<Omit<ExpenseClaim, 'id' | 'claimNumber' | 'companyId'>> = [
    {
      employee: {
        id: pick(0).id,
        name: pick(0).fullName,
        avatarUrl: pick(0).avatarUrl,
        department: pick(0).departmentName,
        employeeId: pick(0).employeeId,
      },
      category: 'travel',
      title: 'Client site visit — Chicago',
      description: 'Round-trip train tickets for client onboarding workshop.',
      amount: 245,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-20',
      receiptUrl: '#',
      status: 'pending',
      submittedDate: '2026-05-21T10:00:00.000Z',
    },
    {
      employee: {
        id: pick(1).id,
        name: pick(1).fullName,
        avatarUrl: pick(1).avatarUrl,
        department: pick(1).departmentName,
        employeeId: pick(1).employeeId,
      },
      category: 'meals',
      title: 'Team lunch with candidates',
      amount: 128.5,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-18',
      status: 'approved',
      submittedDate: '2026-05-19T14:30:00.000Z',
      reviewedBy: { id: 'usr-admin-1', name: 'HR Admin' },
      reviewedDate: '2026-05-20T09:00:00.000Z',
    },
    {
      employee: {
        id: pick(2).id,
        name: pick(2).fullName,
        avatarUrl: pick(2).avatarUrl,
        department: pick(2).departmentName,
        employeeId: pick(2).employeeId,
      },
      category: 'supplies',
      title: 'Office stationery restock',
      amount: 67.25,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-15',
      receiptUrl: '#',
      status: 'reimbursed',
      submittedDate: '2026-05-16T11:20:00.000Z',
      reviewedBy: { id: 'usr-admin-1', name: 'HR Admin' },
      reviewedDate: '2026-05-17T08:45:00.000Z',
      reimbursedDate: '2026-05-25T00:00:00.000Z',
    },
    {
      employee: {
        id: pick(3).id,
        name: pick(3).fullName,
        department: pick(3).departmentName,
        employeeId: pick(3).employeeId,
      },
      category: 'accommodation',
      title: 'Conference hotel stay',
      description: 'HR summit accommodation for 2 nights.',
      amount: 420,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-10',
      status: 'pending',
      submittedDate: '2026-05-12T16:00:00.000Z',
    },
    {
      employee: {
        id: pick(4).id,
        name: pick(4).fullName,
        department: pick(4).departmentName,
        employeeId: pick(4).employeeId,
      },
      category: 'transport',
      title: 'Airport taxi reimbursement',
      amount: 54,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-08',
      status: 'rejected',
      submittedDate: '2026-05-09T09:15:00.000Z',
      reviewedBy: { id: 'usr-admin-1', name: 'HR Admin' },
      reviewedDate: '2026-05-10T10:30:00.000Z',
      rejectionReason: 'Receipt missing pickup location and fare breakdown.',
    },
    {
      employee: {
        id: pick(5).id,
        name: pick(5).fullName,
        department: pick(5).departmentName,
        employeeId: pick(5).employeeId,
      },
      category: 'meals',
      title: 'Working dinner during release',
      amount: 89.75,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-22',
      status: 'pending',
      submittedDate: '2026-05-23T08:00:00.000Z',
    },
    {
      employee: {
        id: pick(6).id,
        name: pick(6).fullName,
        department: pick(6).departmentName,
        employeeId: pick(6).employeeId,
      },
      category: 'travel',
      title: 'Regional sales visit mileage',
      amount: 156,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-14',
      status: 'approved',
      submittedDate: '2026-05-15T13:00:00.000Z',
      reviewedBy: { id: 'usr-admin-1', name: 'HR Admin' },
      reviewedDate: '2026-05-16T09:30:00.000Z',
    },
    {
      employee: {
        id: pick(7).id,
        name: pick(7).fullName,
        department: pick(7).departmentName,
        employeeId: pick(7).employeeId,
      },
      category: 'other',
      title: 'Software subscription reimbursement',
      amount: 29.99,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-01',
      status: 'reimbursed',
      submittedDate: '2026-05-02T10:00:00.000Z',
      reviewedBy: { id: 'usr-super-1', name: 'Super Admin' },
      reviewedDate: '2026-05-03T11:00:00.000Z',
      reimbursedDate: '2026-05-10T00:00:00.000Z',
    },
    {
      employee: {
        id: pick(8).id,
        name: pick(8).fullName,
        department: pick(8).departmentName,
        employeeId: pick(8).employeeId,
      },
      category: 'supplies',
      title: 'Ergonomic keyboard',
      amount: 119,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-19',
      receiptUrl: '#',
      status: 'pending',
      submittedDate: '2026-05-20T15:45:00.000Z',
    },
    {
      employee: {
        id: pick(9).id,
        name: pick(9).fullName,
        department: pick(9).departmentName,
        employeeId: pick(9).employeeId,
      },
      category: 'transport',
      title: 'Monthly transit pass',
      amount: 95,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-01',
      status: 'approved',
      submittedDate: '2026-05-02T12:00:00.000Z',
      reviewedBy: { id: 'usr-admin-1', name: 'HR Admin' },
      reviewedDate: '2026-05-03T09:00:00.000Z',
    },
    {
      employee: {
        id: pick(10).id,
        name: pick(10).fullName,
        department: pick(10).departmentName,
        employeeId: pick(10).employeeId,
      },
      category: 'meals',
      title: 'Client entertainment dinner',
      amount: 210,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-17',
      status: 'pending',
      submittedDate: '2026-05-18T17:30:00.000Z',
    },
    {
      employee: {
        id: pick(11).id,
        name: pick(11).fullName,
        department: pick(11).departmentName,
        employeeId: pick(11).employeeId,
      },
      category: 'travel',
      title: 'Flight to partner office',
      amount: 385,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-11',
      status: 'reimbursed',
      submittedDate: '2026-05-12T08:00:00.000Z',
      reviewedBy: { id: 'usr-admin-1', name: 'HR Admin' },
      reviewedDate: '2026-05-13T10:00:00.000Z',
      reimbursedDate: '2026-05-20T00:00:00.000Z',
    },
    {
      employee: {
        id: pick(12).id,
        name: pick(12).fullName,
        department: pick(12).departmentName,
        employeeId: pick(12).employeeId,
      },
      category: 'accommodation',
      title: 'Training workshop lodging',
      amount: 298,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-06',
      status: 'rejected',
      submittedDate: '2026-05-07T11:00:00.000Z',
      reviewedBy: { id: 'usr-admin-1', name: 'HR Admin' },
      reviewedDate: '2026-05-08T09:00:00.000Z',
      rejectionReason: 'Booking exceeds approved nightly rate policy.',
    },
    {
      employee: {
        id: pick(13).id,
        name: pick(13).fullName,
        department: pick(13).departmentName,
        employeeId: pick(13).employeeId,
      },
      category: 'other',
      title: 'Certification exam fee',
      amount: 175,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-24',
      status: 'pending',
      submittedDate: '2026-05-25T09:30:00.000Z',
    },
    {
      employee: {
        id: pick(14).id,
        name: pick(14).fullName,
        department: pick(14).departmentName,
        employeeId: pick(14).employeeId,
      },
      category: 'supplies',
      title: 'Presentation materials',
      amount: 42.5,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-13',
      status: 'approved',
      submittedDate: '2026-05-14T14:00:00.000Z',
      reviewedBy: { id: 'usr-admin-1', name: 'HR Admin' },
      reviewedDate: '2026-05-15T08:30:00.000Z',
    },
    {
      employee: {
        id: pick(0).id,
        name: pick(0).fullName,
        avatarUrl: pick(0).avatarUrl,
        department: pick(0).departmentName,
        employeeId: pick(0).employeeId,
      },
      category: 'transport',
      title: 'Parking for onsite client meeting',
      amount: 18,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-26',
      status: 'pending',
      submittedDate: '2026-05-27T10:00:00.000Z',
    },
    {
      employee: {
        id: pick(1).id,
        name: pick(1).fullName,
        department: pick(1).departmentName,
        employeeId: pick(1).employeeId,
      },
      category: 'meals',
      title: 'Remote team sync lunch',
      amount: 64.2,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-28',
      status: 'approved',
      submittedDate: '2026-05-29T12:00:00.000Z',
      reviewedBy: { id: 'usr-admin-1', name: 'HR Admin' },
      reviewedDate: '2026-05-30T09:00:00.000Z',
    },
    {
      employee: {
        id: 'usr-employee-1',
        name: 'Jane Employee',
        department: pick(0).departmentName,
        employeeId: 'EMP-001',
      },
      category: 'travel',
      title: 'Commute reimbursement — May',
      amount: 120,
      currency: DEFAULT_CURRENCY,
      expenseDate: '2026-05-15',
      receiptUrl: '#',
      status: 'pending',
      submittedDate: '2026-05-16T09:00:00.000Z',
    },
  ]

  return seeds.map((seed, index) =>
    ExpenseClaimSchema.parse({
      ...seed,
      companyId: 'co-1',
      id: `exp-${index + 1}`,
      claimNumber: `EXP-${String(index + 1).padStart(4, '0')}`,
    }),
  )
}

let expenseStore: ExpenseClaim[] = createSeedClaims()
let nextClaimNumber = expenseStore.length + 1

function computeSummary(claims: ExpenseClaim[]): ExpenseListSummary {
  return {
    pending: claims.filter((claim) => claim.status === 'pending').length,
    approved: claims.filter((claim) => claim.status === 'approved').length,
    rejected: claims.filter((claim) => claim.status === 'rejected').length,
    reimbursed: claims.filter((claim) => claim.status === 'reimbursed').length,
    pendingAmount: claims
      .filter((claim) => claim.status === 'pending')
      .reduce((sum, claim) => sum + claim.amount, 0),
  }
}

function filterClaims(
  claims: ExpenseClaim[],
  params?: {
    search?: string
    status?: ExpenseStatus
    category?: ExpenseCategory
    departmentId?: string
    employeeId?: string
    dateFrom?: string
    dateTo?: string
  },
): ExpenseClaim[] {
  let filtered = filterByCompany(claims, getActiveCompanyIdSync())
  const search = params?.search?.trim().toLowerCase()

  if (search) {
    filtered = filtered.filter(
      (claim) =>
        claim.title.toLowerCase().includes(search) ||
        claim.claimNumber.toLowerCase().includes(search) ||
        claim.employee.name.toLowerCase().includes(search),
    )
  }

  if (params?.status) {
    filtered = filtered.filter((claim) => claim.status === params.status)
  }

  if (params?.category) {
    filtered = filtered.filter((claim) => claim.category === params.category)
  }

  if (params?.departmentId) {
    const employees = getAllEmployeesForAttendance()
    const departmentNames = new Set(
      employees
        .filter((employee) => employee.departmentId === params.departmentId)
        .map((employee) => employee.departmentName),
    )
    filtered = filtered.filter((claim) => departmentNames.has(claim.employee.department))
  }

  if (params?.employeeId) {
    filtered = filtered.filter((claim) => claim.employee.id === params.employeeId)
  }

  if (params?.dateFrom) {
    filtered = filtered.filter((claim) => claim.expenseDate >= params.dateFrom!)
  }

  if (params?.dateTo) {
    filtered = filtered.filter((claim) => claim.expenseDate <= params.dateTo!)
  }

  filtered.sort(
    (a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime(),
  )

  return filtered
}

function paginateClaims(
  claims: ExpenseClaim[],
  page: number,
  perPage: number,
): ExpenseListResponse {
  const total = claims.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * perPage

  return ExpenseListResponseSchema.parse({
    data: claims.slice(start, start + perPage),
    total,
    page: safePage,
    perPage,
    totalPages,
    summary: computeSummary(claims),
  })
}

export const EXPENSES_QUERY_KEY = ['expenses'] as const

export async function getExpenseClaims(params?: {
  search?: string
  status?: ExpenseStatus
  category?: ExpenseCategory
  departmentId?: string
  employeeId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
}): Promise<ExpenseListResponse> {
  await delay()
  const filtered = filterClaims(expenseStore, params)
  return paginateClaims(filtered, params?.page ?? 1, params?.perPage ?? 10)
}

export async function getMyExpenseClaims(
  employeeId: string,
  params?: {
    status?: ExpenseStatus
    page?: number
    perPage?: number
  },
): Promise<ExpenseListResponse> {
  await delay()
  const filtered = filterClaims(expenseStore, {
    employeeId,
    status: params?.status,
  })
  return paginateClaims(filtered, params?.page ?? 1, params?.perPage ?? 10)
}

export async function getExpenseClaim(id: string): Promise<ExpenseClaim> {
  await delay()
  const claim = filterByCompany(expenseStore).find((item) => item.id === id)
  if (!claim) {
    throw new Error('Expense claim not found')
  }
  assertCompanyAccess(claim.companyId)
  return ExpenseClaimSchema.parse(claim)
}

export async function submitExpenseClaim(
  employeeId: string,
  data: SubmitExpenseFormInput,
): Promise<ExpenseClaim> {
  await delay()

  const parsed = SubmitExpenseFormSchema.parse(data)
  const employee = getAllEmployeesForAttendance().find((item) => item.id === employeeId)

  if (!employee) {
    throw new Error('Employee not found')
  }

  const created = ExpenseClaimSchema.parse({
    id: `exp-${Date.now()}`,
    companyId: getActiveCompanyIdSync(),
    claimNumber: `EXP-${String(nextClaimNumber).padStart(4, '0')}`,
    employee: {
      id: employee.id,
      name: employee.fullName,
      avatarUrl: employee.avatarUrl,
      department: employee.departmentName,
      employeeId: employee.employeeId,
    },
    category: parsed.category,
    title: parsed.title,
    description: parsed.description,
    amount: parsed.amount,
    currency: DEFAULT_CURRENCY,
    expenseDate: parsed.expenseDate,
    receiptUrl: parsed.receipt ? '#' : undefined,
    status: 'pending',
    submittedDate: new Date().toISOString(),
  })

  nextClaimNumber += 1
  expenseStore.unshift(created)

  return created
}

export async function approveExpenseClaim(
  id: string,
  reviewer: { id: string; name: string },
): Promise<ExpenseClaim> {
  await delay()

  const index = expenseStore.findIndex((claim) => claim.id === id)
  if (index === -1) {
    throw new Error('Expense claim not found')
  }

  if (expenseStore[index].status !== 'pending') {
    throw new Error('Only pending claims can be approved')
  }

  const now = new Date().toISOString()
  expenseStore[index] = ExpenseClaimSchema.parse({
    ...expenseStore[index],
    status: 'approved',
    reviewedBy: reviewer,
    reviewedDate: now,
  })

  return expenseStore[index]
}

export async function rejectExpenseClaim(
  id: string,
  reviewer: { id: string; name: string },
  reason: string,
): Promise<ExpenseClaim> {
  await delay()

  if (reason.trim().length < 5) {
    throw new Error('Rejection reason is required')
  }

  const index = expenseStore.findIndex((claim) => claim.id === id)
  if (index === -1) {
    throw new Error('Expense claim not found')
  }

  if (expenseStore[index].status !== 'pending') {
    throw new Error('Only pending claims can be rejected')
  }

  const now = new Date().toISOString()
  expenseStore[index] = ExpenseClaimSchema.parse({
    ...expenseStore[index],
    status: 'rejected',
    reviewedBy: reviewer,
    reviewedDate: now,
    rejectionReason: reason.trim(),
  })

  return expenseStore[index]
}

export async function cancelExpenseClaim(
  id: string,
  employeeId: string,
): Promise<ExpenseClaim> {
  await delay()

  const index = expenseStore.findIndex((claim) => claim.id === id)
  if (index === -1) {
    throw new Error('Expense claim not found')
  }

  if (expenseStore[index].employee.id !== employeeId) {
    throw new Error('You can only cancel your own expense claims')
  }

  if (expenseStore[index].status !== 'pending') {
    throw new Error('Only pending claims can be cancelled')
  }

  expenseStore[index] = ExpenseClaimSchema.parse({
    ...expenseStore[index],
    status: 'cancelled',
  })

  return expenseStore[index]
}

export async function markExpenseReimbursed(
  id: string,
  reviewer: { id: string; name: string },
): Promise<ExpenseClaim> {
  await delay()

  const index = expenseStore.findIndex((claim) => claim.id === id)
  if (index === -1) {
    throw new Error('Expense claim not found')
  }

  if (expenseStore[index].status !== 'approved') {
    throw new Error('Only approved claims can be marked as reimbursed')
  }

  const now = new Date().toISOString()
  expenseStore[index] = ExpenseClaimSchema.parse({
    ...expenseStore[index],
    status: 'reimbursed',
    reviewedBy: reviewer,
    reviewedDate: expenseStore[index].reviewedDate ?? now,
    reimbursedDate: now.split('T')[0],
  })

  return expenseStore[index]
}

export async function getExpenseClaimsForReport(params?: {
  month?: number
  year?: number
  departmentId?: string
  status?: ExpenseStatus
}): Promise<ExpenseClaim[]> {
  await delay(150)

  let filtered = filterByCompany([...expenseStore])

  if (params?.month && params?.year) {
    filtered = filtered.filter((claim) => {
      const submitted = new Date(claim.submittedDate)
      return (
        submitted.getUTCMonth() + 1 === params.month &&
        submitted.getUTCFullYear() === params.year
      )
    })
  }

  if (params?.departmentId) {
    filtered = filterClaims(filtered, { departmentId: params.departmentId })
  }

  if (params?.status) {
    filtered = filtered.filter((claim) => claim.status === params.status)
  }

  return filtered.map((claim) => ExpenseClaimSchema.parse(claim))
}
