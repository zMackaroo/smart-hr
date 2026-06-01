import { format } from 'date-fns'
import {
  EmployeeSalarySchema,
  PayslipListResponseSchema,
  PayslipSchema,
  PfListResponseSchema,
  ProvidentFundRecordSchema,
  ProvidentFundSummarySchema,
  SalaryComponentSchema,
  SalaryListResponseSchema,
  type EmployeeSalary,
  type Payslip,
  type PayslipStatus,
  type PfContributionStatus,
  type PfSettingsFormInput,
  type ProvidentFundRecord,
  type ProvidentFundSummary,
  type SalaryFormInput,
} from '../types/payroll.types'
import { getAllEmployeesForPayroll } from './employees.api'
import {
  filterByCompany,
} from '../utils/company-context.utils'
import { DEFAULT_CURRENCY } from '../config/currency.config'

const MOCK_DELAY_MS = 350

let pfSettings = { defaultEmployeeRate: 5, defaultEmployerRate: 5 }
let salaryStore: EmployeeSalary[] = []
let payslipStore: Payslip[] = []
let pfStore: ProvidentFundRecord[] = []
let nextSalaryId = 1
let nextPayslipId = 1
let nextPfId = 1
let nextComponentId = 1

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function makeComponents(
  items: Array<{ label: string; amount: number; type: 'earning' | 'deduction' }>,
) {
  return items.map((item) =>
    SalaryComponentSchema.parse({
      id: `comp-${nextComponentId++}`,
      ...item,
    }),
  )
}

function computeSalaryTotals(
  baseSalary: number,
  components: Array<{ label: string; amount: number; type: 'earning' | 'deduction' }>,
) {
  const earnings = components.filter((c) => c.type === 'earning').reduce((s, c) => s + c.amount, 0)
  const deductions = components
    .filter((c) => c.type === 'deduction')
    .reduce((s, c) => s + c.amount, 0)
  const grossSalary = baseSalary + earnings
  const netSalary = grossSalary - deductions
  return { grossSalary, totalDeductions: deductions, netSalary }
}

export function previewSalary(data: SalaryFormInput) {
  return computeSalaryTotals(data.baseSalary, data.components)
}

function buildSalaryRecord(
  id: string,
  employee: ReturnType<typeof getAllEmployeesForPayroll>[number],
  data: SalaryFormInput,
): EmployeeSalary {
  const components = makeComponents(data.components)
  const { grossSalary, totalDeductions, netSalary } = computeSalaryTotals(
    data.baseSalary,
    data.components,
  )

  return EmployeeSalarySchema.parse({
    id,
    companyId: employee.companyId,
    employee: {
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.fullName,
      avatarUrl: employee.avatarUrl,
      department: employee.departmentName,
      departmentId: employee.departmentId,
      designation: employee.designationName,
    },
    baseSalary: data.baseSalary,
    components,
    grossSalary,
    totalDeductions,
    netSalary,
    payFrequency: data.payFrequency,
    effectiveFrom: data.effectiveFrom,
    bankAccountLast4: data.bankAccountLast4 || undefined,
    currency: DEFAULT_CURRENCY,
    updatedAt: new Date().toISOString().split('T')[0],
  })
}

function createPfRecord(salary: EmployeeSalary): ProvidentFundRecord {
  const monthlyBase = salary.netSalary
  const empAmount = Math.round((monthlyBase * pfSettings.defaultEmployeeRate) / 100)
  const emplAmount = Math.round((monthlyBase * pfSettings.defaultEmployerRate) / 100)

  return ProvidentFundRecordSchema.parse({
    id: `pf-${nextPfId++}`,
    companyId: salary.companyId,
    employee: {
      id: salary.employee.id,
      employeeId: salary.employee.employeeId,
      name: salary.employee.name,
      avatarUrl: salary.employee.avatarUrl,
      department: salary.employee.department,
      departmentId: salary.employee.departmentId,
    },
    employeeContributionRate: pfSettings.defaultEmployeeRate,
    employerContributionRate: pfSettings.defaultEmployerRate,
    employeeContributionAmount: empAmount,
    employerContributionAmount: emplAmount,
    totalBalance: (empAmount + emplAmount) * 6,
    status: 'active',
    enrolledDate: salary.effectiveFrom,
    lastContributionDate: new Date().toISOString().split('T')[0],
  })
}

