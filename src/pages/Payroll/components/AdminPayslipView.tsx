import { Check, Download, Eye, Search } from 'lucide-react'
import { PermissionGate } from '../../../components/shared/PermissionGate'
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select'
import { EmployeePagination } from '../../Employees/components/EmployeePagination'
import { MonthYearPicker } from '../../Attendance/components/AttendanceFilters'
import { formatCurrency } from '../../../utils/currency.utils'
import type { PayslipStatus } from '../../../types/payroll.types'
import { PayslipDetailModal } from './PayslipDetailModal'
import { PayslipStatusBadge } from './PayslipStatusBadge'
import { useAdminPayslipViewModel } from './AdminPayslipView.viewmodel'

const STATUS_OPTIONS: Array<{ value: PayslipStatus | ''; label: string }> = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'processed', label: 'Processed' },
  { value: 'paid', label: 'Paid' },
]

export function AdminPayslipView() {
  const vm = useAdminPayslipViewModel()

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <MonthYearPicker
          selectedMonth={vm.selectedMonth}
          selectedYear={vm.selectedYear}
          onMonthChange={vm.setMonth}
          onYearChange={vm.setYear}
        />
        <PermissionGate module="payroll" action="edit">
          <Button variant="outline" onClick={vm.openGenerateModal} disabled={vm.isGenerating}>
            {vm.isGenerating ? 'Generating...' : 'Generate Payslips'}
          </Button>
        </PermissionGate>
        <PermissionGate module="payroll" action="view">
          <Button variant="outline" onClick={vm.onExport} disabled={vm.isExporting}>
            <Download className="mr-2 h-4 w-4" />
            {vm.isExporting ? 'Exporting...' : 'Export CSV'}
          </Button>
        </PermissionGate>
      </div>

      <div className="mb-6 flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={vm.searchQuery}
            onChange={(e) => vm.setSearchQuery(e.target.value)}
            placeholder="Search employees..."
            className="h-10 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm"
          />
        </div>
        <Select
          value={vm.selectedDepartment}
          onChange={vm.setSelectedDepartment}
          placeholder="All Departments"
          className="lg:w-52"
          options={[
            { value: '', label: 'All Departments' },
            ...vm.departments.map((d) => ({ value: d.id, label: d.name })),
          ]}
        />
        <Select
          value={vm.selectedStatus}
          onChange={(value) => vm.setSelectedStatus(value as PayslipStatus | '')}
          options={STATUS_OPTIONS}
          placeholder="All Statuses"
          searchable={false}
          className="lg:w-44"
        />
      </div>

      {vm.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-alt" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/70 bg-surface shadow-card">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
                <th className="px-5 py-3">Employee</th>
                <th className="px-5 py-3">Pay Period</th>
                <th className="px-5 py-3">Gross Pay</th>
                <th className="px-5 py-3">Deductions</th>
                <th className="px-5 py-3">Net Pay</th>
                <th className="px-5 py-3">PF (Emp)</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vm.payslips.map((payslip) => (
                <tr
                  key={payslip.id}
                  className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
                >
                  <td className="px-5 py-3.5 text-sm font-medium text-primary">
                    {payslip.employee.name}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-secondary">{payslip.payPeriod.label}</td>
                  <td className="px-5 py-3.5 text-sm font-mono text-primary">
                    {formatCurrency(payslip.grossPay)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-secondary">
                    {formatCurrency(payslip.totalDeductions)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono font-medium text-primary">
                    {formatCurrency(payslip.netPay)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono text-secondary">
                    {formatCurrency(payslip.pfEmployeeContribution)}
                  </td>
                  <td className="px-5 py-3.5">
                    <PayslipStatusBadge status={payslip.status} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => vm.openDetailModal(payslip)}
                        className="rounded-md p-2 text-secondary hover:text-primary"
                        aria-label="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => vm.onDownload(payslip.id)}
                        className="rounded-md p-2 text-secondary hover:text-primary"
                        aria-label="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {payslip.status === 'processed' && (
                        <button
                          type="button"
                          onClick={() => vm.onMarkPaid(payslip.id)}
                          className="rounded-md p-2 text-secondary hover:text-success"
                          aria-label="Mark paid"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                    </div>
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
        start={vm.total === 0 ? 0 : (vm.page - 1) * 20 + 1}
        end={Math.min(vm.page * 20, vm.total)}
        total={vm.total}
        onPageChange={vm.onPageChange}
      />

      <PayslipDetailModal
        payslip={vm.selectedPayslip}
        isOpen={Boolean(vm.selectedPayslip)}
        isAdmin
        isSubmitting={vm.isMarkingPaid}
        onClose={vm.closeDetailModal}
        onDownload={vm.onDownload}
        onMarkPaid={vm.onMarkPaid}
      />

      <ConfirmDialog
        isOpen={vm.isGenerateOpen}
        onClose={vm.closeGenerateModal}
        onConfirm={vm.onGenerate}
        title="Generate Payslips"
        message={`Generate payslips for ${vm.selectedMonth}/${vm.selectedYear} for all active employees?`}
        confirmLabel="Generate"
        isLoading={vm.isGenerating}
      />
    </>
  )
}
