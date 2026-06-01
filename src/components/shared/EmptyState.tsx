import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg bg-surface p-12 text-center shadow-card',
        className,
      )}
    >
      <Icon className="mb-4 h-16 w-16 text-muted" />
      <h3 className="text-lg font-semibold text-primary">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-secondary">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
