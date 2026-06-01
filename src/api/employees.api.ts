import {
  EmployeeDetailSchema,
  EmployeeListResponseSchema,
  EmployeeSchema,
  type Employee,
  type EmployeeDetail,
  type EmployeeFormInput,
  type EmployeeListResponse,
  type EmployeeStatus,
} from '../types/employee.types'
import {
  findDepartment,
  findDesignation,
  getDepartmentOptions,
  getDesignationOptions,
} from './org-data'
import {
  assertCompanyAccess,
  filterByCompany,
  getActiveCompanyIdSync,
} from '../utils/company-context.utils'

const MOCK_DELAY_MS = 400

const DETAIL_EXTRAS: Record<string, Omit<EmployeeDetail, keyof Employee>> = {
  'usr-employee-1': {
    personal: {
      dateOfBirth: '1992-04-18',
      gender: 'female',
      maritalStatus: 'single',
      nationality: 'American',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      country: 'USA',
      emergencyContact: {
        name: 'John Employee',
        relationship: 'Brother',
        phone: '+1 555-0100',
      },
    },
    work: {
      employeeType: 'full_time',
      workLocation: 'hybrid',
      probationEndDate: '2023-07-15',
      reportingManager: { id: 'usr-admin-1', name: 'HR Admin' },
      shift: 'Day Shift (9 AM – 6 PM)',
    },
    documents: [
      {
        id: 'doc-1',
        name: 'Employment Contract',
        type: 'PDF',
        uploadedAt: '2023-01-15',
        url: '#',
      },
      {
        id: 'doc-2',
        name: 'ID Proof',
        type: 'PDF',
        uploadedAt: '2023-01-16',
        url: '#',
      },
    ],
    assets: [
      {
        id: 'asset-1',
        name: 'MacBook Pro 14"',
        assetId: 'AST-1024',
        category: 'Laptop',
        assignedDate: '2023-01-20',
        status: 'assigned',
      },
    ],
    timeline: [
      {
        id: 'tl-1',
        event: 'Joined Company',
        description: 'Started as Software Engineer',
        date: '2023-01-15',
        type: 'joined',
      },
      {
        id: 'tl-2',
        event: 'Completed Probation',
        date: '2023-07-15',
        type: 'other',
      },
    ],
  },
}

function defaultDetailExtras(employee: Employee): Omit<EmployeeDetail, keyof Employee> {
  return (
    DETAIL_EXTRAS[employee.id] ?? {
      personal: {
        dateOfBirth: '1990-06-01',
        gender: 'other',
        maritalStatus: 'single',
        nationality: 'American',
        address: '100 Main Street',
        city: 'New York',
        country: 'USA',
      },
      work: {
        employeeType: 'full_time',
        workLocation: 'office',
        reportingManager: employee.managerId
          ? { id: employee.managerId, name: employee.managerName ?? 'Manager' }
          : undefined,
        shift: 'Day Shift (9 AM – 6 PM)',
      },
      documents: [],
      assets: [],
      timeline: [
        {
          id: `tl-${employee.id}-join`,
          event: 'Joined Company',
          date: employee.joinDate,
          type: 'joined',
        },
      ],
    }
  )
}

