import { format } from 'date-fns'
import {
  ReportDataSchema,
  ReportMetaSchema,
  type ReportColumn,
  type ReportData,
  type ReportFilter,
  type ReportMeta,
  type ReportRow,
  type ReportType,
} from '../types/report.types'
import { getAttendance } from './attendance.api'
import { getEmployees, getEmployeePickerOptions } from './employees.api'
import { getLeaveRequests } from './leaves.api'
import { getPayslips } from './payroll.api'

const MOCK_DELAY_MS = 400

const REPORT_TYPES: ReportMeta[] = [
  {
    type: 'employee',
    title: 'Employee Report',
    description: 'Employee directory with department and status filters.',
    icon: 'Users',
    available: true,
  },
  {
    type: 'attendance',
    title: 'Attendance Report',
    description: 'Monthly attendance records and summaries.',
    icon: 'Clock',
    available: true,
  },
  {
    type: 'leave',
    title: 'Leave Report',
    description: 'Leave requests and balances by type.',
    icon: 'CalendarDays',
    available: true,
  },
  {
    type: 'payslip',
    title: 'Payslip Report',
    description: 'Payslip data for a selected pay period.',
    icon: 'Receipt',
    available: true,
  },
  {
    type: 'payment',
    title: 'Payment Report',
    description: 'Processed payment history.',
    icon: 'Wallet',
    available: true,
  },
  {
    type: 'expense',
    title: 'Expense Report',
    description: 'Expense claims summary.',
    icon: 'CreditCard',
    available: false,
  },
  {
    type: 'user_activity',
    title: 'User Activity',
    description: 'User login and action audit log.',
    icon: 'Activity',
    available: true,
  },
]

const USER_ACTIVITY_LOG: Array<{
  userId: string
  user: string
  role: string
  action: string
  module: string
  timestamp: string
  ipAddress: string
}> = [
  {
    userId: 'usr-admin-1',
    user: 'HR Admin',
    role: 'HR Admin',
    action: 'Approved leave request',
    module: 'Leaves',
    timestamp: '2026-06-01T09:15:00Z',
    ipAddress: '192.168.1.10',
  },
  {
    userId: 'usr-employee-1',
    user: 'Jane Employee',
    role: 'Employee',
    action: 'Submitted leave application',
    module: 'Leaves',
    timestamp: '2026-05-31T14:22:00Z',
    ipAddress: '10.0.0.45',
  },
  {
    userId: 'usr-admin-1',
    user: 'HR Admin',
    role: 'HR Admin',
    action: 'Generated payslips',
    module: 'Payroll',
    timestamp: '2026-05-30T11:00:00Z',
    ipAddress: '192.168.1.10',
  },
  {
    userId: 'usr-super-1',
    user: 'Super Admin',
    role: 'Super Admin',
    action: 'Updated department settings',
    module: 'Departments',
    timestamp: '2026-05-29T16:45:00Z',
    ipAddress: '192.168.1.5',
  },
  {
    userId: 'usr-employee-1',
    user: 'Jane Employee',
    role: 'Employee',
    action: 'Clocked in',
    module: 'Attendance',
    timestamp: '2026-05-29T08:02:00Z',
    ipAddress: '10.0.0.45',
  },
  {
    userId: 'usr-admin-1',
    user: 'HR Admin',
    role: 'HR Admin',
    action: 'Created job posting',
    module: 'Recruitment',
    timestamp: '2026-05-28T10:30:00Z',
    ipAddress: '192.168.1.10',
  },
  {
    userId: 'emp-2',
    user: 'Sarah Chen',
    role: 'Employee',
    action: 'Submitted support ticket',
    module: 'Tickets',
    timestamp: '2026-05-27T13:18:00Z',
    ipAddress: '10.0.0.88',
  },
  {
    userId: 'usr-admin-1',
    user: 'HR Admin',
    role: 'HR Admin',
    action: 'Exported attendance report',
    module: 'Reports',
    timestamp: '2026-05-26T09:00:00Z',
    ipAddress: '192.168.1.10',
  },
  {
    userId: 'usr-employee-1',
    user: 'Jane Employee',
    role: 'Employee',
    action: 'Viewed payslip',
    module: 'Payroll',
    timestamp: '2026-05-25T17:05:00Z',
    ipAddress: '10.0.0.45',
  },
  {
    userId: 'usr-super-1',
    user: 'Super Admin',
    role: 'Super Admin',
    action: 'Logged in',
    module: 'Auth',
    timestamp: '2026-05-24T08:00:00Z',
    ipAddress: '192.168.1.5',
  },
  {
    userId: 'emp-4',
    user: 'Emily Davis',
    role: 'HR Admin',
    action: 'Reviewed referral',
    module: 'Recruitment',
    timestamp: '2026-05-23T15:40:00Z',
    ipAddress: '192.168.1.20',
  },
  {
    userId: 'usr-admin-1',
    user: 'HR Admin',
    role: 'HR Admin',
    action: 'Updated employee record',
    module: 'Employees',
    timestamp: '2026-05-22T11:25:00Z',
    ipAddress: '192.168.1.10',
  },
]

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function paginateRows(rows: ReportRow[], page?: number, perPage?: number) {
  const p = page ?? 1
  const size = perPage ?? 20
  const start = (p - 1) * size
  return rows.slice(start, start + size)
}

