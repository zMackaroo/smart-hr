import { formatCurrency } from '../../../utils/currency.utils'
import { formatDate } from '../../../utils/date.utils'
import type { ReportColumn, ReportRow } from '../../../types/report.types'

interface ReportTableProps {
  columns: ReportColumn[]
  rows: ReportRow[]
  isLoading: boolean
}

const CURRENCY_KEYS = ['grossPay', 'deductions', 'netPay', 'netpay', 'salary', 'amount']
const DATE_KEYS = ['date', 'from', 'to', 'joinDate', 'appliedOn', 'paymentDate', 'timestamp']

function formatCell(key: string, value: string | number | null): string {
  if (value === null || value === undefined || value === '') return '—'
  if (CURRENCY_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase())) && typeof value === 'number') {
    return formatCurrency(value)
  }
  if (DATE_KEYS.some((k) => key.toLowerCase().includes(k.toLowerCase())) && typeof value === 'string') {
    if (value.includes('T')) {
      try {
        return formatDate(value.split('T')[0])
      } catch {
        return value
      }
    }
    return formatDate(value)
  }
  return String(value)
}

function alignClass(align: ReportColumn['align']) {
  if (align === 'right') return 'text-right'
  if (align === 'center') return 'text-center'
  return 'text-left'
}

export function ReportTable({ columns, rows, isLoading }: ReportTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-surface-alt" />
        ))}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border/70">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="bg-surface-alt text-left text-xs font-medium uppercase tracking-wide text-secondary">
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 ${alignClass(col.align)}`}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-border last:border-b-0 hover:bg-surface-alt/50"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-sm text-primary ${alignClass(col.align)}`}
                >
                  {formatCell(col.key, row[col.key] ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
