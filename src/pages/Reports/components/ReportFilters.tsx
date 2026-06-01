import { Button } from '../../../components/ui/Button'
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

export function ReportFilters({
  reportType,
  filters,
  departments,
  employees,
  isLoading,
  onChange,
  onApply,
}: ReportFiltersProps) {
  const config = REPORT_FILTER_CONFIG[reportType]
  const selectClass =
    'h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25'

  const update = (patch: Partial<ReportFilter>) => onChange({ ...filters, ...patch })

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const statusOptions =
    reportType === 'attendance'
      ? ATTENDANCE_STATUS_OPTIONS
      : reportType === 'leave'
        ? LEAVE_STATUS_OPTIONS
        : EMPLOYEE_STATUS_OPTIONS

  return (
    <div className="flex flex-wrap items-end gap-3">
      {config.includes('month') && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Month</label>
          <select
            className={selectClass}
            value={filters.month ?? ''}
            onChange={(e) => update({ month: Number(e.target.value) })}
          >
            {MONTHS.map((name, index) => (
              <option key={name} value={index + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>
      )}

      {config.includes('year') && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Year</label>
          <select
            className={selectClass}
            value={filters.year ?? ''}
            onChange={(e) => update({ year: Number(e.target.value) })}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      )}

      {config.includes('dateFrom') && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Date From</label>
          <input
            type="date"
            className={selectClass}
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
            className={selectClass}
            value={filters.dateTo ?? ''}
            onChange={(e) => update({ dateTo: e.target.value })}
          />
        </div>
      )}

      {config.includes('departmentId') && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Department</label>
          <select
            className={selectClass}
            value={filters.departmentId ?? ''}
            onChange={(e) => update({ departmentId: e.target.value || undefined })}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {config.includes('status') && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Status</label>
          <select
            className={selectClass}
            value={filters.status ?? ''}
            onChange={(e) => update({ status: e.target.value || undefined })}
          >
            {statusOptions.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {config.includes('employeeId') && (
        <div>
          <label className="mb-1 block text-xs font-medium text-muted">Employee</label>
          <select
            className={selectClass}
            value={filters.employeeId ?? ''}
            onChange={(e) => update({ employeeId: e.target.value || undefined })}
          >
            <option value="">All Users</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button onClick={onApply} disabled={isLoading}>
        Apply Filters
      </Button>
    </div>
  )
}
