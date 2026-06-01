import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { getDepartments } from '../../api/departments.api'
import { getProjectReportOptions, exportReport, generateReport, getReportDownloadFilename, getReportTypes } from '../../api/reports.api'
import { getEmployeePickerOptions } from '../../api/employees.api'
import { useNotificationStore } from '../../store/notificationStore'
import {
  getDefaultReportFilters,
  type ReportFilter,
  type ReportType,
} from '../../types/report.types'
import { downloadBlob } from '../../utils/pdf.utils'
import {
  buildReportFilterSummary,
  generateReportPdf,
  getReportPdfFilename,
} from '../../utils/report-pdf.utils'

export function useReportsPageViewModel() {
  const queryClient = useQueryClient()
  const addNotification = useNotificationStore((s) => s.addNotification)

  const [selectedReportType, setSelectedReportType] = useState<ReportType | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<ReportFilter>({})
  const [appliedFilters, setAppliedFilters] = useState<ReportFilter>({})
  const [page, setPage] = useState(1)

  const { data: reportTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['report-types'],
    queryFn: getReportTypes,
  })

  const { data: departments = [] } = useQuery({
    queryKey: ['departments'],
    queryFn: () => getDepartments(),
  })

  const employees = getEmployeePickerOptions()
  const projects = getProjectReportOptions()

  const { data: reportData, isLoading: isGenerating } = useQuery({
    queryKey: ['report-data', selectedReportType, appliedFilters, page],
    queryFn: () =>
      generateReport({
        type: selectedReportType!,
        filters: appliedFilters,
        page,
        perPage: 20,
      }),
    enabled: isPreviewModalOpen && Boolean(selectedReportType),
  })

  const exportMutation = useMutation({
    mutationFn: () =>
      exportReport({
        type: selectedReportType!,
        filters: appliedFilters,
      }),
    onSuccess: (blob) => {
      if (!selectedReportType) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = getReportDownloadFilename(selectedReportType)
      link.click()
      URL.revokeObjectURL(url)
      addNotification('success', 'Report exported successfully')
    },
    onError: (error: Error) => addNotification('error', error.message),
  })

  const exportPdfMutation = useMutation({
    mutationFn: async () => {
      if (!selectedReportType) throw new Error('No report selected')

      const report = await generateReport({
        type: selectedReportType,
        filters: appliedFilters,
        page: 1,
        perPage: 100000,
      })

      const filterSummary = buildReportFilterSummary(
        appliedFilters,
        departments,
        employees,
      )

      return {
        blob: generateReportPdf(report, { filterSummary }),
        filename: getReportPdfFilename(report.type),
      }
    },
    onSuccess: ({ blob, filename }) => {
      downloadBlob(blob, filename)
      addNotification('success', 'Report PDF exported successfully')
    },
    onError: (error: Error) =>
      addNotification('error', error.message || 'Failed to generate report PDF'),
  })

  const openPreview = (type: ReportType) => {
    const defaultFilters = getDefaultReportFilters(type)
    setSelectedReportType(type)
    setDraftFilters(defaultFilters)
    setAppliedFilters(defaultFilters)
    setPage(1)
    setIsPreviewModalOpen(true)
  }

  const closePreview = () => {
    setIsPreviewModalOpen(false)
    setSelectedReportType(null)
    setPage(1)
    void queryClient.removeQueries({ queryKey: ['report-data'] })
  }

  const onApplyFilters = () => {
    setAppliedFilters(draftFilters)
    setPage(1)
  }

  const totalPages = reportData ? Math.max(1, Math.ceil(reportData.totalRows / 20)) : 1

  return {
    reportTypes,
    isLoadingTypes,
    selectedReportType,
    isPreviewModalOpen,
    openPreview,
    closePreview,
    reportData,
    isGenerating,
    filters: draftFilters,
    setFilters: setDraftFilters,
    onApplyFilters,
    page,
    totalPages,
    onPageChange: setPage,
    onExport: () => exportMutation.mutate(),
    onExportPdf: () => exportPdfMutation.mutate(),
    isExporting: exportMutation.isPending,
    isExportingPdf: exportPdfMutation.isPending,
    departments,
    employees,
    projects,
  }
}
