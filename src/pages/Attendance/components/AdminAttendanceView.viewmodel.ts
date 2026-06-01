import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  exportAttendance,
  getAttendance,
  updateAttendance,
} from '../../../api/attendance.api'
import { getDepartments } from '../../../api/departments.api'
import { useDebounce } from '../../../hooks/useDebounce'
import { useNotificationStore } from '../../../store/notificationStore'
import type { AttendanceEditInput, AttendanceRecord, AttendanceStatus } from '../../../types/attendance.types'

export function useAdminAttendanceViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus | ''>('')
  const [page, setPage] = useState(1)
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const { data, isLoading } = useQuery({
    queryKey: [
      'attendance',
      'admin',
      selectedMonth,
      selectedYear,
      debouncedSearch,
      selectedDepartment,
      selectedStatus,
      page,
    ],
    queryFn: () =>
      getAttendance({
        month: selectedMonth,
        year: selectedYear,
        search: debouncedSearch || undefined,
        departmentId: selectedDepartment || undefined,
        status: selectedStatus || undefined,
        page,
        perPage: 20,
      }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AttendanceEditInput }) =>
      updateAttendance(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendance'] })
      addNotification('success', 'Attendance record updated')
      setEditingRecord(null)
    },
  })

  const exportMutation = useMutation({
    mutationFn: () =>
      exportAttendance({
        month: selectedMonth,
        year: selectedYear,
        departmentId: selectedDepartment || undefined,
      }),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `attendance-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`
      link.click()
      URL.revokeObjectURL(url)
      addNotification('success', 'Attendance exported successfully')
    },
  })

  const setMonth = (month: number) => {
    setSelectedMonth(month)
    setPage(1)
  }

  const setYear = (year: number) => {
    setSelectedYear(year)
    setPage(1)
  }

  const handleSearchChange = (q: string) => {
    setSearchQuery(q)
    setPage(1)
  }

  const handleDepartmentChange = (id: string) => {
    setSelectedDepartment(id)
    setPage(1)
  }

  const handleStatusChange = (status: AttendanceStatus | '') => {
    setSelectedStatus(status)
    setPage(1)
  }

  return {
    records: data?.data ?? [],
    summary: data?.summary,
    isLoading,
    selectedMonth,
    selectedYear,
    setMonth,
    setYear,
    searchQuery,
    setSearchQuery: handleSearchChange,
    selectedDepartment,
    setSelectedDepartment: handleDepartmentChange,
    selectedStatus,
    setSelectedStatus: handleStatusChange,
    departments,
    page,
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    start: data?.total ? (page - 1) * (data.perPage ?? 20) + 1 : 0,
    end: Math.min(page * (data?.perPage ?? 20), data?.total ?? 0),
    onPageChange: setPage,
    editingRecord,
    openEditModal: setEditingRecord,
    closeEditModal: () => setEditingRecord(null),
    onSaveEdit: (formData: AttendanceEditInput) => {
      if (editingRecord) {
        updateMutation.mutate({ id: editingRecord.id, data: formData })
      }
    },
    isSaving: updateMutation.isPending,
    onExport: () => exportMutation.mutate(),
    isExporting: exportMutation.isPending,
  }
}
