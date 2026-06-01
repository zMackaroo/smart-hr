import {
  designationStore,
  findDepartment,
  findDesignation,
} from './org-data'
import { getEmployeeDesignationCounts } from './employees.api'
import {
  DesignationSchema,
  type Designation,
  type DesignationFormInput,
} from '../types/designation.types'
import {
  assertCompanyAccess,
  filterByCompany,
  getActiveCompanyIdSync,
} from '../utils/company-context.utils'

const MOCK_DELAY_MS = 400
let nextDesId = designationStore.length + 1

function delay(ms = MOCK_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function withCounts(designations: Designation[]): Designation[] {
  const counts = getEmployeeDesignationCounts()
  return designations.map((des) =>
    DesignationSchema.parse({
      ...des,
      employeeCount: counts[des.id] ?? 0,
    }),
  )
}

export async function getDesignations(params?: {
  search?: string
  departmentId?: string
}): Promise<Designation[]> {
  await delay()
  let result = withCounts(filterByCompany(designationStore))

  if (params?.search) {
    const q = params.search.toLowerCase()
    result = result.filter((d) => d.name.toLowerCase().includes(q))
  }

  if (params?.departmentId) {
    result = result.filter((d) => d.department?.id === params.departmentId)
  }

  return result
}

export async function createDesignation(data: DesignationFormInput): Promise<Designation> {
  await delay()

  const companyId = getActiveCompanyIdSync()
  const department = data.departmentId ? findDepartment(data.departmentId) : undefined

  const designation: Designation = DesignationSchema.parse({
    id: `des-${nextDesId++}`,
    companyId,
    name: data.name,
    department: department ? { id: department.id, name: department.name } : undefined,
    employeeCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
  })

  designationStore.push(designation)
  return withCounts([designation])[0]
}

export async function updateDesignation(
  id: string,
  data: DesignationFormInput,
): Promise<Designation> {
  await delay()

  const index = designationStore.findIndex((d) => d.id === id)
  if (index === -1) throw new Error('Designation not found')
  assertCompanyAccess(designationStore[index].companyId)

  const department = data.departmentId ? findDepartment(data.departmentId) : undefined

  designationStore[index] = DesignationSchema.parse({
    ...designationStore[index],
    name: data.name,
    department: data.departmentId
      ? department
        ? { id: department.id, name: department.name }
        : undefined
      : undefined,
  })

  return withCounts([designationStore[index]])[0]
}

export async function deleteDesignation(id: string): Promise<void> {
  await delay()
  const index = designationStore.findIndex((d) => d.id === id)
  if (index === -1) throw new Error('Designation not found')
  assertCompanyAccess(designationStore[index].companyId)

  const counts = getEmployeeDesignationCounts()
  if ((counts[id] ?? 0) > 0) {
    throw new Error('Cannot delete designation with assigned employees')
  }
  designationStore.splice(index, 1)
}

export { findDesignation }
