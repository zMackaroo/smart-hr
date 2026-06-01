import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  clockIn,
  clockOut,
  getClockStatus,
  getMyAttendance,
} from '../../../api/attendance.api'
import { useAuthStore } from '../../../store/authStore'
import { useNotificationStore } from '../../../store/notificationStore'

export function useEmployeeAttendanceViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)
  const user = useAuthStore((s) => s.user)
  const employeeId = user?.id ?? ''

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())

  const { data: clockStatus, isLoading: isClockLoading } = useQuery({
    queryKey: ['attendance', 'clock', employeeId],
    queryFn: () => getClockStatus(employeeId),
    enabled: Boolean(employeeId),
  })

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', 'me', employeeId, selectedMonth, selectedYear],
    queryFn: () => getMyAttendance({ month: selectedMonth, year: selectedYear, employeeId }),
    enabled: Boolean(employeeId),
  })

  const clockInMutation = useMutation({
    mutationFn: () => clockIn(employeeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendance'] })
      addNotification('success', 'Clocked in successfully')
    },
  })

  const clockOutMutation = useMutation({
    mutationFn: () => clockOut(employeeId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['attendance'] })
      addNotification('success', 'Clocked out successfully')
    },
  })

  return {
    clockStatus,
    records: data?.records ?? [],
    summary: data?.summary,
    isLoading: isLoading || isClockLoading,
    selectedMonth,
    selectedYear,
    setMonth: setSelectedMonth,
    setYear: setSelectedYear,
    onClockIn: () => clockInMutation.mutate(),
    onClockOut: () => clockOutMutation.mutate(),
    isClockingIn: clockInMutation.isPending,
    isClockingOut: clockOutMutation.isPending,
  }
}
