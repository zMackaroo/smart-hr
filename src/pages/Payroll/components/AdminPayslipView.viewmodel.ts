import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getDepartments } from '../../../api/departments.api'
import {
  exportPayslips,
  generatePayslips,
  getPayslip,
  getPayslips,
  markPayslipPaid,
} from '../../../api/payroll.api'
import { useDebounce } from '../../../hooks/useDebounce'
import { useNotificationStore } from '../../../store/notificationStore'
import type { Payslip, PayslipStatus } from '../../../types/payroll.types'
import { downloadBlob } from '../../../utils/pdf.utils'
import { generatePayslipPdf, getPayslipPdfFilename } from '../../../utils/payslip-pdf.utils'

export function useAdminPayslipViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<PayslipStatus | ''>('')
  const [page, setPage] = useState(1)
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null)
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)

  const debouncedSearch = useDebounce(searchQuery, 300)

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const { data, isLoading } = useQuery({
    queryKey: [
      'payslips',
      selectedMonth,
      selectedYear,
      debouncedSearch,
      selectedDepartment,
      selectedStatus,
      page,
    ],
    queryFn: () =>
      getPayslips({
        month: selectedMonth,
        year: selectedYear,
        search: debouncedSearch || undefined,
        departmentId: selectedDepartment || undefined,
        status: selectedStatus || undefined,
        page,
        perPage: 20,
      }),
  })

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['payslips'] })

  const generateMutation = useMutation({
    mutationFn: () => generatePayslips({ month: selectedMonth, year: selectedYear }),
    onSuccess: (created) => {
      invalidate()
      addNotification('success', `Generated ${created.length} payslip(s)`)
      setIsGenerateOpen(false)
    },
  })

  const exportMutation = useMutation({
    mutationFn: () =>
      exportPayslips({
        month: selectedMonth,
        year: selectedYear,
        departmentId: selectedDepartment || undefined,
      }),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `payslips-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`
      link.click()
      URL.revokeObjectURL(url)
      addNotification('success', 'Payslips exported')
    },
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

  const markPaidMutation = useMutation({
    mutationFn: markPayslipPaid,
    onSuccess: (updated) => {
      invalidate()
      addNotification('success', 'Payslip marked as paid')
      setSelectedPayslip(updated)
    },
  })

  return {
    payslips: data?.data ?? [],
    isLoading,
    selectedMonth,
    selectedYear,
    setMonth: (m: number) => {
      setSelectedMonth(m)
      setPage(1)
    },
    setYear: (y: number) => {
      setSelectedYear(y)
      setPage(1)
    },
    searchQuery,
    setSearchQuery: (q: string) => {
      setSearchQuery(q)
      setPage(1)
    },
    selectedDepartment,
    setSelectedDepartment: (id: string) => {
      setSelectedDepartment(id)
      setPage(1)
    },
    selectedStatus,
    setSelectedStatus: (s: PayslipStatus | '') => {
      setSelectedStatus(s)
      setPage(1)
    },
    departments,
    page,
    totalPages: data?.totalPages ?? 1,
    total: data?.total ?? 0,
    onPageChange: setPage,
    selectedPayslip,
    openDetailModal: setSelectedPayslip,
    closeDetailModal: () => setSelectedPayslip(null),
    isGenerateOpen,
    openGenerateModal: () => setIsGenerateOpen(true),
    closeGenerateModal: () => setIsGenerateOpen(false),
    onGenerate: () => generateMutation.mutate(),
    onExport: () => exportMutation.mutate(),
    onDownload: (id: string) => downloadMutation.mutate(id),
    onMarkPaid: (id: string) => markPaidMutation.mutate(id),
    isGenerating: generateMutation.isPending,
    isExporting: exportMutation.isPending,
    isDownloading: downloadMutation.isPending,
    isMarkingPaid: markPaidMutation.isPending,
  }
}
