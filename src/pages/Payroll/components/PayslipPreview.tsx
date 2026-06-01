import { formatCurrency } from '../../../utils/currency.utils'
import type { Payslip } from '../../../types/payroll.types'
import { PayslipStatusBadge } from './PayslipStatusBadge'

interface PayslipPreviewProps {
  payslip: Payslip
}

export function PayslipPreview({ payslip }: PayslipPreviewProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-alt/30 p-6">
      <div className="border-b border-border pb-4 text-center">
        <h3 className="text-lg font-bold text-primary">SmartHR Inc.</h3>
        <p className="text-sm text-secondary">Payslip — {payslip.payPeriod.label}</p>
      </div>

      <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <p>
          <span className="text-secondary">Employee: </span>
          <span className="font-medium text-primary">{payslip.employee.name}</span>
        </p>
        <p>
          <span className="text-secondary">Employee ID: </span>
          <span className="font-mono text-primary">{payslip.employee.employeeId}</span>
        </p>
        <p>
          <span className="text-secondary">Department: </span>
          <span className="text-primary">{payslip.employee.department}</span>
        </p>
        <p>
          <span className="text-secondary">Designation: </span>
          <span className="text-primary">{payslip.employee.designation}</span>
        </p>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-secondary">Earnings</h4>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-border/60">
                <td className="py-2 text-secondary">Base Salary</td>
                <td className="py-2 text-right font-mono text-primary">
                  {formatCurrency(payslip.baseSalary)}
                </td>
              </tr>
              {payslip.earnings.map((e) => (
                <tr key={e.id} className="border-b border-border/60">
                  <td className="py-2 text-secondary">{e.label}</td>
                  <td className="py-2 text-right font-mono text-primary">
                    {formatCurrency(e.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase text-secondary">Deductions</h4>
          <table className="w-full text-sm">
            <tbody>
              {payslip.deductions.length === 0 ? (
                <tr>
                  <td className="py-2 text-secondary">None</td>
                  <td className="py-2 text-right font-mono text-primary">—</td>
                </tr>
              ) : (
                payslip.deductions.map((d) => (
                  <tr key={d.id} className="border-b border-border/60">
                    <td className="py-2 text-secondary">{d.label}</td>
                    <td className="py-2 text-right font-mono text-primary">
                      {formatCurrency(d.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 space-y-2 border-t border-border pt-4 text-sm">
        <SummaryRow label="Gross Pay" value={formatCurrency(payslip.grossPay)} />
        <SummaryRow label="Total Deductions" value={formatCurrency(payslip.totalDeductions)} />
        <SummaryRow
          label="PF (Employee)"
          value={formatCurrency(payslip.pfEmployeeContribution)}
        />
        <SummaryRow
          label="PF (Employer)"
          value={formatCurrency(payslip.pfEmployerContribution)}
        />
        <SummaryRow
          label="Net Pay"
          value={formatCurrency(payslip.netPay)}
          highlight
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <PayslipStatusBadge status={payslip.status} />
        {payslip.paymentDate && (
          <p className="text-xs text-secondary">Paid on {payslip.paymentDate}</p>
        )}
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between">
      <span className={highlight ? 'font-semibold text-primary' : 'text-secondary'}>
        {label}
      </span>
      <span className={highlight ? 'font-mono text-lg font-bold text-primary' : 'font-mono text-primary'}>
        {value}
      </span>
    </div>
  )
}
