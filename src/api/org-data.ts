import type { Department } from '../types/department.types'
import type { Designation } from '../types/designation.types'
import type { DepartmentOption, DesignationOption } from '../types/employee.types'
import { filterByCompany, getActiveCompanyIdSync } from '../utils/company-context.utils'

export const departmentStore: Department[] = [
  {
    id: 'dept-1',
    companyId: 'co-1',
    name: 'Engineering',
    description: 'Product development and engineering teams',
    headEmployee: { id: 'emp-2', name: 'Sarah Chen' },
    employeeCount: 0,
    createdAt: '2020-01-10',
  },
  {
    id: 'dept-2',
    companyId: 'co-1',
    name: 'HR',
    description: 'Human resources and people operations',
    headEmployee: { id: 'emp-4', name: 'Emily Davis' },
    employeeCount: 0,
    createdAt: '2020-01-10',
  },
  {
    id: 'dept-3',
    companyId: 'co-1',
    name: 'Marketing',
    description: 'Brand, growth, and marketing campaigns',
    employeeCount: 0,
    createdAt: '2020-03-15',
  },
  {
    id: 'dept-4',
    companyId: 'co-1',
    name: 'Finance',
    description: 'Accounting, payroll, and financial planning',
    employeeCount: 0,
    createdAt: '2020-02-01',
  },
  {
    id: 'dept-5',
    companyId: 'co-1',
    name: 'Design',
    description: 'Product and visual design',
    employeeCount: 0,
    createdAt: '2021-06-20',
  },
  {
    id: 'dept-co2-1',
    companyId: 'co-2',
    name: 'Engineering',
    description: 'Acme product engineering',
    employeeCount: 0,
    createdAt: '2025-06-01',
  },
  {
    id: 'dept-co2-2',
    companyId: 'co-2',
    name: 'Sales',
    description: 'Revenue and customer acquisition',
    employeeCount: 0,
    createdAt: '2025-06-01',
  },
]

export const designationStore: Designation[] = [
  {
    id: 'des-1',
    companyId: 'co-1',
    name: 'Software Engineer',
    department: { id: 'dept-1', name: 'Engineering' },
    employeeCount: 0,
    createdAt: '2020-01-10',
  },
  {
    id: 'des-2',
    companyId: 'co-1',
    name: 'Senior Developer',
    department: { id: 'dept-1', name: 'Engineering' },
    employeeCount: 0,
    createdAt: '2020-01-10',
  },
  {
    id: 'des-3',
    companyId: 'co-1',
    name: 'HR Manager',
    department: { id: 'dept-2', name: 'HR' },
    employeeCount: 0,
    createdAt: '2020-01-10',
  },
  {
    id: 'des-4',
    companyId: 'co-1',
    name: 'Recruiter',
    department: { id: 'dept-2', name: 'HR' },
    employeeCount: 0,
    createdAt: '2020-04-01',
  },
  {
    id: 'des-5',
    companyId: 'co-1',
    name: 'Marketing Lead',
    department: { id: 'dept-3', name: 'Marketing' },
    employeeCount: 0,
    createdAt: '2020-03-15',
  },
  {
    id: 'des-6',
    companyId: 'co-1',
    name: 'Accountant',
    department: { id: 'dept-4', name: 'Finance' },
    employeeCount: 0,
    createdAt: '2020-02-01',
  },
  {
    id: 'des-7',
    companyId: 'co-1',
    name: 'UI Designer',
    department: { id: 'dept-5', name: 'Design' },
    employeeCount: 0,
    createdAt: '2021-06-20',
  },
  {
    id: 'des-co2-1',
    companyId: 'co-2',
    name: 'Engineer',
    department: { id: 'dept-co2-1', name: 'Engineering' },
    employeeCount: 0,
    createdAt: '2025-06-01',
  },
  {
    id: 'des-co2-2',
    companyId: 'co-2',
    name: 'Sales Representative',
    department: { id: 'dept-co2-2', name: 'Sales' },
    employeeCount: 0,
    createdAt: '2025-06-01',
  },
]

export function getDepartmentOptions(companyId = getActiveCompanyIdSync()): DepartmentOption[] {
  return filterByCompany(departmentStore, companyId).map((d) => ({ id: d.id, name: d.name }))
}

export function getDesignationOptions(companyId = getActiveCompanyIdSync()): DesignationOption[] {
  return filterByCompany(designationStore, companyId).map((d) => ({
    id: d.id,
    name: d.name,
    departmentId: d.department?.id,
  }))
}

export function findDepartment(id: string, companyId = getActiveCompanyIdSync()): Department | undefined {
  return filterByCompany(departmentStore, companyId).find((d) => d.id === id)
}

export function findDesignation(id: string, companyId = getActiveCompanyIdSync()): Designation | undefined {
  return filterByCompany(designationStore, companyId).find((d) => d.id === id)
}

export function getDepartmentsForCompany(companyId = getActiveCompanyIdSync()): Department[] {
  return filterByCompany(departmentStore, companyId)
}

export function getDesignationsForCompany(companyId = getActiveCompanyIdSync()): Designation[] {
  return filterByCompany(designationStore, companyId)
}