function buildReportData(
  type: ReportType,
  title: string,
  filters: ReportFilter,
  columns: ReportColumn[],
  allRows: ReportRow[],
  page?: number,
  perPage?: number,
): ReportData {
  return ReportDataSchema.parse({
    type,
    title,
    generatedAt: new Date().toISOString(),
    filters,
    columns,
    rows: paginateRows(allRows, page, perPage),
    totalRows: allRows.length,
  })
}

async function generateEmployeeReport(
  filters: ReportFilter,
  page?: number,
  perPage?: number,
): Promise<ReportData> {
  const result = await getEmployees({
    departmentId: filters.departmentId,
    status: filters.status as 'active' | 'inactive' | 'on_leave' | 'terminated' | undefined,
    perPage: 500,
    page: 1,
  })

  const columns: ReportColumn[] = [
    { key: 'employeeId', label: 'Employee ID', align: 'left' },
    { key: 'name', label: 'Name', align: 'left' },
    { key: 'email', label: 'Email', align: 'left' },
    { key: 'department', label: 'Department', align: 'left' },
    { key: 'designation', label: 'Designation', align: 'left' },
    { key: 'status', label: 'Status', align: 'left' },
    { key: 'joinDate', label: 'Join Date', align: 'left' },
  ]

  const allRows: ReportRow[] = result.data.map((e) => ({
    employeeId: e.employeeId,
    name: e.fullName,
    email: e.email,
    department: e.department.name,
    designation: e.designation.name,
    status: e.status.replace('_', ' '),
    joinDate: e.joinDate,
  }))

  return buildReportData('employee', 'Employee Report', filters, columns, allRows, page, perPage)
}

async function generateAttendanceReport(
  filters: ReportFilter,
  page?: number,
  perPage?: number,
): Promise<ReportData> {
  const month = filters.month ?? new Date().getMonth() + 1
  const year = filters.year ?? new Date().getFullYear()

  const result = await getAttendance({
    month,
    year,
    departmentId: filters.departmentId,
    status: filters.status as
      | 'present'
      | 'absent'
      | 'late'
      | 'half_day'
      | 'on_leave'
      | 'holiday'
      | undefined,
    perPage: 1000,
    page: 1,
  })

  const columns: ReportColumn[] = [
    { key: 'employee', label: 'Employee', align: 'left' },
    { key: 'department', label: 'Department', align: 'left' },
    { key: 'date', label: 'Date', align: 'left' },
    { key: 'checkIn', label: 'Check In', align: 'left' },
    { key: 'checkOut', label: 'Check Out', align: 'left' },
    { key: 'workingHours', label: 'Working Hours', align: 'right' },
    { key: 'status', label: 'Status', align: 'left' },
  ]

  const allRows: ReportRow[] = result.data.map((r) => ({
    employee: r.employeeName,
    department: r.department,
    date: r.date,
    checkIn: r.checkIn ?? '—',
    checkOut: r.checkOut ?? '—',
    workingHours: r.workingHours ?? 0,
    status: r.status.replace('_', ' '),
  }))

  return buildReportData('attendance', 'Attendance Report', filters, columns, allRows, page, perPage)
}

