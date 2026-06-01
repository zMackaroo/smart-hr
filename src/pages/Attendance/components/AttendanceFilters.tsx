import { Search } from 'lucide-react'
import type { AttendanceStatus } from '../../../types/attendance.types'
import type { Department } from '../../../types/department.types'

interface AttendanceFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  selectedDepartment: string
  onDepartmentChange: (value: string) => void
  selectedStatus: AttendanceStatus | ''
  onStatusChange: (value: AttendanceStatus | '') => void
  selectedMonth: number
  selectedYear: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  departments: Department[]
  showEmployeeSearch?: boolean
}

const STATUS_OPTIONS: Array<{ value: AttendanceStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'holiday', label: 'Holiday' },
]

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

export function AttendanceFilters({
  searchQuery,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  departments,
  showEmployeeSearch = true,
}: AttendanceFiltersProps) {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

  return (
    <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center">
      {showEmployeeSearch && (
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
      )}
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
        onChange={(e) => onStatusChange(e.target.value as AttendanceStatus | '')}
        className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.label} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      >
        {MONTHS.map((label, index) => (
          <option key={label} value={index + 1}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  )
}

export function MonthYearPicker({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: {
  selectedMonth: number
  selectedYear: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}) {
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      >
        {months.map((label, index) => (
          <option key={label} value={index + 1}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="h-10 rounded-md border border-border bg-surface px-3 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  )
}
