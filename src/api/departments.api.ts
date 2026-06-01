import {
  DepartmentSchema,
  type Department,
  type DepartmentFormInput,
} from '../types/department.types'
import {
  departmentStore,
  findDepartment,
} from './org-data'
import { getEmployeeDepartmentCounts, getEmployeePickerOptions } from './employees.api'

const MOCK_DELAY_MS = 400
let nextDeptId = departmentStore.length + 1

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function withCounts(departments: Department[]): Department[] {
  const counts = getEmployeeDepartmentCounts()
  return departments.map((dept) =>
    DepartmentSchema.parse({
      ...dept,
      employeeCount: counts[dept.id] ?? 0,
    }),
  )
}

export async function getDepartments(params?: { search?: string }): Promise<Department[]> {
  await delay()
  let result = withCounts([...departmentStore])

  if (params?.search) {
    const q = params.search.toLowerCase()
    result = result.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.description?.toLowerCase().includes(q),
    )
  }

  return result
}

export async function createDepartment(data: DepartmentFormInput): Promise<Department> {
  await delay()

  const head = data.headEmployeeId
    ? getEmployeePickerOptions().find((e) => e.id === data.headEmployeeId)
    : undefined

  const department: Department = DepartmentSchema.parse({
    id: `dept-${nextDeptId++}`,
    name: data.name,
    description: data.description,
    headEmployee: head
      ? { id: head.id, name: head.name, avatarUrl: head.avatarUrl }
      : undefined,
    employeeCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  })

  departmentStore.push(department)
  return withCounts([department])[0]
}

export async function updateDepartment(
  id: string,
  data: DepartmentFormInput,
): Promise<Department> {
  await delay()

  const index = departmentStore.findIndex((d) => d.id === id)
  if (index === -1) throw new Error('Department not found')

  const head = data.headEmployeeId
    ? getEmployeePickerOptions().find((e) => e.id === data.headEmployeeId)
    : undefined

  departmentStore[index] = DepartmentSchema.parse({
    ...departmentStore[index],
    name: data.name,
    description: data.description,
    headEmployee: data.headEmployeeId
      ? head
        ? { id: head.id, name: head.name, avatarUrl: head.avatarUrl }
        : undefined
      : undefined,
  })

  return withCounts([departmentStore[index]])[0]
}

export async function deleteDepartment(id: string): Promise<void> {
  await delay()
  const counts = getEmployeeDepartmentCounts()
  if ((counts[id] ?? 0) > 0) {
    throw new Error('Cannot delete department with assigned employees')
  }
  const index = departmentStore.findIndex((d) => d.id === id)
  if (index === -1) throw new Error('Department not found')
  departmentStore.splice(index, 1)
}

export { findDepartment }