function createMockEmployees(): EmployeeDetail[] {
  const seeds: Array<Omit<Employee, 'id' | 'employeeId' | 'fullName' | 'companyId'> & { id?: string }> = [
    {
      id: 'usr-employee-1',
      firstName: 'Jane',
      lastName: 'Employee',
      email: 'employee@smarthr.com',
      phone: '+1 555-1001',
      department: { id: 'dept-1', name: 'Engineering' },
      designation: { id: 'des-1', name: 'Software Engineer' },
      role: 'employee',
      status: 'active',
      joinDate: '2023-01-15',
      managerId: 'usr-admin-1',
      managerName: 'HR Admin',
      location: 'New York',
    },
    {
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@smarthr.com',
      phone: '+1 555-1002',
      department: { id: 'dept-1', name: 'Engineering' },
      designation: { id: 'des-2', name: 'Senior Developer' },
      role: 'employee',
      status: 'active',
      joinDate: '2022-03-10',
      managerId: 'usr-admin-1',
      managerName: 'HR Admin',
      location: 'San Francisco',
    },
    {
      firstName: 'Michael',
      lastName: 'Torres',
      email: 'michael.torres@smarthr.com',
      department: { id: 'dept-3', name: 'Marketing' },
      designation: { id: 'des-5', name: 'Marketing Lead' },
      role: 'employee',
      status: 'active',
      joinDate: '2021-08-22',
      location: 'Chicago',
    },
    {
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@smarthr.com',
      department: { id: 'dept-2', name: 'HR' },
      designation: { id: 'des-3', name: 'HR Manager' },
      role: 'hr_admin',
      status: 'active',
      joinDate: '2020-05-01',
      location: 'Boston',
    },
    {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@smarthr.com',
      department: { id: 'dept-4', name: 'Finance' },
      designation: { id: 'des-6', name: 'Accountant' },
      role: 'employee',
      status: 'on_leave',
      joinDate: '2019-11-18',
      location: 'Austin',
    },
    {
      firstName: 'Lisa',
      lastName: 'Park',
      email: 'lisa.park@smarthr.com',
      department: { id: 'dept-5', name: 'Design' },
      designation: { id: 'des-7', name: 'UI Designer' },
      role: 'employee',
      status: 'active',
      joinDate: '2022-09-05',
      location: 'Seattle',
    },
    {
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@smarthr.com',
      department: { id: 'dept-1', name: 'Engineering' },
      designation: { id: 'des-1', name: 'Software Engineer' },
      role: 'employee',
      status: 'inactive',
      joinDate: '2021-02-14',
      location: 'Remote',
    },
    {
      firstName: 'Anna',
      lastName: 'Martinez',
      email: 'anna.martinez@smarthr.com',
      department: { id: 'dept-2', name: 'HR' },
      designation: { id: 'des-4', name: 'Recruiter' },
      role: 'employee',
      status: 'active',
      joinDate: '2023-06-01',
      location: 'Miami',
    },
    {
      firstName: 'Robert',
      lastName: 'Brown',
      email: 'robert.brown@smarthr.com',
      department: { id: 'dept-4', name: 'Finance' },
      designation: { id: 'des-6', name: 'Accountant' },
      role: 'employee',
      status: 'terminated',
      joinDate: '2018-04-12',
      location: 'Denver',
    },
    {
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@smarthr.com',
      department: { id: 'dept-1', name: 'Engineering' },
      designation: { id: 'des-2', name: 'Senior Developer' },
      role: 'employee',
      status: 'active',
      joinDate: '2020-10-30',
      location: 'Portland',
    },
  ]

  const deptOptions = getDepartmentOptions('co-1')
  const desigOptions = getDesignationOptions('co-1')
  const extras = [
    { firstName: 'Chris', lastName: 'Evans', department: deptOptions[0], designation: desigOptions[0] },
    { firstName: 'Nina', lastName: 'Patel', department: deptOptions[2], designation: desigOptions[4] },
    { firstName: 'Tom', lastName: 'Hardy', department: deptOptions[4], designation: desigOptions[6] },
    { firstName: 'Olivia', lastName: 'White', department: deptOptions[1], designation: desigOptions[3] },
    { firstName: 'Ethan', lastName: 'Clark', department: deptOptions[0], designation: desigOptions[1] },
    { firstName: 'Sophia', lastName: 'Lee', department: deptOptions[3], designation: desigOptions[5] },
    { firstName: 'Daniel', lastName: 'Nguyen', department: deptOptions[0], designation: desigOptions[0] },
    { firstName: 'Grace', lastName: 'Hall', department: deptOptions[2], designation: desigOptions[4] },
    { firstName: 'Marcus', lastName: 'Young', department: deptOptions[1], designation: desigOptions[2] },
    { firstName: 'Hannah', lastName: 'Scott', department: deptOptions[4], designation: desigOptions[6] },
  ]

  extras.forEach((item, index) => {
    seeds.push({
      firstName: item.firstName,
      lastName: item.lastName,
      email: `${item.firstName.toLowerCase()}.${item.lastName.toLowerCase()}@smarthr.com`,
      department: item.department,
      designation: item.designation,
      role: 'employee',
      status: index % 4 === 0 ? 'on_leave' : 'active',
      joinDate: `202${index % 4}-${String((index % 12) + 1).padStart(2, '0')}-15`,
      location: 'Remote',
    })
  })

  return seeds.map((seed, index) => {
    const id = seed.id ?? `emp-${index + 1}`
    const employee: Employee = EmployeeSchema.parse({
      ...seed,
      id,
      companyId: 'co-1',
      employeeId: `EMP-${String(index + 1).padStart(3, '0')}`,
      fullName: `${seed.firstName} ${seed.lastName}`,
    })
    return EmployeeDetailSchema.parse({
      ...employee,
      ...defaultDetailExtras(employee),
    })
  })
}

