import { Search } from 'lucide-react'
import { Select } from '../../../components/ui/Select'
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
      <Select
        value={selectedDepartment}
        onChange={onDepartmentChange}
        options={[
          { value: '', label: 'All Departments' },
          ...departments.map((dept) => ({ value: dept.id, label: dept.name })),
        ]}
        placeholder="All Departments"
        className="xl:w-52"
      />
      <Select
        value={selectedStatus}
        onChange={(value) => onStatusChange(value as AttendanceStatus | '')}
        options={STATUS_OPTIONS}
        placeholder="All Statuses"
        searchable={false}
        className="xl:w-44"
      />
      <Select
        value={String(selectedMonth)}
        onChange={(value) => onMonthChange(Number(value))}
        options={MONTHS.map((label, index) => ({
          value: String(index + 1),
          label,
        }))}
        searchable={false}
        className="xl:w-40"
      />
      <Select
        value={String(selectedYear)}
        onChange={(value) => onYearChange(Number(value))}
        options={years.map((year) => ({ value: String(year), label: String(year) }))}
        searchable={false}
        className="xl:w-28"
      />
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
      <Select
        value={String(selectedMonth)}
        onChange={(value) => onMonthChange(Number(value))}
        options={months.map((label, index) => ({
          value: String(index + 1),
          label,
        }))}
        searchable={false}
        className="w-24"
      />
      <Select
        value={String(selectedYear)}
        onChange={(value) => onYearChange(Number(value))}
        options={years.map((year) => ({ value: String(year), label: String(year) }))}
        searchable={false}
        className="w-24"
      />
    </div>
  )
}
