import type { Department } from '../types/department.types'
import type { Designation } from '../types/designation.types'
import type { DepartmentOption, DesignationOption } from '../types/employee.types'

export const departmentStore: Department[] = [
  {
    id: 'dept-1',
    name: 'Engineering',
    description: 'Product development and engineering teams',
    headEmployee: { id: 'emp-2', name: 'Sarah Chen' },
    employeeCount: 0,
    createdAt: '2020-01-10',
  },
  {
    id: 'dept-2',
    name: 'HR',
    description: 'Human resources and people operations',
    headEmployee: { id: 'emp-4', name: 'Emily Davis' },
    employeeCount: 0,
    createdAt: '2020-01-10',
  },
  {
    id: 'dept-3',
    name: 'Marketing',
    description: 'Brand, growth, and marketing campaigns',
    employeeCount: 0,
    createdAt: '2020-03-15',
  },
  {
    id: 'dept-4',
    name: 'Finance',
    description: 'Accounting, payroll, and financial planning',
    employeeCount: 0,
    createdAt: '2020-02-01',
  },
  {
    id: 'dept-5',
    name: 'Design',
    description: 'Product and visual design',
    employeeCount: 0,
    createdAt: '2021-06-20',
  },
]

export const designationStore: Designation[] = [
  {
    id: 'des-1',
    name: 'Software Engineer',
    department: { id: 'dept-1', name: 'Engineering' },
    employeeCount: 0,
    createdAt: '2020-01-10',
  },
  {
    id: 'des-2',
    name: 'Senior Developer',
    department: { id: 'dept-1', name: 'Engineering' },
    employeeCount: 0,
    createdAt: '2020-01-10',
  },
  {
    id: 'des-3',
    name: 'HR Manager',
    department: { id: 'dept-2', name: 'HR' },
    employeeCount: 0,
    createdAt: '2020-01-10',
  },
  {
    id: 'des-4',
    name: 'Recruiter',
    department: { id: 'dept-2', name: 'HR' },
    employeeCount: 0,
    createdAt: '2020-04-01',
  },
  {
    id: 'des-5',
    name: 'Marketing Lead',
    department: { id: 'dept-3', name: 'Marketing' },
    employeeCount: 0,
    createdAt: '2020-03-15',
  },
  {
    id: 'des-6',
    name: 'Accountant',
    department: { id: 'dept-4', name: 'Finance' },
    employeeCount: 0,
    createdAt: '2020-02-01',
  },
  {
    id: 'des-7',
    name: 'UI Designer',
    department: { id: 'dept-5', name: 'Design' },
    employeeCount: 0,
    createdAt: '2021-06-20',
  },
]

export function getDepartmentOptions(): DepartmentOption[] {
  return departmentStore.map((d) => ({ id: d.id, name: d.name }))
}

export function getDesignationOptions(): DesignationOption[] {
  return designationStore.map((d) => ({
    id: d.id,
    name: d.name,
    departmentId: d.department?.id,
  }))
}

export function findDepartment(id: string): Department | undefined {
  return departmentStore.find((d) => d.id === id)
}

export function findDesignation(id: string): Designation | undefined {
  return designationStore.find((d) => d.id === id)
}