function createAcmeEmployees(): EmployeeDetail[] {
  const seeds: Array<Omit<Employee, 'id' | 'employeeId' | 'fullName' | 'companyId'> & { id: string }> = [
    {
      id: 'usr-co2-admin',
      firstName: 'Alex',
      lastName: 'Admin',
      email: 'admin@acme.com',
      phone: '+1 555-2001',
      department: { id: 'dept-co2-2', name: 'Sales' },
      designation: { id: 'des-co2-2', name: 'Sales Representative' },
      role: 'hr_admin',
      status: 'active',
      joinDate: '2025-06-01',
      location: 'Austin',
    },
    {
      id: 'usr-co2-employee-1',
      firstName: 'Bob',
      lastName: 'Builder',
      email: 'employee@acme.com',
      phone: '+1 555-2002',
      department: { id: 'dept-co2-1', name: 'Engineering' },
      designation: { id: 'des-co2-1', name: 'Engineer' },
      role: 'employee',
      status: 'active',
      joinDate: '2025-07-01',
      managerId: 'usr-co2-admin',
      managerName: 'Alex Admin',
      location: 'Austin',
    },
    {
      id: 'emp-co2-3',
      firstName: 'Carla',
      lastName: 'Nguyen',
      email: 'carla.nguyen@acme.com',
      department: { id: 'dept-co2-1', name: 'Engineering' },
      designation: { id: 'des-co2-1', name: 'Engineer' },
      role: 'employee',
      status: 'active',
      joinDate: '2025-08-15',
      managerId: 'usr-co2-admin',
      managerName: 'Alex Admin',
      location: 'Remote',
    },
  ]

  return seeds.map((seed, index) => {
    const employee: Employee = EmployeeSchema.parse({
      ...seed,
      companyId: 'co-2',
      employeeId: `ACM-${String(index + 1).padStart(3, '0')}`,
      fullName: `${seed.firstName} ${seed.lastName}`,
    })
    return EmployeeDetailSchema.parse({
      ...employee,
      ...defaultDetailExtras(employee),
    })
  })
}