function syncPfRecord(salary: EmployeeSalary) {
  const index = pfStore.findIndex((r) => r.employee.id === salary.employee.id)
  const empAmount = Math.round((salary.netSalary * pfSettings.defaultEmployeeRate) / 100)
  const emplAmount = Math.round((salary.netSalary * pfSettings.defaultEmployerRate) / 100)

  if (index === -1) {
    pfStore.push(createPfRecord(salary))
    return
  }

  pfStore[index] = ProvidentFundRecordSchema.parse({
    ...pfStore[index],
    employeeContributionAmount: empAmount,
    employerContributionAmount: emplAmount,
  })
}

function seedSalaries() {
  const employees = getAllEmployeesForPayroll().slice(0, 10)
  salaryStore = employees.map((emp, index) => {
    const baseSalary = 45000 + index * 3500
    const data: SalaryFormInput = {
      employeeId: emp.id,
      baseSalary,
      payFrequency: 'monthly',
      effectiveFrom: '2025-01-01',
      bankAccountLast4: String(1000 + index).slice(-4),
      components: [
        { label: 'Housing Allowance', amount: 800, type: 'earning' },
        { label: 'Transport Allowance', amount: 200, type: 'earning' },
        { label: 'Income Tax', amount: Math.round(baseSalary * 0.12), type: 'deduction' },
        { label: 'Health Insurance', amount: 150, type: 'deduction' },
      ],
    }
    const salary = buildSalaryRecord(`sal-${nextSalaryId++}`, emp, data)
    pfStore.push(createPfRecord(salary))
    return salary
  })

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  salaryStore.slice(0, 6).forEach((salary) => {
    payslipStore.push(buildPayslipFromSalary(salary, month, year, 'processed'))
  })
}

function buildPayslipFromSalary(
  salary: EmployeeSalary,
  month: number,
  year: number,
  status: PayslipStatus,
): Payslip {
  const earnings = salary.components.filter((c) => c.type === 'earning')
  const deductions = salary.components.filter((c) => c.type === 'deduction')
  const pfEmployee = Math.round((salary.netSalary * pfSettings.defaultEmployeeRate) / 100)
  const pfEmployer = Math.round((salary.netSalary * pfSettings.defaultEmployerRate) / 100)
  const monthLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy')

  return PayslipSchema.parse({
    id: `ps-${nextPayslipId++}`,
    companyId: salary.companyId,
    employee: {
      id: salary.employee.id,
      employeeId: salary.employee.employeeId,
      name: salary.employee.name,
      department: salary.employee.department,
      departmentId: salary.employee.departmentId,
      designation: salary.employee.designation,
    },
    payPeriod: { month, year, label: monthLabel },
    baseSalary: salary.baseSalary,
    earnings,
    deductions,
    grossPay: salary.grossSalary,
    totalDeductions: salary.totalDeductions,
    netPay: salary.netSalary,
    pfEmployeeContribution: pfEmployee,
    pfEmployerContribution: pfEmployer,
    status,
    paymentDate: status === 'paid' ? new Date().toISOString().split('T')[0] : null,
    generatedAt: new Date().toISOString().split('T')[0],
  })
}

function computePfSummary(records: ProvidentFundRecord[]): ProvidentFundSummary {
  return ProvidentFundSummarySchema.parse({
    totalEmployees: records.length,
    activeAccounts: records.filter((r) => r.status === 'active').length,
    totalEmployeeContributions: records.reduce((s, r) => s + r.employeeContributionAmount, 0),
    totalEmployerContributions: records.reduce((s, r) => s + r.employerContributionAmount, 0),
    totalFundBalance: records.reduce((s, r) => s + r.totalBalance, 0),
  })
}

seedSalaries()

export async function getEmployeeSalaries(params?: {
  search?: string
  departmentId?: string
  page?: number
  perPage?: number
}) {
  await delay()
  let filtered = filterByCompany([...salaryStore])

  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (s) =>
        s.employee.name.toLowerCase().includes(q) ||
        s.employee.employeeId.toLowerCase().includes(q),
    )
  }

  if (params?.departmentId) {
    filtered = filtered.filter((s) => s.employee.departmentId === params.departmentId)
  }

  const page = params?.page ?? 1
  const perPage = params?.perPage ?? 20
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))

  return SalaryListResponseSchema.parse({
    data: filtered.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    perPage,
    totalPages,
  })
}

export async function getEmployeeSalary(employeeId: string): Promise<EmployeeSalary> {
  await delay()
  const salary = salaryStore.find((s) => s.employee.id === employeeId)
  if (!salary) throw new Error('Salary record not found')
  return salary
}

