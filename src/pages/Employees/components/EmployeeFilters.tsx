import { Search } from 'lucide-react'
import type { EmployeeStatus } from '../../../types/employee.types'
import type { DepartmentOption } from '../../../types/employee.types'

interface EmployeeFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedDepartment: string
  onDepartmentChange: (value: string) => void
  selectedStatus: EmployeeStatus | ''
  onStatusChange: (value: EmployeeStatus | '') => void
  departments: DepartmentOption[]
  showing: number
  total: number
}

const STATUS_OPTIONS: Array<{ value: EmployeeStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
]

export function EmployeeFilters({
  searchQuery,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  departments,
  showing,
  total,
}: EmployeeFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search employees..."
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-primary placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </div>
        <select
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value as EmployeeStatus | '')}
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.label} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <p className="text-sm text-secondary">
        Showing {showing} of {total} employees
      </p>
    </div>
  )
}
