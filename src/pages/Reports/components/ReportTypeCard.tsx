import {
  Activity,
  ArrowRight,
  CalendarDays,
  Clock,
  CreditCard,
  Receipt,
  Users,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import type { ReportMeta } from '../../../types/report.types'

interface ReportTypeCardProps {
  report: ReportMeta
  onGenerate: (type: ReportMeta['type']) => void
}

const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Clock,
  CalendarDays,
  Receipt,
  Wallet,
  CreditCard,
  Activity,
}

export function ReportTypeCard({ report, onGenerate }: ReportTypeCardProps) {
  const Icon = ICON_MAP[report.icon] ?? Users

  return (
    <div
      className={`flex flex-col rounded-lg border border-border/70 bg-surface p-5 shadow-card ${
        report.available ? '' : 'opacity-50'
      }`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-5 w-5 text-accent" strokeWidth={1.5} />
        </div>
        {!report.available && (
          <Badge variant="default" className="bg-surface-alt text-muted">
            Coming Soon
          </Badge>
        )}
      </div>

      <h3 className="text-base font-semibold text-primary">{report.title}</h3>
      <p className="mt-2 flex-1 text-sm text-secondary">{report.description}</p>

      {report.available ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-fit"
          onClick={() => onGenerate(report.type)}
        >
          Generate Report
          <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      ) : (
        <p className="mt-4 text-xs text-muted">Available in a future release</p>
      )}
    </div>
  )
}
