import {
  BankAccountFormSchema,
  BankAccountListResponseSchema,
  BankAccountSchema,
  type BankAccount,
  type BankAccountFormInput,
  type BankAccountListResponse,
  type BankAccountStatus,
  type BankAccountUpdateFormInput,
} from '../types/bank-account.types'
import { getAllEmployeesForPayroll } from './employees.api'
import { employeeHasSalaryRecord } from './payroll.api'

const MOCK_DELAY_MS = 350

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function maskAccountNumber(accountNumber: string): string {
  const digits = accountNumber.replace(/\D/g, '')
  if (digits.length < 4) return '****'
  return `****${digits.slice(-4)}`
}

function buildEmployeeRef(employeeId: string) {
  const employee = getAllEmployeesForPayroll().find((item) => item.id === employeeId)
  if (!employee) {
    throw new Error('Employee not found')
  }
  return {
    id: employee.id,
    employeeId: employee.employeeId,
    name: employee.fullName,
    avatarUrl: employee.avatarUrl,
    department: employee.departmentName,
  }
}

function createSeedAccounts(): BankAccount[] {
  const employees = getAllEmployeesForPayroll().slice(0, 10)
  const banks = ['Chase Bank', 'Bank of America', 'Wells Fargo', 'Citibank']
  const now = '2026-01-15T00:00:00.000Z'

  return employees.flatMap((employee, index) => {
    const accounts: BankAccount[] = []
    const primary = BankAccountSchema.parse({
      id: `ba-${index + 1}-1`,
      companyId: employee.companyId,
      employee: {
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.fullName,
        avatarUrl: employee.avatarUrl,
        department: employee.departmentName,
      },
      accountHolderName: employee.fullName,
      bankName: banks[index % banks.length],
      accountType: index % 3 === 0 ? 'savings' : 'checking',
      accountNumberMasked: `****${String(4820 + index).slice(-4)}`,
      routingNumber: `0210000${String(21 + index).padStart(2, '0')}`,
      isPrimary: true,
      status: 'active',
      verifiedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    accounts.push(primary)

    if (index % 4 === 0) {
      accounts.push(
        BankAccountSchema.parse({
          id: `ba-${index + 1}-2`,
          companyId: employee.companyId,
          employee: primary.employee,
          accountHolderName: employee.fullName,
          bankName: banks[(index + 1) % banks.length],
          accountType: 'checking',
          accountNumberMasked: `****${String(9000 + index).slice(-4)}`,
          routingNumber: `0114015${String(33 + index).padStart(2, '0')}`,
          isPrimary: false,
          status: 'active',
          verifiedAt: now,
          createdAt: now,
          updatedAt: now,
        }),
      )
    }

    return accounts
  })
}

let accountStore: BankAccount[] = createSeedAccounts()

function clearPrimaryForEmployee(employeeId: string, exceptId?: string) {
  accountStore = accountStore.map((account) => {
    if (account.employee.id !== employeeId || account.id === exceptId) return account
    return { ...account, isPrimary: false }
  })
}

function promoteNextPrimary(employeeId: string) {
  const next = accountStore.find(
    (account) =>
      account.employee.id === employeeId &&
      account.status === 'active' &&
      !account.isPrimary,
  )
  if (next) {
    accountStore = accountStore.map((account) =>
      account.id === next.id ? { ...account, isPrimary: true } : account,
    )
  }
}

function filterAccounts(params?: {
  search?: string
  employeeId?: string
  departmentId?: string
  status?: BankAccountStatus
}): BankAccount[] {
  let filtered = [...accountStore]
  const search = params?.search?.trim().toLowerCase()

  if (search) {
    filtered = filtered.filter(
      (account) =>
        account.employee.name.toLowerCase().includes(search) ||
        account.bankName.toLowerCase().includes(search) ||
        account.accountNumberMasked.includes(search) ||
        account.accountHolderName.toLowerCase().includes(search),
    )
  }

  if (params?.employeeId) {
    filtered = filtered.filter((account) => account.employee.id === params.employeeId)
  }

  if (params?.departmentId) {
    const employees = getAllEmployeesForPayroll()
    const names = new Set(
      employees
        .filter((employee) => employee.departmentId === params.departmentId)
        .map((employee) => employee.departmentName),
    )
    filtered = filtered.filter((account) => names.has(account.employee.department))
  }

  if (params?.status) {
    filtered = filtered.filter((account) => account.status === params.status)
  }

  filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  return filtered
}

function paginate(
  accounts: BankAccount[],
  page: number,
  perPage: number,
): BankAccountListResponse {
  const total = accounts.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * perPage

  return BankAccountListResponseSchema.parse({
    data: accounts.slice(start, start + perPage),
    total,
    page: safePage,
    perPage,
    totalPages,
  })
}

export const BANK_ACCOUNTS_QUERY_KEY = ['bank-accounts'] as const

export function getPrimaryBankAccountSync(employeeId: string): BankAccount | null {
  const account = accountStore.find(
    (item) =>
      item.employee.id === employeeId && item.isPrimary && item.status === 'active',
  )
  return account ? BankAccountSchema.parse(account) : null
}

export async function getBankAccounts(params?: {
  search?: string
  employeeId?: string
  departmentId?: string
  status?: BankAccountStatus
  page?: number
  perPage?: number
}): Promise<BankAccountListResponse> {
  await delay()
  const filtered = filterAccounts(params)
  return paginate(filtered, params?.page ?? 1, params?.perPage ?? 10)
}

export async function getMyBankAccounts(employeeId: string): Promise<BankAccount[]> {
  await delay()
  return filterAccounts({ employeeId }).map((account) => BankAccountSchema.parse(account))
}

export async function getBankAccount(id: string): Promise<BankAccount> {
  await delay()
  const account = accountStore.find((item) => item.id === id)
  if (!account) throw new Error('Bank account not found')
  return BankAccountSchema.parse(account)
}

export async function getPrimaryBankAccount(employeeId: string): Promise<BankAccount | null> {
  await delay(150)
  return getPrimaryBankAccountSync(employeeId)
}

export async function createBankAccount(
  data: BankAccountFormInput,
  options?: { createdByEmployee?: boolean },
): Promise<BankAccount> {
  await delay()

  const parsed = BankAccountFormSchema.parse(data)
  const payrollEmployee = getAllEmployeesForPayroll().find((item) => item.id === parsed.employeeId)
  if (!payrollEmployee) throw new Error('Employee not found')
  const employee = buildEmployeeRef(parsed.employeeId)
  const now = new Date().toISOString()
  const status: BankAccountStatus =
    parsed.status ?? (options?.createdByEmployee ? 'pending_verification' : 'active')

  if (parsed.isPrimary) {
    clearPrimaryForEmployee(parsed.employeeId)
  }

  let isPrimary = parsed.isPrimary ?? false
  if (
    !isPrimary &&
    !accountStore.some(
      (account) => account.employee.id === parsed.employeeId && account.isPrimary,
    )
  ) {
    isPrimary = true
  }

  const created = BankAccountSchema.parse({
    id: `ba-${Date.now()}`,
    companyId: payrollEmployee.companyId,
    employee,
    accountHolderName: parsed.accountHolderName,
    bankName: parsed.bankName,
    accountType: parsed.accountType,
    accountNumberMasked: maskAccountNumber(parsed.accountNumber),
    routingNumber: parsed.routingNumber,
    isPrimary,
    status,
    verifiedAt: status === 'active' ? now : undefined,
    createdAt: now,
    updatedAt: now,
  })

  accountStore.unshift(created)
  return created
}

export async function updateBankAccount(
  id: string,
  data: BankAccountUpdateFormInput,
): Promise<BankAccount> {
  await delay()

  const index = accountStore.findIndex((account) => account.id === id)
  if (index === -1) throw new Error('Bank account not found')

  const current = accountStore[index]
  const employeeId = data.employeeId ?? current.employee.id

  if (data.isPrimary) {
    clearPrimaryForEmployee(employeeId, id)
  }

  const nextStatus = data.status ?? current.status
  const updated = BankAccountSchema.parse({
    ...current,
    employee: data.employeeId ? buildEmployeeRef(data.employeeId) : current.employee,
    accountHolderName: data.accountHolderName ?? current.accountHolderName,
    bankName: data.bankName ?? current.bankName,
    accountType: data.accountType ?? current.accountType,
    accountNumberMasked: data.accountNumber
      ? maskAccountNumber(data.accountNumber)
      : current.accountNumberMasked,
    routingNumber: data.routingNumber ?? current.routingNumber,
    isPrimary: data.isPrimary ?? current.isPrimary,
    status: nextStatus,
    verifiedAt:
      nextStatus === 'active' && !current.verifiedAt
        ? new Date().toISOString()
        : current.verifiedAt,
    updatedAt: new Date().toISOString(),
  })

  accountStore[index] = updated
  return updated
}

export async function setPrimaryBankAccount(id: string): Promise<BankAccount> {
  await delay()

  const account = accountStore.find((item) => item.id === id)
  if (!account) throw new Error('Bank account not found')
  if (account.status !== 'active') {
    throw new Error('Only active accounts can be set as primary')
  }

  clearPrimaryForEmployee(account.employee.id, id)
  const index = accountStore.findIndex((item) => item.id === id)
  accountStore[index] = {
    ...accountStore[index],
    isPrimary: true,
    updatedAt: new Date().toISOString(),
  }
  return BankAccountSchema.parse(accountStore[index])
}

export async function deactivateBankAccount(id: string): Promise<BankAccount> {
  await delay()

  const index = accountStore.findIndex((account) => account.id === id)
  if (index === -1) throw new Error('Bank account not found')

  const current = accountStore[index]
  const wasPrimary = current.isPrimary

  accountStore[index] = BankAccountSchema.parse({
    ...current,
    status: 'inactive',
    isPrimary: false,
    updatedAt: new Date().toISOString(),
  })

  if (wasPrimary) {
    promoteNextPrimary(current.employee.id)
  }

  return accountStore[index]
}

export async function deleteBankAccount(id: string): Promise<void> {
  await delay()

  const account = accountStore.find((item) => item.id === id)
  if (!account) throw new Error('Bank account not found')

  const employeeAccounts = accountStore.filter(
    (item) => item.employee.id === account.employee.id,
  )
  const activeAccounts = employeeAccounts.filter((item) => item.status !== 'inactive')

  if (
    account.isPrimary &&
    activeAccounts.length <= 1 &&
    employeeHasSalaryRecord(account.employee.id)
  ) {
    throw new Error(
      'Cannot delete the only active bank account for an employee with a salary record',
    )
  }

  const wasPrimary = account.isPrimary
  const employeeId = account.employee.id
  accountStore = accountStore.filter((item) => item.id !== id)

  if (wasPrimary) {
    promoteNextPrimary(employeeId)
  }
}

export function getEmployeePickerForBankAccounts(): Array<{
  id: string
  employeeId: string
  fullName: string
}> {
  return getAllEmployeesForPayroll().map((employee) => ({
    id: employee.id,
    employeeId: employee.employeeId,
    fullName: employee.fullName,
  }))
}