function assignOrgHierarchy(employees: EmployeeDetail[]): EmployeeDetail[] {
  const findByName = (firstName: string, lastName: string) =>
    employees.find((employee) => employee.firstName === firstName && employee.lastName === lastName)

  const emily = findByName('Emily', 'Davis')
  const sarah = findByName('Sarah', 'Chen')
  const michael = findByName('Michael', 'Torres')
  const anna = findByName('Anna', 'Martinez')
  const jane = employees.find((employee) => employee.id === 'usr-employee-1')
  const priya = findByName('Priya', 'Sharma')
  const david = findByName('David', 'Kim')
  const chris = findByName('Chris', 'Evans')
  const ethan = findByName('Ethan', 'Clark')
  const lisa = findByName('Lisa', 'Park')
  const james = findByName('James', 'Wilson')
  const robert = findByName('Robert', 'Brown')
  const marcus = findByName('Marcus', 'Young')

  const links: Array<[EmployeeDetail | undefined, EmployeeDetail | undefined]> = [
    [sarah, emily],
    [michael, emily],
    [anna, emily],
    [marcus, emily],
    [jane, sarah],
    [priya, sarah],
    [david, sarah],
    [ethan, sarah],
    [chris, jane],
    [lisa, michael],
    [james, anna],
    [robert, emily],
  ]

  for (const [employee, manager] of links) {
    if (!employee || !manager) continue
    employee.managerId = manager.id
    employee.managerName = manager.fullName
    if (employee.work) {
      employee.work.reportingManager = { id: manager.id, name: manager.fullName }
    }
  }

  return employees
}

function createMockEmployeesWithHierarchy(): EmployeeDetail[] {
  return assignOrgHierarchy([...createMockEmployees(), ...createAcmeEmployees()])
}

let employeeStore: EmployeeDetail[] = createMockEmployeesWithHierarchy()
let nextId = employeeStore.length + 1

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toEmployee(detail: EmployeeDetail): Employee {
  return EmployeeSchema.parse(detail)
}

function companyEmployees(companyId = getActiveCompanyIdSync()): EmployeeDetail[] {
  return filterByCompany(employeeStore, companyId)
}

