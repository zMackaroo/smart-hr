import { zodResolver } from '@hookform/resolvers/zod'
import { Download, Pencil } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { UserAvatar } from '../../../components/layout/UserAvatar'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import { EmployeePagination } from '../../Employees/components/EmployeePagination'
import { AttendanceEditSchema, type AttendanceEditInput, type AttendanceRecord, type AttendanceStatus } from '../../../types/attendance.types'
import { formatDate, formatTime } from '../../../utils/date.utils'
import { AttendanceFilters, MonthYearPicker } from './AttendanceFilters'
import { AttendanceStatusBadge } from './AttendanceStatusBadge'
import { AttendanceSummaryCards } from './AttendanceSummaryCards'
import { useAdminAttendanceViewModel } from './AdminAttendanceView.viewmodel'

const STATUS_OPTIONS: Array<{ value: AttendanceStatus; label: string }> = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'holiday', label: 'Holiday' },
]

export function AdminAttendanceView() {
  const vm = useAdminAttendanceViewModel()

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <MonthYearPicker
          selectedMonth={vm.selectedMonth}
          selectedYear={vm.selectedYear}
          onMonthChange={vm.setMonth}
          onYearChange={vm.setYear}
        />
        <Button variant="outline" onClick={vm.onExport} disabled={vm.isExporting}>
          <Download className="mr-2 h-4 w-4" />
          {vm.isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      <AttendanceSummaryCards summary={vm.summary} isLoading={vm.isLoading} />

      <AttendanceFilters
        searchQuery={vm.searchQuery}
        onSearchChange={vm.setSearchQuery}
        selectedDepartment={vm.selectedDepartment}
        onDepartmentChange={vm.setSelectedDepartment}
        selectedStatus={vm.selectedStatus}
        onStatusChange={vm.setSelectedStatus}
        selectedMonth={vm.selectedMonth}
        selectedYear={vm.selectedYear}
        onMonthChange={vm.setMonth}
        onYearChange={vm.setYear}
        departments={vm.departments}
      />

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Check In</th>
                <th className="px-5 py-3">Check Out</th>
                <th className="px-5 py-3">Working Hours</th>
                <th className="px-5 py-3">Overtime</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vm.records.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={record.employeeName}
                        avatarUrl={record.avatarUrl}
                        size="sm"
                      />
                      <div>
                        <p className="text-sm font-medium text-primary">{record.employeeName}</p>
                        <p className="text-xs text-secondary">{record.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {record.checkIn ? formatTime(record.checkIn) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {record.checkOut ? formatTime(record.checkOut) : '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {record.workingHours ?? '—'}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">
                    {record.overtimeHours ?? '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <AttendanceStatusBadge status={record.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => vm.openEditModal(record)}
                      className="rounded-md p-2 text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
                      aria-label={`Edit attendance for ${record.employeeName}`}
                    >
                      <Pencil className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EmployeePagination
        page={vm.page}
        totalPages={vm.totalPages}
        start={vm.start}
        end={vm.end}
        total={vm.total}
        onPageChange={vm.onPageChange}
      />

      <EditAttendanceModal
        record={vm.editingRecord}
        isOpen={Boolean(vm.editingRecord)}
        isSubmitting={vm.isSaving}
        onClose={vm.closeEditModal}
        onSubmit={vm.onSaveEdit}
      />
    </>
  )
}

function EditAttendanceModal({
  record,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  record: AttendanceRecord | null
  isOpen: boolean
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: AttendanceEditInput) => void
}) {
  const form = useForm<AttendanceEditInput>({
    resolver: zodResolver(AttendanceEditSchema),
    defaultValues: {
      checkIn: '',
      checkOut: '',
      status: 'present',
    },
  })

  const { register, handleSubmit, reset } = form

  useEffect(() => {
    if (!isOpen || !record) return
    reset({
      checkIn: record.checkIn ?? '',
      checkOut: record.checkOut ?? '',
      status: record.status,
    })
  }, [isOpen, record, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Attendance"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </>
      }
    >
      {record && (
        <form className="space-y-4">
          <p className="text-sm text-secondary">
            {record.employeeName} — {formatDate(record.date)}
          </p>
          <Input label="Check In" type="time" {...register('checkIn')} />
          <Input label="Check Out" type="time" {...register('checkOut')} />
          <div>
            <label className="mb-1 block text-sm font-medium text-primary">Status</label>
            <select
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm"
              {...register('status')}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </form>
      )}
    </Modal>
  )
}
