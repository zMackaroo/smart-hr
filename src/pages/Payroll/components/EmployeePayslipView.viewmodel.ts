import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { downloadPayslip, getMyPayslips } from '../../../api/payroll.api'
import { useAuthStore } from '../../../store/authStore'
import type { Payslip } from '../../../types/payroll.types'

export function useEmployeePayslipViewModel() {
  const user = useAuthStore((s) => s.user)
  const employeeId = user?.id ?? ''

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null)

  const { data: payslips = [], isLoading } = useQuery({
    queryKey: ['payslips', 'me', employeeId, selectedMonth, selectedYear],
    queryFn: () => getMyPayslips(employeeId, { month: selectedMonth, year: selectedYear }),
    enabled: Boolean(employeeId),
  })

  const downloadMutation = useMutation({
    mutationFn: downloadPayslip,
    onSuccess: (blob, id) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payslip-${id}.csv`
      link.click()
      URL.revokeObjectURL(url)
    },
  })

  return {
    payslips,
    isLoading,
    selectedMonth,
    selectedYear,
    setMonth: setSelectedMonth,
    setYear: setSelectedYear,
    selectedPayslip,
    openDetailModal: setSelectedPayslip,
    closeDetailModal: () => setSelectedPayslip(null),
    onDownload: (id: string) => downloadMutation.mutate(id),
  }
}