async function generateLeaveReport(
  filters: ReportFilter,
  page?: number,
  perPage?: number,
): Promise<ReportData> {
  const result = await getLeaveRequests({
    month: filters.month,
    year: filters.year,
    departmentId: filters.departmentId,
    status: filters.status as 'pending' | 'approved' | 'rejected' | 'cancelled' | undefined,
    perPage: 500,
    page: 1,
  })

  const columns: ReportColumn[] = [
    { key: 'employee', label: 'Employee', align: 'left' },
    { key: 'department', label: 'Department', align: 'left' },
    { key: 'leaveType', label: 'Leave Type', align: 'left' },
    { key: 'from', label: 'From', align: 'left' },
    { key: 'to', label: 'To', align: 'left' },
    { key: 'days', label: 'Days', align: 'right' },
    { key: 'status', label: 'Status', align: 'left' },
    { key: 'appliedOn', label: 'Applied On', align: 'left' },
  ]

  const allRows: ReportRow[] = result.data.map((r) => ({
    employee: r.employee.name,
    department: r.employee.department,
    leaveType: r.leaveType.name,
    from: r.fromDate,
    to: r.toDate,
    days: r.days,
    status: r.status,
    appliedOn: r.appliedOn,
  }))

  return buildReportData('leave', 'Leave Report', filters, columns, allRows, page, perPage)
}

async function generatePayslipReport(
  filters: ReportFilter,
  page?: number,
  perPage?: number,
): Promise<ReportData> {
  const result = await getPayslips({
    month: filters.month,
    year: filters.year,
    departmentId: filters.departmentId,
    perPage: 500,
    page: 1,
  })

  const columns: ReportColumn[] = [
    { key: 'employee', label: 'Employee', align: 'left' },
    { key: 'department', label: 'Department', align: 'left' },
    { key: 'payPeriod', label: 'Pay Period', align: 'left' },
    { key: 'grossPay', label: 'Gross Pay', align: 'right' },
    { key: 'deductions', label: 'Deductions', align: 'right' },
    { key: 'netPay', label: 'Net Pay', align: 'right' },
    { key: 'status', label: 'Status', align: 'left' },
  ]

  const allRows: ReportRow[] = result.data.map((p) => ({
    employee: p.employee.name,
    department: p.employee.department,
    payPeriod: p.payPeriod.label,
    grossPay: p.grossPay,
    deductions: p.totalDeductions,
    netPay: p.netPay,
    status: p.status,
  }))

  return buildReportData('payslip', 'Payslip Report', filters, columns, allRows, page, perPage)
}

async function generatePaymentReport(
  filters: ReportFilter,
  page?: number,
  perPage?: number,
): Promise<ReportData> {
  const result = await getPayslips({
    month: filters.month,
    year: filters.year,
    departmentId: filters.departmentId,
    status: 'paid',
    perPage: 500,
    page: 1,
  })

  const columns: ReportColumn[] = [
    { key: 'employee', label: 'Employee', align: 'left' },
    { key: 'department', label: 'Department', align: 'left' },
    { key: 'payPeriod', label: 'Pay Period', align: 'left' },
    { key: 'netPay', label: 'Net Pay', align: 'right' },
    { key: 'paymentDate', label: 'Payment Date', align: 'left' },
    { key: 'status', label: 'Status', align: 'left' },
  ]

  const allRows: ReportRow[] = result.data.map((p) => ({
    employee: p.employee.name,
    department: p.employee.department,
    payPeriod: p.payPeriod.label,
    netPay: p.netPay,
    paymentDate: p.generatedAt,
    status: p.status,
  }))

  return buildReportData('payment', 'Payment Report', filters, columns, allRows, page, perPage)
}

