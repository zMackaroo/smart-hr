import { PageHeader } from '../../components/layout/PageHeader'
import { ReportPreviewModal } from './components/ReportPreviewModal'
import { ReportTypeCard } from './components/ReportTypeCard'
import { useReportsPageViewModel } from './ReportsPage.viewmodel'

export function ReportsPage() {
  const vm = useReportsPageViewModel()

  const perPage = 20
  const totalRows = vm.reportData?.totalRows ?? 0
  const start = totalRows === 0 ? 0 : (vm.page - 1) * perPage + 1
  const end = Math.min(vm.page * perPage, totalRows)

  return (
    <>
      <PageHeader
        title="Reports"
        breadcrumbs={[{ label: 'Reports' }, { label: 'All Reports' }]}
      />

      {vm.isLoadingTypes ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vm.reportTypes.map((report) => (
            <ReportTypeCard
              key={report.type}
              report={report}
              onGenerate={vm.openPreview}
            />
          ))}
        </div>
      )}

      <ReportPreviewModal
        isOpen={vm.isPreviewModalOpen}
        reportType={vm.selectedReportType}
        reportData={vm.reportData}
        isGenerating={vm.isGenerating}
        filters={vm.filters}
        departments={vm.departments}
        employees={vm.employees}
        page={vm.page}
        totalPages={vm.totalPages}
        totalRows={totalRows}
        start={start}
        end={end}
        isExporting={vm.isExporting}
        onClose={vm.closePreview}
        onFiltersChange={vm.setFilters}
        onApplyFilters={vm.onApplyFilters}
        onPageChange={vm.onPageChange}
        onExport={vm.onExport}
      />
    </>
  )
}
