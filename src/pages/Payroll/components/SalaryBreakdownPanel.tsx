import { formatCurrency } from '../../../utils/currency.utils'

interface SalaryBreakdownPanelProps {
  grossSalary: number
  totalDeductions: number
  netSalary: number
}

export function SalaryBreakdownPanel({
  grossSalary,
  totalDeductions,
  netSalary,
}: SalaryBreakdownPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-alt/40 p-4">
      <h4 className="mb-3 text-sm font-semibold text-primary">Salary Preview</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-secondary">Gross Salary</span>
          <span className="font-mono font-medium text-primary">{formatCurrency(grossSalary)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-secondary">Total Deductions</span>
          <span className="font-mono font-medium text-primary">
            {formatCurrency(totalDeductions)}
          </span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="font-semibold text-primary">Net Salary</span>
          <span className="font-mono text-base font-bold text-primary">
            {formatCurrency(netSalary)}
          </span>
        </div>
      </div>
    </div>
  )
}
