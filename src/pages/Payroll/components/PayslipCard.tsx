import { Button } from '../../../components/ui/Button'
import { formatCurrency } from '../../../utils/currency.utils'
import type { Payslip } from '../../../types/payroll.types'
import { PayslipStatusBadge } from './PayslipStatusBadge'

interface PayslipCardProps {
  payslip: Payslip
  onView: (payslip: Payslip) => void
  onDownload: (id: string) => void
}

export function PayslipCard({ payslip, onView, onDownload }: PayslipCardProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-secondary">{payslip.payPeriod.label}</p>
        <PayslipStatusBadge status={payslip.status} />
      </div>
      <p className="mt-3 font-mono text-2xl font-bold text-primary">
        {formatCurrency(payslip.netPay)}
      </p>
      <p className="mt-1 text-xs text-secondary">Net Pay</p>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onView(payslip)}>
          View Details
        </Button>
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onDownload(payslip.id)}>
          Download
        </Button>
      </div>
    </div>
  )
}