export async function getEmployees(params: {
  page?: number
  perPage?: number
  search?: string
  departmentId?: string
  status?: EmployeeStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}): Promise<EmployeeListResponse> {
  await delay()

  const page = params.page ?? 1
  const perPage = params.perPage ?? 20
  let filtered = [...companyEmployees()]

  if (params.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q),
    )
  }

  if (params.departmentId) {
    filtered = filtered.filter((e) => e.department.id === params.departmentId)
  }

  if (params.status) {
    filtered = filtered.filter((e) => e.status === params.status)
  }

  const sortBy = params.sortBy ?? 'fullName'
  const sortOrder = params.sortOrder ?? 'asc'
  filtered.sort((a, b) => {
    const aVal = String(a[sortBy as keyof Employee] ?? '')
    const bVal = String(b[sortBy as keyof Employee] ?? '')
    return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  const data = filtered.slice(start, start + perPage).map(toEmployee)

  return EmployeeListResponseSchema.parse({
    data,
    total,
    page,
    perPage,
    totalPages,
  })
}

export async function getEmployee(id: string): Promise<EmployeeDetail> {
  await delay()
  const employee = companyEmployees().find((e) => e.id === id)
  if (!employee) {
    throw new Error('Employee not found')
  }
  assertCompanyAccess(employee.companyId)
  return EmployeeDetailSchema.parse(employee)
}

export function getEmployeeByIdSync(id: string): EmployeeDetail | undefined {
  return employeeStore.find((employee) => employee.id === id)
}

export function getEmployeeLinkOptions(): Array<{
  id: string
  name: string
  employeeId: string
}> {
  return companyEmployees().map((employee) => ({
    id: employee.id,
    name: employee.fullName,
    employeeId: employee.employeeId,
  }))
}

export async function createEmployee(data: EmployeeFormInput): Promise<Employee> {
  await delay()

  const department = findDepartment(data.departmentId)
  const designation = findDesignation(data.designationId)
  if (!department || !designation) {
    throw new Error('Invalid department or designation')
  }

  const manager = data.managerId
    ? employeeStore.find((e) => e.id === data.managerId)
    : undefined

  const id = `emp-${nextId}`
  const employeeId = `EMP-${String(nextId).padStart(3, '0')}`
  nextId += 1

  const base: Employee = EmployeeSchema.parse({
    id,
    companyId: getActiveCompanyIdSync(),
    employeeId,
    firstName: data.firstName,
    lastName: data.lastName,
    fullName: `${data.firstName} ${data.lastName}`,
    email: data.email,
    phone: data.phone,
    department: { id: department.id, name: department.name },
    designation: { id: designation.id, name: designation.name },
    role: data.role,
    status: 'active',
    joinDate: data.joinDate,
    managerId: data.managerId,
    managerName: manager?.fullName,
    location: data.location,
  })

  const detail: EmployeeDetail = EmployeeDetailSchema.parse({
    ...base,
    ...defaultDetailExtras(base),
  })

  employeeStore = [detail, ...employeeStore]
  return toEmployee(detail)
}

export async function updateEmployee(
  id: string,
  data: Partial<EmployeeFormInput>,
): Promise<Employee> {
  await delay()

  const index = employeeStore.findIndex((e) => e.id === id)
  if (index === -1) throw new Error('Employee not found')
  assertCompanyAccess(employeeStore[index].companyId)

  const current = employeeStore[index]
  const department = data.departmentId ? findDepartment(data.departmentId) : undefined
  const designation = data.designationId ? findDesignation(data.designationId) : undefined
  const manager = data.managerId
    ? employeeStore.find((e) => e.id === data.managerId)
    : undefined

  const updated: EmployeeDetail = EmployeeDetailSchema.parse({
    ...current,
    firstName: data.firstName ?? current.firstName,
    lastName: data.lastName ?? current.lastName,
    fullName:
      data.firstName || data.lastName
        ? `${data.firstName ?? current.firstName} ${data.lastName ?? current.lastName}`
        : current.fullName,
    email: data.email ?? current.email,
    phone: data.phone ?? current.phone,
    department: department
      ? { id: department.id, name: department.name }
      : current.department,
    designation: designation
      ? { id: designation.id, name: designation.name }
      : current.designation,
    role: data.role ?? current.role,
    joinDate: data.joinDate ?? current.joinDate,
    location: data.location ?? current.location,
    managerId: data.managerId ?? current.managerId,
    managerName: manager?.fullName ?? current.managerName,
  })

  employeeStore[index] = updated
  return toEmployee(updated)
}

export async function deleteEmployee(id: string): Promise<void> {
  await delay()
  const employee = employeeStore.find((e) => e.id === id)
  if (!employee) throw new Error('Employee not found')
  assertCompanyAccess(employee.companyId)
  employeeStore = employeeStore.filter((e) => e.id !== id)
}

export async function updateEmployeePersonal(
  id: string,
  data: Partial<EmployeeDetail['personal']>,
): Promise<EmployeeDetail> {
  await delay()
  const index = employeeStore.findIndex((e) => e.id === id)
  if (index === -1) throw new Error('Employee not found')
  employeeStore[index] = EmployeeDetailSchema.parse({
    ...employeeStore[index],
    personal: { ...employeeStore[index].personal, ...data },
  })
  return employeeStore[index]
}

export async function updateEmployeeWork(
  id: string,
  data: Partial<EmployeeDetail['work']>,
): Promise<EmployeeDetail> {
  await delay()
  const index = employeeStore.findIndex((e) => e.id === id)
  if (index === -1) throw new Error('Employee not found')
  employeeStore[index] = EmployeeDetailSchema.parse({
    ...employeeStore[index],
    work: { ...employeeStore[index].work, ...data },
  })
  return employeeStore[index]
}

export async function addEmployeeDocument(
  id: string,
  doc: { name: string; type: string },
): Promise<EmployeeDetail> {
  await delay()
  const index = employeeStore.findIndex((e) => e.id === id)
  if (index === -1) throw new Error('Employee not found')
  const newDoc = {
    id: `doc-${Date.now()}`,
    name: doc.name,
    type: doc.type,
    uploadedAt: new Date().toISOString().split('T')[0],
    url: '#',
  }
  employeeStore[index] = EmployeeDetailSchema.parse({
    ...employeeStore[index],
    documents: [...employeeStore[index].documents, newDoc],
  })
  return employeeStore[index]
}

export async function deleteEmployeeDocument(
  id: string,
  docId: string,
): Promise<EmployeeDetail> {
  await delay()
  const index = employeeStore.findIndex((e) => e.id === id)
  if (index === -1) throw new Error('Employee not found')
  employeeStore[index] = EmployeeDetailSchema.parse({
    ...employeeStore[index],
    documents: employeeStore[index].documents.filter((d) => d.id !== docId),
  })
  return employeeStore[index]
}

export { getDepartmentOptions, getDesignationOptions }

export function getEmployeeDepartmentCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const employee of companyEmployees()) {
    counts[employee.department.id] = (counts[employee.department.id] ?? 0) + 1
  }
  return counts
}

