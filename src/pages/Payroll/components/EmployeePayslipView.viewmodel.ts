import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { getMyPayslips, getPayslip } from '../../../api/payroll.api'
import { useAuthStore } from '../../../store/authStore'
import { useNotificationStore } from '../../../store/notificationStore'
import type { Payslip } from '../../../types/payroll.types'
import { downloadBlob } from '../../../utils/pdf.utils'
import { generatePayslipPdf, getPayslipPdfFilename } from '../../../utils/payslip-pdf.utils'

export function useEmployeePayslipViewModel() {
  const user = useAuthStore((s) => s.user)
  const addNotification = useNotificationStore((s) => s.addNotification)
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
    mutationFn: async (id: string) => {
      const payslip = await getPayslip(id)
      return {
        blob: generatePayslipPdf(payslip),
        filename: getPayslipPdfFilename(payslip),
      }
    },
    onSuccess: ({ blob, filename }) => {
      downloadBlob(blob, filename)
      addNotification('success', 'Payslip PDF downloaded')
    },
    onError: (error: Error) =>
      addNotification('error', error.message || 'Failed to generate payslip PDF'),
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
    isDownloading: downloadMutation.isPending,
  }
}
