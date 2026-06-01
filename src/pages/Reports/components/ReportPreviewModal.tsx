import { Button } from '../../../components/ui/Button'
import { Modal } from '../../../components/ui/Modal'
import { formatDate } from '../../../utils/date.utils'
import { EmployeePagination } from '../../Employees/components/EmployeePagination'
import type { Department } from '../../../types/department.types'
import type { ReportData, ReportFilter, ReportType } from '../../../types/report.types'
import { ReportEmptyState } from './ReportEmptyState'
import { ReportFilters } from './ReportFilters'
import { ReportTable } from './ReportTable'

interface ReportPreviewModalProps {
  isOpen: boolean
  reportType: ReportType | null
  reportData: ReportData | undefined
  isGenerating: boolean
  filters: ReportFilter
  departments: Department[]
  employees: Array<{ id: string; name: string }>
  page: number
  totalPages: number
  totalRows: number
  start: number
  end: number
  isExporting: boolean
  onClose: () => void
  onFiltersChange: (filters: ReportFilter) => void
  onApplyFilters: () => void
  onPageChange: (page: number) => void
  onExport: () => void
}

export function ReportPreviewModal({
  isOpen,
  reportType,
  reportData,
  isGenerating,
  filters,
  departments,
  employees,
  page,
  totalPages,
  totalRows,
  start,
  end,
  isExporting,
  onClose,
  onFiltersChange,
  onApplyFilters,
  onPageChange,
  onExport,
}: ReportPreviewModalProps) {
  if (!reportType) return null

  const title = reportData?.title ?? 'Report Preview'
  const hasData = (reportData?.totalRows ?? 0) > 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="max-w-4xl"
      footer={
        <div className="flex w-full items-center gap-3">
          <p className="mr-auto text-xs text-muted">
            {reportData
              ? `Generated at ${formatDate(reportData.generatedAt.split('T')[0])} ${new Date(reportData.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : ''}
          </p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            onClick={onExport}
            disabled={isExporting || isGenerating || !hasData}
          >
            {isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <ReportFilters
          reportType={reportType}
          filters={filters}
          departments={departments}
          employees={employees}
          isLoading={isGenerating}
          onChange={onFiltersChange}
          onApply={onApplyFilters}
        />

        {!isGenerating && reportData && (
          <p className="text-sm text-secondary">
            Showing {totalRows === 0 ? 0 : start}–{end} of {totalRows} records
          </p>
        )}

        {!isGenerating && reportData && reportData.totalRows === 0 ? (
          <ReportEmptyState />
        ) : (
          <ReportTable
            columns={reportData?.columns ?? []}
            rows={reportData?.rows ?? []}
            isLoading={isGenerating}
          />
        )}

        {!isGenerating && hasData && totalPages > 1 && (
          <EmployeePagination
            page={page}
            totalPages={totalPages}
            start={start}
            end={end}
            total={totalRows}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </Modal>
  )
}