export async function createEmployeeSalary(data: SalaryFormInput): Promise<EmployeeSalary> {
  await delay()
  if (salaryStore.some((s) => s.employee.id === data.employeeId)) {
    throw new Error('Salary record already exists for this employee')
  }

  const employee = getAllEmployeesForPayroll().find((e) => e.id === data.employeeId)
  if (!employee) throw new Error('Employee not found')

  const salary = buildSalaryRecord(`sal-${nextSalaryId++}`, employee, data)
  salaryStore.push(salary)
  syncPfRecord(salary)
  return salary
}

export async function updateEmployeeSalary(
  id: string,
  data: SalaryFormInput,
): Promise<EmployeeSalary> {
  await delay()
  const index = salaryStore.findIndex((s) => s.id === id)
  if (index === -1) throw new Error('Salary record not found')

  const employee = getAllEmployeesForPayroll().find((e) => e.id === data.employeeId)
  if (!employee) throw new Error('Employee not found')

  const salary = buildSalaryRecord(id, employee, data)
  salaryStore[index] = salary
  syncPfRecord(salary)
  return salary
}

export async function deleteEmployeeSalary(id: string): Promise<void> {
  await delay()
  const salary = salaryStore.find((s) => s.id === id)
  if (!salary) throw new Error('Salary record not found')
  salaryStore = salaryStore.filter((s) => s.id !== id)
  pfStore = pfStore.filter((r) => r.employee.id !== salary.employee.id)
}

export function getEmployeesWithoutSalary() {
  const configured = new Set(salaryStore.map((s) => s.employee.id))
  return getAllEmployeesForPayroll().filter((e) => !configured.has(e.id))
}

export function employeeHasSalaryRecord(employeeId: string): boolean {
  return salaryStore.some((salary) => salary.employee.id === employeeId)
}

export async function getPayslips(params: {
  month?: number
  year?: number
  employeeId?: string
  departmentId?: string
  status?: PayslipStatus
  search?: string
  page?: number
  perPage?: number
}) {
  await delay()
  let filtered = filterByCompany([...payslipStore])

  if (params.month) filtered = filtered.filter((p) => p.payPeriod.month === params.month)
  if (params.year) filtered = filtered.filter((p) => p.payPeriod.year === params.year)
  if (params.employeeId) filtered = filtered.filter((p) => p.employee.id === params.employeeId)
  if (params.departmentId) {
    filtered = filtered.filter((p) => p.employee.departmentId === params.departmentId)
  }
  if (params.status) filtered = filtered.filter((p) => p.status === params.status)
  if (params.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (p) =>
        p.employee.name.toLowerCase().includes(q) ||
        p.employee.employeeId.toLowerCase().includes(q),
    )
  }

  filtered.sort((a, b) => {
    const dateCompare = b.payPeriod.year - a.payPeriod.year || b.payPeriod.month - a.payPeriod.month
    if (dateCompare !== 0) return dateCompare
    return a.employee.name.localeCompare(b.employee.name)
  })

  const page = params.page ?? 1
  const perPage = params.perPage ?? 20
  const total = filtered.length

  return PayslipListResponseSchema.parse({
    data: filtered.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  })
}

export async function getMyPayslips(
  employeeId: string,
  params?: { month?: number; year?: number },
): Promise<Payslip[]> {
  await delay()
  let filtered = filterByCompany(payslipStore).filter((p) => p.employee.id === employeeId)
  if (params?.month) filtered = filtered.filter((p) => p.payPeriod.month === params.month)
  if (params?.year) filtered = filtered.filter((p) => p.payPeriod.year === params.year)
  return filtered.sort(
    (a, b) => b.payPeriod.year - a.payPeriod.year || b.payPeriod.month - a.payPeriod.month,
  )
}

export async function getPayslip(id: string): Promise<Payslip> {
  await delay()
  const payslip = payslipStore.find((p) => p.id === id)
  if (!payslip) throw new Error('Payslip not found')
  return payslip
}

export async function generatePayslips(params: {
  month: number
  year: number
}): Promise<Payslip[]> {
  await delay(500)
  const created: Payslip[] = []

  for (const salary of salaryStore) {
    const exists = payslipStore.some(
      (p) =>
        p.employee.id === salary.employee.id &&
        p.payPeriod.month === params.month &&
        p.payPeriod.year === params.year,
    )
    if (exists) continue

    const payslip = buildPayslipFromSalary(salary, params.month, params.year, 'processed')
    payslipStore.push(payslip)
    created.push(payslip)
  }

  return created
}