export function getEmployeeRoleCounts(): Record<
  'super_admin' | 'hr_admin' | 'employee',
  number
> {
  const counts = { super_admin: 0, hr_admin: 0, employee: 0 }
  for (const employee of companyEmployees()) {
    counts[employee.role]++
  }
  return counts
}

export function getEmployeeDesignationCounts(): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const employee of companyEmployees()) {
    counts[employee.designation.id] = (counts[employee.designation.id] ?? 0) + 1
  }
  return counts
}

export function getEmployeePickerOptions(): Array<{
  id: string
  name: string
  avatarUrl?: string
}> {
  return companyEmployees().map((e) => ({
    id: e.id,
    name: e.fullName,
    avatarUrl: e.avatarUrl,
  }))
}

export function getAdminAssigneeOptions(): Array<{
  id: string
  name: string
  avatarUrl?: string
}> {
  return companyEmployees()
    .filter((e) => e.role === 'hr_admin' || e.role === 'super_admin')
    .map((e) => ({ id: e.id, name: e.fullName, avatarUrl: e.avatarUrl }))
}

export function getAllEmployeesForAttendance(): Array<{
  id: string
  employeeId: string
  fullName: string
  avatarUrl?: string
  departmentId: string
  departmentName: string
  companyId: string
}> {
  return companyEmployees().map((e) => ({
    id: e.id,
    employeeId: e.employeeId,
    fullName: e.fullName,
    avatarUrl: e.avatarUrl,
    departmentId: e.department.id,
    departmentName: e.department.name,
    companyId: e.companyId,
  }))
}

export function getAllEmployeesForPayroll(companyId?: string): Array<{
  id: string
  employeeId: string
  fullName: string
  avatarUrl?: string
  departmentId: string
  departmentName: string
  designationName: string
  companyId: string
}> {
  return companyEmployees(companyId).map((e) => ({
    id: e.id,
    employeeId: e.employeeId,
    fullName: e.fullName,
    avatarUrl: e.avatarUrl,
    departmentId: e.department.id,
    departmentName: e.department.name,
    designationName: e.designation.name,
    companyId: e.companyId,
  }))
}

export function getAllEmployeesForOrgChart(): Array<{
  id: string
  employeeId: string
  fullName: string
  avatarUrl?: string
  designationName: string
  departmentId: string
  departmentName: string
  managerId?: string
  managerName?: string
  status: EmployeeStatus
}> {
  return companyEmployees().map((employee) => ({
    id: employee.id,
    employeeId: employee.employeeId,
    fullName: employee.fullName,
    avatarUrl: employee.avatarUrl,
    designationName: employee.designation.name,
    departmentId: employee.department.id,
    departmentName: employee.department.name,
    managerId: employee.managerId,
    managerName: employee.managerName,
    status: employee.status,
  }))
}

export function getManagerOptions(): Array<{ id: string; name: string }> {
  return companyEmployees().map((e) => ({ id: e.id, name: e.fullName }))
}
