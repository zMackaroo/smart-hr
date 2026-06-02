import { Button } from '../../../components/ui/Button'
import { Select, selectTriggerClassName } from '../../../components/ui/Select'
import type { Department } from '../../../types/department.types'
import {
  REPORT_FILTER_CONFIG,
  type ReportFilter,
  type ReportType,
} from '../../../types/report.types'

interface ReportFiltersProps {
  reportType: ReportType
  filters: ReportFilter
  departments: Department[]
  employees: Array<{ id: string; name: string }>
  projects: Array<{ id: string; name: string }>
  isLoading: boolean
  onChange: (filters: ReportFilter) => void
  onApply: () => void
}

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const EMPLOYEE_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'terminated', label: 'Terminated' },
]

const ATTENDANCE_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'holiday', label: 'Holiday' },
]

const LEAVE_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

const EXPENSE_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'reimbursed', label: 'Reimbursed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const TASK_STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
  { value: 'blocked', label: 'Blocked' },
]

export function ReportFilters({
  reportType,
  filters,
  departments,
  employees,
  projects,
  isLoading,
  onChange,
  onApply,
}: ReportFiltersProps) {
  const config = REPORT_FILTER_CONFIG[reportType]

  const update = (patch: Partial<ReportFilter>) => onChange({ ...filters, ...patch })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const statusOptions =
    reportType === 'attendance'
      ? ATTENDANCE_STATUS_OPTIONS
      : reportType === 'leave'
        ? LEAVE_STATUS_OPTIONS
        : reportType === 'expense'
          ? EXPENSE_STATUS_OPTIONS
          : reportType === 'task'
            ? TASK_STATUS_OPTIONS
            : EMPLOYEE_STATUS_OPTIONS

  return (
    <div className="flex flex-wrap items-end gap-3">
      {config.includes('month') && (
        <Select
          label="Month"
          value={String(filters.month ?? 1)}
          onChange={(value) => update({ month: Number(value) })}
          options={MONTHS.map((name, index) => ({
            value: String(index + 1),
            label: name,
          }))}
          searchable={false}
          className="min-w-[9rem]"
        />
      )}

      {config.includes('year') && (
        <Select
          label="Year"
          value={String(filters.year ?? currentYear)}
          onChange={(value) => update({ year: Number(value) })}
          options={years.map((year) => ({ value: String(year), label: String(year) }))}
          searchable={false}
          className="min-w-[7rem]"
        />
      )}

      {config.includes('dateFrom') && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Date From</label>
          <input
            type="date"
            className={selectTriggerClassName}
            value={filters.dateFrom ?? ''}
            onChange={(e) => update({ dateFrom: e.target.value })}
          />
        </div>
      )}

      {config.includes('dateTo') && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Date To</label>
          <input
            type="date"
            className={selectTriggerClassName}
            value={filters.dateTo ?? ''}
            onChange={(e) => update({ dateTo: e.target.value })}
          />
        </div>
      )}

      {config.includes('departmentId') && (
        <Select
          label="Department"
          value={filters.departmentId ?? ''}
          onChange={(value) => update({ departmentId: value || undefined })}
          options={[
            { value: '', label: 'All Departments' },
            ...departments.map((department) => ({
              value: department.id,
              label: department.name,
            })),
          ]}
          placeholder="All Departments"
          className="min-w-[11rem]"
        />
      )}

      {config.includes('status') && (
        <Select
          label="Status"
          value={filters.status ?? ''}
          onChange={(value) => update({ status: value || undefined })}
          options={statusOptions}
          placeholder="All Statuses"
          searchable={false}
          className="min-w-[10rem]"
        />
      )}

      {config.includes('projectId') && (
        <Select
          label="Project"
          value={filters.projectId ?? ''}
          onChange={(value) => update({ projectId: value || undefined })}
          options={[
            { value: '', label: 'All Projects' },
            ...projects.map((project) => ({ value: project.id, label: project.name })),
          ]}
          placeholder="All Projects"
          className="min-w-[11rem]"
        />
      )}

      {config.includes('employeeId') && (
        <Select
          label="Employee"
          value={filters.employeeId ?? ''}
          onChange={(value) => update({ employeeId: value || undefined })}
          options={[
            { value: '', label: 'All Users' },
            ...employees.map((employee) => ({ value: employee.id, label: employee.name })),
          ]}
          placeholder="All Users"
          className="min-w-[11rem]"
        />
      )}

      <Button onClick={onApply} disabled={isLoading}>
        Apply Filters
      </Button>
    </div>
  )
}