export async function downloadPayslip(id: string): Promise<Blob> {
  await delay(300)
  const payslip = payslipStore.find((p) => p.id === id)
  if (!payslip) throw new Error('Payslip not found')

  const rows = [
    ['Field', 'Value'],
    ['Employee', payslip.employee.name],
    ['Employee ID', payslip.employee.employeeId],
    ['Department', payslip.employee.department],
    ['Pay Period', payslip.payPeriod.label],
    ['Base Salary', String(payslip.baseSalary)],
    ['Gross Pay', String(payslip.grossPay)],
    ['Total Deductions', String(payslip.totalDeductions)],
    ['PF Employee', String(payslip.pfEmployeeContribution)],
    ['PF Employer', String(payslip.pfEmployerContribution)],
    ['Net Pay', String(payslip.netPay)],
    ['Status', payslip.status],
  ]

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' })
}

export async function exportPayslips(params: {
  month: number
  year: number
  departmentId?: string
}): Promise<Blob> {
  await delay(400)
  let filtered = payslipStore.filter(
    (p) => p.payPeriod.month === params.month && p.payPeriod.year === params.year,
  )
  if (params.departmentId) {
    filtered = filtered.filter((p) => p.employee.departmentId === params.departmentId)
  }

  const headers = [
    'Employee',
    'Employee ID',
    'Department',
    'Pay Period',
    'Gross Pay',
    'Deductions',
    'Net Pay',
    'Status',
  ]
  const rows = filtered.map((p) =>
    [
      p.employee.name,
      p.employee.employeeId,
      p.employee.department,
      p.payPeriod.label,
      p.grossPay,
      p.totalDeductions,
      p.netPay,
      p.status,
    ]
      .map((c) => `"${String(c)}"`)
      .join(','),
  )

  return new Blob([[headers.join(','), ...rows].join('\n')], {
    type: 'text/csv;charset=utf-8;',
  })
}

export async function markPayslipPaid(id: string): Promise<Payslip> {
  await delay()
  const index = payslipStore.findIndex((p) => p.id === id)
  if (index === -1) throw new Error('Payslip not found')
  if (payslipStore[index].status !== 'processed') {
    throw new Error('Only processed payslips can be marked as paid')
  }

  payslipStore[index] = PayslipSchema.parse({
    ...payslipStore[index],
    status: 'paid',
    paymentDate: new Date().toISOString().split('T')[0],
  })
  return payslipStore[index]
}

export async function getProvidentFundRecords(params?: {
  search?: string
  departmentId?: string
  status?: PfContributionStatus
  page?: number
  perPage?: number
}) {
  await delay()
  let filtered = filterByCompany([...pfStore])

  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.employee.name.toLowerCase().includes(q) ||
        r.employee.employeeId.toLowerCase().includes(q),
    )
  }

  if (params?.departmentId) {
    filtered = filtered.filter((r) => r.employee.departmentId === params.departmentId)
  }

  if (params?.status) {
    filtered = filtered.filter((r) => r.status === params.status)
  }

  const page = params?.page ?? 1
  const perPage = params?.perPage ?? 20
  const total = filtered.length

  return PfListResponseSchema.parse({
    data: filtered.slice((page - 1) * perPage, page * perPage),
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    summary: computePfSummary(filtered),
  })
}

export async function getPfSettings() {
  await delay(150)
  return { ...pfSettings }
}

export async function updatePfSettings(data: PfSettingsFormInput) {
  await delay()
  pfSettings = { ...data }
  return { ...pfSettings }
}

export async function updatePfRecordStatus(
  id: string,
  status: PfContributionStatus,
): Promise<ProvidentFundRecord> {
  await delay()
  const index = pfStore.findIndex((r) => r.id === id)
  if (index === -1) throw new Error('PF record not found')
  pfStore[index] = ProvidentFundRecordSchema.parse({ ...pfStore[index], status })
  return pfStore[index]
}

export async function togglePfRecordStatus(id: string): Promise<ProvidentFundRecord> {
  const record = pfStore.find((r) => r.id === id)
  if (!record) throw new Error('PF record not found')
  const next = record.status === 'active' ? 'paused' : 'active'
  return updatePfRecordStatus(id, next)
}