function generateUserActivityReport(
  filters: ReportFilter,
  page?: number,
  perPage?: number,
): ReportData {
  let filtered = [...USER_ACTIVITY_LOG]

  if (filters.dateFrom) {
    filtered = filtered.filter((r) => r.timestamp >= `${filters.dateFrom}T00:00:00Z`)
  }
  if (filters.dateTo) {
    filtered = filtered.filter((r) => r.timestamp <= `${filters.dateTo}T23:59:59Z`)
  }
  if (filters.employeeId) {
    const employee = getEmployeePickerOptions().find((e) => e.id === filters.employeeId)
    if (employee) {
      filtered = filtered.filter(
        (r) => r.userId === filters.employeeId || r.user === employee.name,
      )
    }
  }

  const columns: ReportColumn[] = [
    { key: 'user', label: 'User', align: 'left' },
    { key: 'role', label: 'Role', align: 'left' },
    { key: 'action', label: 'Action', align: 'left' },
    { key: 'module', label: 'Module', align: 'left' },
    { key: 'timestamp', label: 'Timestamp', align: 'left' },
    { key: 'ipAddress', label: 'IP Address', align: 'left' },
  ]

  const allRows: ReportRow[] = filtered.map((r) => ({
    user: r.user,
    role: r.role,
    action: r.action,
    module: r.module,
    timestamp: r.timestamp,
    ipAddress: r.ipAddress,
  }))

  return buildReportData(
    'user_activity',
    'User Activity Report',
    filters,
    columns,
    allRows,
    page,
    perPage,
  )
}

function rowsToCsv(columns: ReportColumn[], rows: ReportRow[]): string {
  const header = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',')
  const body = rows.map((row) =>
    columns
      .map((col) => {
        const value = row[col.key]
        const str = value === null || value === undefined ? '' : String(value)
        return `"${str.replace(/"/g, '""')}"`
      })
      .join(','),
  )
  return [header, ...body].join('\n')
}

export async function getReportTypes(): Promise<ReportMeta[]> {
  await delay(200)
  return REPORT_TYPES.map((r) => ReportMetaSchema.parse(r))
}

export async function generateReport(params: {
  type: ReportType
  filters: ReportFilter
  page?: number
  perPage?: number
}): Promise<ReportData> {
  await delay()
  if (params.type === 'expense') throw new Error('Expense report is not available yet')

  switch (params.type) {
    case 'employee':
      return generateEmployeeReport(params.filters, params.page, params.perPage)
    case 'attendance':
      return generateAttendanceReport(params.filters, params.page, params.perPage)
    case 'leave':
      return generateLeaveReport(params.filters, params.page, params.perPage)
    case 'payslip':
      return generatePayslipReport(params.filters, params.page, params.perPage)
    case 'payment':
      return generatePaymentReport(params.filters, params.page, params.perPage)
    case 'user_activity':
      return generateUserActivityReport(params.filters, params.page, params.perPage)
    default:
      throw new Error('Unknown report type')
  }
}

export async function exportReport(params: {
  type: ReportType
  filters: ReportFilter
}): Promise<Blob> {
  await delay(500)
  if (params.type === 'expense') throw new Error('Expense report is not available yet')

  const report = await generateReport({ type: params.type, filters: params.filters, page: 1, perPage: 100000 })
  const csv = `\uFEFF${rowsToCsv(report.columns, report.rows)}`
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

export function getReportDownloadFilename(type: ReportType): string {
  return `${type}-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
}
