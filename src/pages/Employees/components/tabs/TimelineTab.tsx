import { format, parseISO } from 'date-fns'
import type { EmployeeDetail } from '../../../../types/employee.types'
import { cn } from '../../../../utils/cn'

interface TimelineTabProps {
  timeline: EmployeeDetail['timeline']
}

const typeColors: Record<EmployeeDetail['timeline'][number]['type'], string> = {
  joined: 'bg-success',
  promoted: 'bg-info',
  transferred: 'bg-warning',
  left: 'bg-error',
  other: 'bg-muted',
}

export function TimelineTab({ timeline }: TimelineTabProps) {
  const sorted = [...timeline].sort(
    (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime(),
  )

  return (
    <div>
      <h3 className="mb-6 text-base font-semibold text-primary">Employment Timeline</h3>
      <ol className="relative space-y-0 border-l border-border pl-6">
        {sorted.map((event) => (
          <li key={event.id} className="relative pb-8 last:pb-0">
            <span
              className={cn(
                'absolute -left-[25px] flex h-3 w-3 rounded-full ring-4 ring-surface',
                typeColors[event.type],
              )}
            />
            <p className="text-sm font-semibold text-primary">{event.event}</p>
            {event.description && (
              <p className="mt-1 text-sm text-secondary">{event.description}</p>
            )}
            <p className="mt-1 text-xs text-muted">{format(parseISO(event.date), 'MMM d, yyyy')}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
